import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
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

let sql: ReturnType<typeof neon>;

try {
  // Configure the Neon client with optimized settings for serverless/Edge runtime
  sql = neon(process.env.DATABASE_URL, {
    fetchOptions: {
      cache: "no-store",
      keepalive: false, // Set to false for serverless environments
    },
    // Remove retry option as it can cause issues in Edge runtime
    fullResults: true,
    arrayMode: false,
  });
} catch (error) {
  console.error("Failed to initialize Neon client:", error);
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
