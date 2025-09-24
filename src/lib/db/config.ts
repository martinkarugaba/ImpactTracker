import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Connection options for Supabase
const connectionOptions = {
  ssl: true,
  max: 1, // Limit pool size for serverless
  connect_timeout: 10, // 10 seconds
  idle_timeout: 0.5, // 30 seconds
  max_lifetime: 60 * 30, // 30 minutes
};

const client = postgres(process.env.DATABASE_URL, connectionOptions);
export const db = drizzle(client, { schema });

// Test connection function for debugging
export async function testDbConnection() {
  try {
    await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
