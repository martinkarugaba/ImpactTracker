import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Ensure this code only runs on the server
if (typeof window !== "undefined") {
  throw new Error("Database should only be used on the server side");
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env.local file."
  );
}

let sql: ReturnType<typeof postgres>;

try {
  // Configure Postgres client with appropriate settings
  sql = postgres(process.env.DATABASE_URL, {
    ssl: {
      rejectUnauthorized: false, // Required for self-signed certificates
    },
    max: 20, // Maximum number of connections
    idle_timeout: 20, // Max idle time for connections
    connect_timeout: 10, // Connection timeout in seconds
    prepare: false, // Disable prepared statements for better Supabase compatibility
  });
} catch (error) {
  console.error("Failed to initialize Postgres client:", error);
  throw new Error(
    `Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
  );
}

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
