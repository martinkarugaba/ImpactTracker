#!/usr/bin/env tsx
import "dotenv/config";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  const sql = neon(databaseUrl);

  // Prefer app-local migrations folder; fallback to Drizzle default
  const candidates = [
    path.join(process.cwd(), "src", "lib", "db", "migrations"),
    path.join(process.cwd(), "migrations"),
  ];

  const migrationsDir = candidates.find(dir => fs.existsSync(dir));
  if (!migrationsDir) {
    console.log("No migrations directory found.");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} SQL migrations in ${migrationsDir}`);

  for (const file of files) {
    const full = path.join(migrationsDir, file);
    console.log(`Applying: ${file}`);
    const sqlText = fs.readFileSync(full, "utf8");
    if (!sqlText.trim()) {
      console.log("(empty) skipped");
      continue;
    }
    try {
      // Execute SQL - Neon's query function expects template literals
      // but we have a string, so we create a proper SQL query
      await sql([sqlText] as unknown as TemplateStringsArray);
      console.log(`✓ Applied ${file}`);
    } catch (err) {
      console.error(`✗ Failed ${file}:`, err);
      throw err;
    }
  }

  console.log("All SQL migrations applied.");
}

main().catch(err => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
