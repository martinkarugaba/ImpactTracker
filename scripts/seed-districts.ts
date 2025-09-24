import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";
import { districts as dbDistricts, countries } from "../src/lib/db/schema";
import districts from "ug-locale/districts.json";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from both .env and .env.local files
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seedDistricts() {
  try {
    console.log("Starting districts seeding...");

    // First, get the Uganda country ID
    const [uganda] = await db
      .select()
      .from(countries)
      .where(sql`LOWER(${countries.name}) = 'uganda'`);

    if (!uganda) {
      throw new Error(
        "Uganda country record not found. Please seed countries first."
      );
    }

    console.log("Found Uganda country record");

    // Process districts data
    // Create a map to track code usage
    const codeCount = new Map<string, number>();

    const districtsData = districts.map(
      (district: { name: string; code?: string }) => {
        // Clean the name and format it properly (first letter uppercase, rest lowercase)
        const formattedName = district.name
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Clean name for code generation (remove spaces and special characters)
        const cleanedName = district.name.replace(/[^a-zA-Z]/g, "");

        // Get first, last, and middle letter for the code
        const firstLetter = cleanedName[0];
        const lastLetter = cleanedName[cleanedName.length - 1];
        const middleLetter = cleanedName[Math.floor(cleanedName.length / 2)];

        let baseCode =
          `${uganda.code}-${firstLetter}${middleLetter}${lastLetter}`.toUpperCase();

        // Track the number of times this code has been used
        const count = (codeCount.get(baseCode) || 0) + 1;
        codeCount.set(baseCode, count);

        // If this is not the first occurrence, try different middle letters
        if (count > 1) {
          for (let i = 1; i < cleanedName.length - 1; i++) {
            const altCode =
              `${uganda.code}-${firstLetter}${cleanedName[i]}${lastLetter}`.toUpperCase();
            if (!codeCount.has(altCode)) {
              baseCode = altCode;
              codeCount.set(baseCode, 1);
              break;
            }
          }
        }

        return {
          name: formattedName,
          code: baseCode,
          country_id: uganda.id,
        };
      }
    );

    console.log(`Prepared ${districtsData.length} districts for insertion`);

    // Insert districts in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < districtsData.length; i += BATCH_SIZE) {
      const batch = districtsData.slice(i, i + BATCH_SIZE);
      await db
        .insert(dbDistricts)
        .values(batch)
        .onConflictDoUpdate({
          target: [dbDistricts.code],
          set: {
            name: sql`EXCLUDED.name`,
            updated_at: sql`CURRENT_TIMESTAMP`,
          },
        });
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    console.log("Districts seeding completed successfully");
  } catch (error) {
    console.error("Error seeding districts:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDistricts()
    .then(() => {
      console.log("Districts seeding completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Districts seeding failed:", error);
      process.exit(1);
    });
}

export { seedDistricts };
