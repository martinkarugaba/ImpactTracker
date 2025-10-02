import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Initialize Drizzle with Neon HTTP driver
const neonSql = neon(process.env.DATABASE_URL!);
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
