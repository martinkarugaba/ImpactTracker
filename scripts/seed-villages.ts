import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";
import {
  villages,
  parishes,
  subCounties,
  districts,
  counties,
} from "../src/lib/db/schema";
import villagesData from "ug-locale/villages.json";
import parishesData from "ug-locale/parishes.json";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from both .env and .env.local files
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function normalizeParishName(name: string): string[] {
  // Clean the name by removing special characters and converting to lowercase
  const base = name.toLowerCase().replace(/[^a-z]/g, "");

  // Create variations by removing common suffixes/prefixes
  const variations = [
    base,
    base.replace("parish", ""),
    base.replace("ward", ""),
  ];

  // Filter out duplicates and empty strings
  return [...new Set(variations.filter(v => v))];
}

function generateVillageCode(parishCode: string, name: string): string {
  // Clean name for code generation (remove spaces and special characters)
  const cleanedName = name.replace(/[^a-zA-Z]/g, "");

  // Get first, middle, and last letter for code generation
  const firstLetter = cleanedName[0];
  const lastLetter = cleanedName[cleanedName.length - 1];
  const middleIndex = Math.floor(cleanedName.length / 2);
  const middleLetter = cleanedName[middleIndex];

  // Return formatted code with parish code as prefix
  return `${parishCode}-${firstLetter}${middleLetter}${lastLetter}`.toUpperCase();
}

async function seedVillages() {
  try {
    console.log("Starting villages seeding...");

    // Get all required records
    const parishRecords = await db.select().from(parishes);
    const subCountyRecords = await db.select().from(subCounties);
    const districtRecords = await db.select().from(districts);
    const countyRecords = await db.select().from(counties);

    console.log(`Found ${parishRecords.length} parish records`);
    console.log(`Found ${subCountyRecords.length} subcounty records`);
    console.log(`Found ${districtRecords.length} district records`);
    console.log(`Found ${countyRecords.length} county records`);

    // Create maps for lookups
    const parishMap = new Map();
    parishRecords.forEach(parish => {
      const variations = normalizeParishName(parish.name);
      variations.forEach(variant => {
        parishMap.set(variant, parish);
      });
      // Also map by ID
      parishMap.set(parish.id, parish);
    });

    console.log(
      "Available parishes sample:",
      Array.from(parishMap.keys()).slice(0, 10).join(", ")
    );

    // Create a mapping between parish IDs and their related entities
    const parishRelations = new Map();
    for (const parish of parishRecords) {
      parishRelations.set(parish.id, {
        parish_id: parish.id,
        sub_county_id: parish.sub_county_id,
        district_id: parish.district_id,
        county_id: parish.county_id,
        country_id: parish.country_id,
      });
    }

    // Create mapping from parish ID to parish record in API data
    const parishIdToApiRecord = new Map();
    parishesData.forEach((parish: { id: string; name: string }) => {
      parishIdToApiRecord.set(parish.id, parish);
    });

    // Log some sample villages to debug
    console.log("Sample villages:", villagesData.slice(0, 5));

    // Process villages data
    const codeCount = new Map<string, number>();
    const usedCodes = new Set<string>();

    const villagesDataForInsertion = villagesData
      .map((village: { name: string; parish: string; id: string }) => {
        // Get parish data from parish ID
        const parishFromApi = parishIdToApiRecord.get(village.parish);
        if (!parishFromApi) {
          console.warn(
            `Parish ID ${village.parish} not found for village ${village.name}`
          );
          return null;
        }

        // Find the corresponding parish in our database
        // Try all possible normalized variations of the parish name
        const normalizedVariations = normalizeParishName(parishFromApi.name);
        let parish;

        for (const normalizedName of normalizedVariations) {
          parish = parishMap.get(normalizedName);
          if (parish) break;
        }

        // For logging if parish not found
        const normalizedParishName = normalizedVariations[0];

        // Debug logging
        if (!parish) {
          console.warn(`Parish not found for village: ${village.name}`);
          console.warn(
            `Looking for normalized parish name: "${normalizedParishName}"`
          );
          return null;
        }

        // Get higher-level entities from parish relations
        const relations = parishRelations.get(parish.id);
        if (!relations) {
          console.warn(`Relations not found for parish ID: ${parish.id}`);
          return null;
        }

        // Format village name properly (first letter of each word uppercase, rest lowercase)
        const formattedName = village.name
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Generate unique code for the village
        const baseCodePrefix = parish.code;
        let baseCode = generateVillageCode(baseCodePrefix, formattedName);

        // Track the number of times this code has been used
        const count = (codeCount.get(baseCode) || 0) + 1;
        codeCount.set(baseCode, count);

        // If this is not the first occurrence or code is already used, try different letters
        if (count > 1 || usedCodes.has(baseCode)) {
          // Try different letters from the name
          let found = false;
          const cleanedName = formattedName.replace(/[^a-zA-Z]/g, "");

          for (let i = 0; i < cleanedName.length; i++) {
            // Skip first and last letters
            if (i === 0 || i === cleanedName.length - 1) continue;
            const newCode = `${baseCodePrefix}-${cleanedName[0]}${cleanedName[i]}${cleanedName[cleanedName.length - 1]}`;
            if (!usedCodes.has(newCode)) {
              baseCode = newCode;
              found = true;
              break;
            }
          }

          // If still no unique code found, append a number
          if (!found) {
            let counter = 1;
            while (
              usedCodes.has(
                `${baseCodePrefix}-${cleanedName[0]}${counter}${cleanedName[cleanedName.length - 1]}`
              )
            ) {
              counter++;
            }
            baseCode = `${baseCodePrefix}-${cleanedName[0]}${counter}${cleanedName[cleanedName.length - 1]}`;
          }
        }

        usedCodes.add(baseCode);

        return {
          name: formattedName,
          code: baseCode,
          parish_id: parish.id,
          sub_county_id: relations.sub_county_id,
          district_id: relations.district_id,
          county_id: relations.county_id,
          country_id: relations.country_id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    console.log(
      `Prepared ${villagesDataForInsertion.length} villages for insertion`
    );

    // Insert villages in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < villagesDataForInsertion.length; i += BATCH_SIZE) {
      const batch = villagesDataForInsertion.slice(i, i + BATCH_SIZE);
      await db
        .insert(villages)
        .values(batch)
        .onConflictDoUpdate({
          target: [villages.code],
          set: {
            name: sql`EXCLUDED.name`,
            updated_at: sql`CURRENT_TIMESTAMP`,
          },
        });
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    console.log("Villages seeding completed successfully");
  } catch (error) {
    console.error("Error seeding villages:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedVillages()
    .then(() => {
      console.log("Villages seeding completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Villages seeding failed:", error);
      process.exit(1);
    });
}

export { seedVillages };
