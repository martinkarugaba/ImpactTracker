"use server";

import { db } from "@/lib/db";
import {
  vslaLoans,
  vslaLoanPayments,
  vslaSavings,
  vslaMeetings,
  vslaMeetingAttendance,
  vslaMeetingTransactions,
} from "../schemas/enhanced-vsla-drizzle";
import { vslaMembers } from "@/lib/db/schema";
import { eq, and, desc, sum, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  NewVSLALoan,
  NewVSLALoanPayment,
  NewVSLASaving,
  NewVSLAMeeting,
  NewVSLAMeetingAttendance,
  NewVSLAMeetingTransaction,
} from "../schemas/enhanced-vsla-drizzle";

// Loan Management Actions
export async function createLoan(data: NewVSLALoan) {
  try {
    // Calculate balance remaining
    const loanData = {
      ...data,
      balance_remaining: data.loan_amount - (data.total_paid || 0),
    };

    const [loan] = await db.insert(vslaLoans).values(loanData).returning();

    // Update member's total loans
    await updateMemberTotalLoans(data.member_id);

    revalidatePath("/dashboard/vslas");
    return { success: true, data: loan };
  } catch (error) {
    console.error("Error creating loan:", error);
    return { success: false, error: "Failed to create loan" };
  }
}

export async function addLoanPayment(data: NewVSLALoanPayment) {
  try {
    const [payment] = await db
      .insert(vslaLoanPayments)
      .values(data)
      .returning();

    // Update loan totals
    const loan = await db
      .select()
      .from(vslaLoans)
      .where(eq(vslaLoans.id, data.loan_id))
      .limit(1);

    if (loan[0]) {
      const newTotalPaid = loan[0].total_paid + data.payment_amount;
      const newBalance = loan[0].loan_amount - newTotalPaid;
      const newStatus = newBalance <= 0 ? "fully_paid" : "active";

      await db
        .update(vslaLoans)
        .set({
          total_paid: newTotalPaid,
          balance_remaining: newBalance,
          status: newStatus,
          updated_at: new Date(),
        })
        .where(eq(vslaLoans.id, data.loan_id));

      // Update member's total loans
      await updateMemberTotalLoans(loan[0].member_id);
    }

    revalidatePath("/dashboard/vslas");
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error adding loan payment:", error);
    return { success: false, error: "Failed to add payment" };
  }
}

export async function getMemberLoans(memberId: string) {
  try {
    const loans = await db
      .select()
      .from(vslaLoans)
      .where(eq(vslaLoans.member_id, memberId))
      .orderBy(desc(vslaLoans.created_at));

    return { success: true, data: loans };
  } catch (error) {
    console.error("Error fetching member loans:", error);
    return { success: false, error: "Failed to fetch loans" };
  }
}

