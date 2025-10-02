import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize Neon HTTP client and Drizzle
const neonSql = neon(connectionString);
export const db = drizzle(neonSql, { schema });

// Test connection function for debugging
export async function testDbConnection() {
  try {
    await neonSql`SELECT 1 as test`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
