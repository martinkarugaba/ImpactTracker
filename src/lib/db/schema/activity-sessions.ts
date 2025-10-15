import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { activities } from "../schema";

// Enum for session status
export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "completed",
  "cancelled",
  "postponed",
]);

// Activity sessions table
export const activitySessions = pgTable("activity_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  activity_id: uuid("activity_id")
    .references(() => activities.id)
    .notNull(),
  session_date: timestamp("session_date").notNull(),
  session_number: text("session_number").notNull(),
  title: text("title"),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  venue: text("venue"),
  status: sessionStatusEnum("status").default("scheduled"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations for activity sessions
export const activitySessionsRelations = relations(
  activitySessions,
  ({ one }) => ({
    activity: one(activities, {
      fields: [activitySessions.activity_id],
      references: [activities.id],
    }),
  })
);
