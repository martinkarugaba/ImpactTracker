import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  decimal,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vslas, vslaMembers } from "@/lib/db/schema";

// Loans table for tracking individual loans
export const vslaLoans = pgTable(
  "vsla_loans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vsla_id: uuid("vsla_id")
      .references(() => vslas.id)
      .notNull(),
    member_id: uuid("member_id")
      .references(() => vslaMembers.id)
      .notNull(),
    loan_amount: integer("loan_amount").notNull(), // Amount in cents
    interest_rate: decimal("interest_rate", { precision: 5, scale: 2 })
      .notNull()
      .default("0.00"), // Percentage
    loan_purpose: text("loan_purpose"),
    loan_date: timestamp("loan_date").notNull().defaultNow(),
    due_date: timestamp("due_date"),
    status: text("status").notNull().default("active"), // active, fully_paid, overdue, defaulted
    total_paid: integer("total_paid").notNull().default(0), // Amount paid so far
    balance_remaining: integer("balance_remaining").notNull(), // Calculated field
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  table => ({
    memberIdIdx: index("idx_vsla_loans_member_id").on(table.member_id),
    vslaIdIdx: index("idx_vsla_loans_vsla_id").on(table.vsla_id),
    statusIdx: index("idx_vsla_loans_status").on(table.status),
  })
);

// Loan payments/installments tracking
export const vslaLoanPayments = pgTable(
  "vsla_loan_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loan_id: uuid("loan_id")
      .references(() => vslaLoans.id)
      .notNull(),
    payment_amount: integer("payment_amount").notNull(), // Amount in cents
    payment_date: timestamp("payment_date").notNull().defaultNow(),
    payment_method: text("payment_method").default("cash"), // cash, mobile_money, bank_transfer
    notes: text("notes"),
    recorded_by: uuid("recorded_by").references(() => vslaMembers.id), // Who recorded this payment
    created_at: timestamp("created_at").defaultNow(),
  },
  table => ({
    loanIdIdx: index("idx_vsla_loan_payments_loan_id").on(table.loan_id),
    paymentDateIdx: index("idx_vsla_loan_payments_date").on(table.payment_date),
  })
);

// Savings contributions tracking
export const vslaSavings = pgTable(
  "vsla_savings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vsla_id: uuid("vsla_id")
      .references(() => vslas.id)
      .notNull(),
    member_id: uuid("member_id")
      .references(() => vslaMembers.id)
      .notNull(),
    amount: integer("amount").notNull(), // Amount in cents
    savings_type: text("savings_type").notNull().default("regular"), // regular, voluntary, special
    contribution_date: timestamp("contribution_date").notNull().defaultNow(),
    notes: text("notes"),
    recorded_by: uuid("recorded_by").references(() => vslaMembers.id), // Who recorded this contribution
    created_at: timestamp("created_at").defaultNow(),
  },
  table => ({
    memberIdIdx: index("idx_vsla_savings_member_id").on(table.member_id),
    vslaIdIdx: index("idx_vsla_savings_vsla_id").on(table.vsla_id),
    contributionDateIdx: index("idx_vsla_savings_date").on(
      table.contribution_date
    ),
  })
);

// VSLA meetings tracking
export const vslaMeetings = pgTable(
  "vsla_meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vsla_id: uuid("vsla_id")
      .references(() => vslas.id)
      .notNull(),
    meeting_date: timestamp("meeting_date").notNull(),
    meeting_type: text("meeting_type").notNull().default("regular"), // regular, special, annual
    location: text("location"),
    agenda: text("agenda"),
    total_savings_collected: integer("total_savings_collected").default(0),
    total_loan_payments_collected: integer(
      "total_loan_payments_collected"
    ).default(0),
    new_loans_issued: integer("new_loans_issued").default(0),
    notes: text("notes"),
    conducted_by: uuid("conducted_by").references(() => vslaMembers.id), // Meeting facilitator
    status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  table => ({
    vslaIdIdx: index("idx_vsla_meetings_vsla_id").on(table.vsla_id),
    meetingDateIdx: index("idx_vsla_meetings_date").on(table.meeting_date),
  })
);

// Meeting attendance tracking
export const vslaMeetingAttendance = pgTable(
  "vsla_meeting_attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meeting_id: uuid("meeting_id")
      .references(() => vslaMeetings.id)
      .notNull(),
    member_id: uuid("member_id")
      .references(() => vslaMembers.id)
      .notNull(),
    attendance_status: text("attendance_status").notNull().default("present"), // present, absent, excused
    arrival_time: timestamp("arrival_time"),
    departure_time: timestamp("departure_time"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
  },
  table => ({
    meetingMemberUnique: unique("meeting_member_unique").on(
      table.meeting_id,
      table.member_id
    ),
    meetingIdIdx: index("idx_vsla_meeting_attendance_meeting_id").on(
      table.meeting_id
    ),
    memberIdIdx: index("idx_vsla_meeting_attendance_member_id").on(
      table.member_id
    ),
  })
);

