import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create postgres connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client with Supabase-optimized configuration
const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for better compatibility
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

// Create the drizzle instance with schema
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Test connection function for debugging
export async function testDbConnection() {
  try {
    await client`SELECT 1 as test`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
