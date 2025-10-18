import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { activitySessions } from "@/lib/db/schema/activity-sessions";

// Activities table
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations for activities
export const activitiesRelations = relations(activities, ({ many }) => ({
  sessions: many(activitySessions),
}));
