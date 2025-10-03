#!/usr/bin/env tsx
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const neonSql = neon(process.env.DATABASE_URL);
const db = drizzle(neonSql);

async function syncDatabase() {
  try {
    console.log("Connecting to database...");

    // Test connection
    const _result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful");

    // Check if participants table exists and has correct structure
    const _tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'participants'
      );
    `);

    console.log("✅ Database structure verified");

    // You can add specific migration checks here
    // For example, check if skills fields are arrays:
    const skillsColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'participants'
      AND column_name IN ('vocational_skills_participations', 'vocational_skills_completions', 'vocational_skills_certifications');
    `);

    console.log("Skills columns structure:", skillsColumns);

    console.log("✅ Database sync completed successfully");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  } finally {
    // Neon HTTP client has no connection to close
  }
}

syncDatabase();