// Meeting financial transactions (what happened during the meeting)
export const vslaMeetingTransactions = pgTable(
  "vsla_meeting_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meeting_id: uuid("meeting_id")
      .references(() => vslaMeetings.id)
      .notNull(),
    member_id: uuid("member_id")
      .references(() => vslaMembers.id)
      .notNull(),
    transaction_type: text("transaction_type").notNull(), // savings_contribution, loan_payment, loan_disbursement
    amount: integer("amount").notNull(),
    reference_id: uuid("reference_id"), // Could reference vslaSavings, vslaLoanPayments, or vslaLoans
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
  },
  table => ({
    meetingIdIdx: index("idx_vsla_meeting_transactions_meeting_id").on(
      table.meeting_id
    ),
    memberIdIdx: index("idx_vsla_meeting_transactions_member_id").on(
      table.member_id
    ),
  })
);

// Relations
export const vslaLoansRelations = relations(vslaLoans, ({ one, many }) => ({
  vsla: one(vslas, {
    fields: [vslaLoans.vsla_id],
    references: [vslas.id],
  }),
  member: one(vslaMembers, {
    fields: [vslaLoans.member_id],
    references: [vslaMembers.id],
  }),
  payments: many(vslaLoanPayments),
}));

export const vslaLoanPaymentsRelations = relations(
  vslaLoanPayments,
  ({ one }) => ({
    loan: one(vslaLoans, {
      fields: [vslaLoanPayments.loan_id],
      references: [vslaLoans.id],
    }),
    recordedBy: one(vslaMembers, {
      fields: [vslaLoanPayments.recorded_by],
      references: [vslaMembers.id],
    }),
  })
);

export const vslaSavingsRelations = relations(vslaSavings, ({ one }) => ({
  vsla: one(vslas, {
    fields: [vslaSavings.vsla_id],
    references: [vslas.id],
  }),
  member: one(vslaMembers, {
    fields: [vslaSavings.member_id],
    references: [vslaMembers.id],
  }),
  recordedBy: one(vslaMembers, {
    fields: [vslaSavings.recorded_by],
    references: [vslaMembers.id],
  }),
}));

export const vslaMeetingsRelations = relations(
  vslaMeetings,
  ({ one, many }) => ({
    vsla: one(vslas, {
      fields: [vslaMeetings.vsla_id],
      references: [vslas.id],
    }),
    conductedBy: one(vslaMembers, {
      fields: [vslaMeetings.conducted_by],
      references: [vslaMembers.id],
    }),
    attendance: many(vslaMeetingAttendance),
    transactions: many(vslaMeetingTransactions),
  })
);

export const vslaMeetingAttendanceRelations = relations(
  vslaMeetingAttendance,
  ({ one }) => ({
    meeting: one(vslaMeetings, {
      fields: [vslaMeetingAttendance.meeting_id],
      references: [vslaMeetings.id],
    }),
    member: one(vslaMembers, {
      fields: [vslaMeetingAttendance.member_id],
      references: [vslaMembers.id],
    }),
  })
);

export const vslaMeetingTransactionsRelations = relations(
  vslaMeetingTransactions,
  ({ one }) => ({
    meeting: one(vslaMeetings, {
      fields: [vslaMeetingTransactions.meeting_id],
      references: [vslaMeetings.id],
    }),
    member: one(vslaMembers, {
      fields: [vslaMeetingTransactions.member_id],
      references: [vslaMembers.id],
    }),
  })
);

// Type exports
export type VSLALoan = typeof vslaLoans.$inferSelect;
export type NewVSLALoan = typeof vslaLoans.$inferInsert;

export type VSLALoanPayment = typeof vslaLoanPayments.$inferSelect;
export type NewVSLALoanPayment = typeof vslaLoanPayments.$inferInsert;

export type VSLASaving = typeof vslaSavings.$inferSelect;
export type NewVSLASaving = typeof vslaSavings.$inferInsert;

export type VSLAMeeting = typeof vslaMeetings.$inferSelect;
export type NewVSLAMeeting = typeof vslaMeetings.$inferInsert;

export type VSLAMeetingAttendance = typeof vslaMeetingAttendance.$inferSelect;
export type NewVSLAMeetingAttendance =
  typeof vslaMeetingAttendance.$inferInsert;

export type VSLAMeetingTransaction =
  typeof vslaMeetingTransactions.$inferSelect;
export type NewVSLAMeetingTransaction =
  typeof vslaMeetingTransactions.$inferInsert;