export async function getLoanPayments(loanId: string) {
  try {
    const payments = await db
      .select()
      .from(vslaLoanPayments)
      .where(eq(vslaLoanPayments.loan_id, loanId))
      .orderBy(desc(vslaLoanPayments.payment_date));

    return { success: true, data: payments };
  } catch (error) {
    console.error("Error fetching loan payments:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

// Savings Management Actions
export async function addSavingsContribution(data: NewVSLASaving) {
  try {
    const [saving] = await db.insert(vslaSavings).values(data).returning();

    // Update member's total savings
    await updateMemberTotalSavings(data.member_id);

    revalidatePath("/dashboard/vslas");
    return { success: true, data: saving };
  } catch (error) {
    console.error("Error adding savings contribution:", error);
    return { success: false, error: "Failed to add savings contribution" };
  }
}

export async function getMemberSavings(memberId: string) {
  try {
    const savings = await db
      .select()
      .from(vslaSavings)
      .where(eq(vslaSavings.member_id, memberId))
      .orderBy(desc(vslaSavings.contribution_date));

    return { success: true, data: savings };
  } catch (error) {
    console.error("Error fetching member savings:", error);
    return { success: false, error: "Failed to fetch savings" };
  }
}

// Meeting Management Actions
export async function createMeeting(data: NewVSLAMeeting) {
  try {
    const [meeting] = await db.insert(vslaMeetings).values(data).returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: meeting };
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { success: false, error: "Failed to create meeting" };
  }
}

export async function recordAttendance(data: NewVSLAMeetingAttendance) {
  try {
    const [attendance] = await db
      .insert(vslaMeetingAttendance)
      .values(data)
      .returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: attendance };
  } catch (error) {
    console.error("Error recording attendance:", error);
    return { success: false, error: "Failed to record attendance" };
  }
}

export async function addMeetingTransaction(data: NewVSLAMeetingTransaction) {
  try {
    const [transaction] = await db
      .insert(vslaMeetingTransactions)
      .values(data)
      .returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Error adding meeting transaction:", error);
    return { success: false, error: "Failed to add transaction" };
  }
}

export async function getVSLAMeetings(vslaId: string) {
  try {
    const meetings = await db
      .select()
      .from(vslaMeetings)
      .where(eq(vslaMeetings.vsla_id, vslaId))
      .orderBy(desc(vslaMeetings.meeting_date));

    return { success: true, data: meetings };
  } catch (error) {
    console.error("Error fetching VSLA meetings:", error);
    return { success: false, error: "Failed to fetch meetings" };
  }
}

export async function getMeetingAttendance(meetingId: string) {
  try {
    const attendance = await db
      .select({
        id: vslaMeetingAttendance.id,
        member_id: vslaMeetingAttendance.member_id,
        attendance_status: vslaMeetingAttendance.attendance_status,
        arrival_time: vslaMeetingAttendance.arrival_time,
        departure_time: vslaMeetingAttendance.departure_time,
        notes: vslaMeetingAttendance.notes,
        member_name: sql<string>`${vslaMembers.first_name} || ' ' || ${vslaMembers.last_name}`,
      })
      .from(vslaMeetingAttendance)
      .leftJoin(
        vslaMembers,
        eq(vslaMeetingAttendance.member_id, vslaMembers.id)
      )
      .where(eq(vslaMeetingAttendance.meeting_id, meetingId));

    return { success: true, data: attendance };
  } catch (error) {
    console.error("Error fetching meeting attendance:", error);
    return { success: false, error: "Failed to fetch attendance" };
  }
}

// Helper functions to update member totals
async function updateMemberTotalSavings(memberId: string) {
  try {
    const result = await db
      .select({
        total: sum(vslaSavings.amount),
      })
      .from(vslaSavings)
      .where(eq(vslaSavings.member_id, memberId));

    const totalSavings = Number(result[0]?.total) || 0;

    await db
      .update(vslaMembers)
      .set({
        total_savings: totalSavings,
        updated_at: new Date(),
      })
      .where(eq(vslaMembers.id, memberId));
  } catch (error) {
    console.error("Error updating member total savings:", error);
  }
}

async function updateMemberTotalLoans(memberId: string) {
  try {
    const result = await db
      .select({
        total: sum(vslaLoans.balance_remaining),
      })
      .from(vslaLoans)
      .where(
        and(eq(vslaLoans.member_id, memberId), eq(vslaLoans.status, "active"))
      );

    const totalLoans = Number(result[0]?.total) || 0;

    await db
      .update(vslaMembers)
      .set({
        total_loans: totalLoans,
        updated_at: new Date(),
      })
      .where(eq(vslaMembers.id, memberId));
  } catch (error) {
    console.error("Error updating member total loans:", error);
  }
}

// Analytics and Reports
export async function getVSLAFinancialSummary(vslaId: string) {
  try {
    const [totalSavings] = await db
      .select({
        total: sum(vslaSavings.amount),
      })
      .from(vslaSavings)
      .where(eq(vslaSavings.vsla_id, vslaId));

    const [activeLoans] = await db
      .select({
        total: sum(vslaLoans.balance_remaining),
        count: sql<number>`count(*)`,
      })
      .from(vslaLoans)
      .where(
        and(eq(vslaLoans.vsla_id, vslaId), eq(vslaLoans.status, "active"))
      );

    const [totalLoanPayments] = await db
      .select({
        total: sum(vslaLoanPayments.payment_amount),
      })
      .from(vslaLoanPayments)
      .leftJoin(vslaLoans, eq(vslaLoanPayments.loan_id, vslaLoans.id))
      .where(eq(vslaLoans.vsla_id, vslaId));

    return {
      success: true,
      data: {
        totalSavings: Number(totalSavings?.total) || 0,
        activeLoanBalance: Number(activeLoans?.total) || 0,
        activeLoansCount: Number(activeLoans?.count) || 0,
        totalLoanPayments: Number(totalLoanPayments?.total) || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching VSLA financial summary:", error);
    return { success: false, error: "Failed to fetch financial summary" };
  }
}
