import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { users, clusters } from "./schema";

export const exportLogs = pgTable("export_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  cluster_id: uuid("cluster_id").references(() => clusters.id),
  export_type: text("export_type").notNull(), // 'participants', 'trainings', 'vslas', etc.
  export_format: text("export_format").notNull(), // 'csv', 'excel'
  filters_applied: jsonb("filters_applied"), // JSON object of applied filters
  search_term: text("search_term"),
  record_count: integer("record_count").notNull().default(0),
  file_size_bytes: integer("file_size_bytes"),
  export_reason: text("export_reason"), // Optional reason provided by user
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  status: text("status").notNull().default("success"), // 'success', 'failed', 'partial'
  error_message: text("error_message"),
  exported_at: timestamp("exported_at").defaultNow().notNull(),
});

export const exportPermissions = pgTable("export_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  permission_type: text("permission_type").notNull(), // 'participants', 'trainings', 'vslas', 'all'
  granted_by: uuid("granted_by")
    .references(() => users.id)
    .notNull(),
  granted_at: timestamp("granted_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"), // Optional expiration
  is_active: text("is_active").notNull().default("yes"),
  notes: text("notes"),
});
