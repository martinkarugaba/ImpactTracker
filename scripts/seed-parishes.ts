import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";
import {
  districts,
  subCounties,
  counties,
  parishes,
} from "../src/lib/db/schema";
import parishesData from "ug-locale/parishes.json";
import subcountiesData from "ug-locale/subcounties.json";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from both .env and .env.local files
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function normalizeSubCountyName(name: string): string[] {
  // Clean the name by removing special characters and converting to lowercase
  const base = name.toLowerCase().replace(/[^a-z]/g, "");

  // Create variations by removing common subcounty suffixes/prefixes
  const variations = [
    base,
    base.replace("subcounty", ""),
    base.replace("sc", ""),
    base.replace("tc", ""),
    base.replace("towncounty", ""),
    base.replace("town", ""),
    base.replace("council", ""),
    base.replace("division", ""),
  ];

  // Filter out duplicates and empty strings
  return [...new Set(variations.filter(v => v))];
}

function generateParishCode(subCountyCode: string, name: string): string {
  // Clean name for code generation (remove spaces and special characters)
  const cleanedName = name.replace(/[^a-zA-Z]/g, "");

  // Get first, middle, and last letter for code generation
  const firstLetter = cleanedName[0];
  const lastLetter = cleanedName[cleanedName.length - 1];
  const middleIndex = Math.floor(cleanedName.length / 2);
  const middleLetter = cleanedName[middleIndex];

  // Return formatted code with subcounty code as prefix
  return `${subCountyCode}-${firstLetter}${middleLetter}${lastLetter}`.toUpperCase();
}

async function seedParishes() {
  try {
    console.log("Starting parishes seeding...");

    // Get all required records
    const subCountyRecords = await db.select().from(subCounties);
    const districtRecords = await db.select().from(districts);
    const countyRecords = await db.select().from(counties);

    console.log(`Found ${subCountyRecords.length} subcounty records`);
    console.log(`Found ${districtRecords.length} district records`);
    console.log(`Found ${countyRecords.length} county records`);

    // Create maps for lookups
    const subCountyMap = new Map();
    subCountyRecords.forEach(subcounty => {
      const variations = normalizeSubCountyName(subcounty.name);
      variations.forEach(variant => {
        subCountyMap.set(variant, subcounty);
      });
      // Also map by ID for direct lookups
      subCountyMap.set(subcounty.id, subcounty);
    });

    console.log(
      "Available subcounties sample:",
      Array.from(subCountyMap.keys()).slice(0, 10).join(", ")
    );

    // Create a mapping between subcounty IDs and their related district/county/country
    const subcountyRelations = new Map();
    for (const subcounty of subCountyRecords) {
      subcountyRelations.set(subcounty.id, {
        district_id: subcounty.district_id,
        county_id: subcounty.county_id,
        country_id: subcounty.country_id,
      });
    }

    // Create mapping from subcounty ID to subcounty record in API data
    const subcountyIdToApiRecord = new Map();
    subcountiesData.forEach((subcounty: { id: string; name: string }) => {
      subcountyIdToApiRecord.set(subcounty.id, subcounty);
    });

    // Log some sample parishes to debug
    console.log("Sample parishes:", parishesData.slice(0, 5));

    // Process parishes data
    const codeCount = new Map<string, number>();
    const usedCodes = new Set<string>();

    const parishesDataForInsertion = parishesData
      .map((parish: { name: string; subcounty: string; id: string }) => {
        // Get subcounty data from subcounty ID
        const subcountyFromApi = subcountyIdToApiRecord.get(parish.subcounty);
        if (!subcountyFromApi) {
          console.warn(
            `Subcounty ID ${parish.subcounty} not found for parish ${parish.name}`
          );
          return null;
        }

        // Find the corresponding subcounty in our database
        // Try all possible normalized variations of the subcounty name
        const normalizedVariations = normalizeSubCountyName(
          subcountyFromApi.name
        );
        let subcounty;

        for (const normalizedName of normalizedVariations) {
          subcounty = subCountyMap.get(normalizedName);
          if (subcounty) break;
        }

        // For logging if subcounty not found
        const normalizedSubcountyName = normalizedVariations[0];

        // Debug logging
        if (!subcounty) {
          console.warn(`Subcounty not found for parish: ${parish.name}`);
          console.warn(
            `Looking for normalized subcounty name: "${normalizedSubcountyName}"`
          );
          return null;
        }

        // Get district, county, and country IDs from subcounty relations
        const relations = subcountyRelations.get(subcounty.id);
        if (!relations) {
          console.warn(`Relations not found for subcounty ID: ${subcounty.id}`);
          return null;
        }

        // Format parish name properly (first letter of each word uppercase, rest lowercase)
        const formattedName = parish.name
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Generate unique code for the parish
        const baseCodePrefix = subcounty.code;
        let baseCode = generateParishCode(baseCodePrefix, formattedName);

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
          sub_county_id: subcounty.id,
          district_id: relations.district_id,
          county_id: relations.county_id,
          country_id: relations.country_id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    console.log(
      `Prepared ${parishesDataForInsertion.length} parishes for insertion`
    );

    // Insert parishes in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < parishesDataForInsertion.length; i += BATCH_SIZE) {
      const batch = parishesDataForInsertion.slice(i, i + BATCH_SIZE);
      await db
        .insert(parishes)
        .values(batch)
        .onConflictDoUpdate({
          target: [parishes.code],
          set: {
            name: sql`EXCLUDED.name`,
            updated_at: sql`CURRENT_TIMESTAMP`,
          },
        });
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    console.log("Parishes seeding completed successfully");
  } catch (error) {
    console.error("Error seeding parishes:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedParishes()
    .then(() => {
      console.log("Parishes seeding completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Parishes seeding failed:", error);
      process.exit(1);
    });
}

export { seedParishes };
