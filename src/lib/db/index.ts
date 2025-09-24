import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Create the drizzle instance with schema
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Test connection function for debugging
export async function testDbConnection() {
  try {
    await sql`SELECT 1 as test`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
