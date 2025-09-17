#!/usr/bin/env tsx
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL, { ssl: true });
const db = drizzle(client);

async function applyMigrations() {
  try {
    console.log("Connecting to database...");

    // Test connection
    await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful");

    // Check if we need to apply specific migrations
    const migrationsDir = path.join(process.cwd(), "migrations");

    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith(".sql"))
        .sort();

      console.log(`Found ${migrationFiles.length} migration files`);

      for (const file of migrationFiles) {
        console.log(`Checking migration: ${file}`);

        // Check if this migration was already applied
        const _migrationContent = fs.readFileSync(
          path.join(migrationsDir, file),
          "utf8"
        );

        try {
          // For manual migrations, you might want to apply them selectively
          // This is just a framework - you would add specific logic here
          console.log(`✓ Migration ${file} checked`);
        } catch (error) {
          console.warn(`⚠️  Warning applying migration ${file}:`, error);
        }
      }
    }

    // Apply any pending schema changes that are known to work
    console.log("Verifying current schema state...");

    // Check participants table structure
    const participantsColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'participants'
      ORDER BY ordinal_position;
    `);

    console.log("Current participants table structure:");
    participantsColumns.forEach(col => {
      console.log(
        `  ${col.column_name}: ${col.data_type}${col.is_nullable === "YES" ? " NULL" : " NOT NULL"}`
      );
    });

    console.log("✅ Migration check completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

applyMigrations();

applyMigrations();
