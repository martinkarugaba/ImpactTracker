#!/usr/bin/env tsx

import "dotenv/config";
import { db } from "@/lib/db";
import { countries } from "@/lib/db/schema";
import { notInArray } from "drizzle-orm";

async function cleanupNonEastAfricanCountries() {
  try {
    console.log("🔍 Starting cleanup of non-East African countries...");

    // Define East African countries and Ethiopia by ISO codes
    const eastAfricanCountryCodes = ["UG", "KE", "TZ", "RW", "BI", "SS", "ET"];

    // Check existing countries
    const allCountries = await db.select().from(countries);
    console.log(`📊 Found ${allCountries.length} total countries in database`);

    // Find countries that are NOT in our East African list
    const nonEastAfricanCountries = allCountries.filter(
      country => !eastAfricanCountryCodes.includes(country.code)
    );

    console.log(
      `🎯 Found ${nonEastAfricanCountries.length} non-East African countries to remove`
    );

    if (nonEastAfricanCountries.length === 0) {
      console.log(
        "✅ No non-East African countries found. Database is already clean."
      );
      return;
    }

    // Log which countries will be removed
    console.log("📋 Countries to be removed:");
    nonEastAfricanCountries.forEach(country => {
      console.log(`  - ${country.name} (${country.code})`);
    });

    // Remove non-East African countries
    await db
      .delete(countries)
      .where(notInArray(countries.code, eastAfricanCountryCodes));

    console.log(
      `✅ Successfully removed ${nonEastAfricanCountries.length} non-East African countries`
    );

    // Verify remaining countries
    const remainingCountries = await db.select().from(countries);
    console.log(
      `📊 Remaining countries in database: ${remainingCountries.length}`
    );

    console.log("🌍 Remaining countries:");
    remainingCountries.forEach(country => {
      console.log(`  - ${country.name} (${country.code})`);
    });

    console.log("🎉 Cleanup completed successfully!");
  } catch (error) {
    console.error(
      "❌ Error during cleanup:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function main() {
  try {
    await cleanupNonEastAfricanCountries();
    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to cleanup countries:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
