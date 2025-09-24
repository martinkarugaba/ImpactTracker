import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";
import { counties, districts, countries } from "../src/lib/db/schema";
import countiesData from "ug-locale/counties.json";
import districtsData from "ug-locale/districts.json";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from both .env and .env.local files
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function normalizeDistrictName(name: string): string[] {
  // Clean the name by removing special characters and converting to lowercase
  const base = name.toLowerCase().replace(/[^a-z]/g, "");

  // Create variations by removing common district suffixes/prefixes
  const variations = [
    base,
    base.replace("district", ""),
    base.replace("municipality", ""),
    base.replace("city", ""),
    base.replace("county", ""),
    base.replace("tc", ""),
    base.replace("towncounty", ""),
  ];

  // Special cases for district name variations
  if (base.includes("kampala")) variations.push("kcca");
  if (base.includes("fortportal")) variations.push("kabarole");
  if (base.includes("fortportal")) variations.push("fortportalcity");
  if (base.includes("arua")) variations.push("aruacity");
  if (base.includes("gulu")) variations.push("gulucity");
  if (base.includes("jinja")) variations.push("jinjacity");
  if (base.includes("lira")) variations.push("liracity");
  if (base.includes("masaka")) variations.push("masakacity");
  if (base.includes("mbale")) variations.push("mbalecity");
  if (base.includes("mbarara")) variations.push("mbararacity");
  if (base.includes("soroti")) variations.push("soroticity");

  // Filter out duplicates and empty strings
  return [...new Set(variations.filter(v => v))];
}

function generateCountyCode(districtCode: string, name: string): string {
  // Remove "County" suffix if present
  let cleanName = name;
  if (cleanName.toLowerCase().endsWith(" county")) {
    cleanName = cleanName.slice(0, -7);
  }

  // Clean name for code generation (remove spaces and special characters)
  const cleanedName = cleanName.replace(/[^a-zA-Z]/g, "");

  // Get first 3 letters for code generation
  const namePrefix = cleanedName.slice(0, 3).toUpperCase();

  return `${districtCode}-${namePrefix}`;
}

async function seedCounties() {
  try {
    console.log("Starting counties seeding...");

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

    // Get all districts
    const districtRecords = await db.select().from(districts);
    if (districtRecords.length === 0) {
      throw new Error("No districts found. Please seed districts first.");
    }

    console.log(`Found ${districtRecords.length} district records`);

    // Create mapping with normalized names
    const districtMap = new Map();
    districtRecords.forEach(district => {
      const variations = normalizeDistrictName(district.name);
      variations.forEach(variant => {
        districtMap.set(variant, district);
      });
    });

    // Create a mapping from district ID to district object using districts.json
    const districtDataById = new Map();
    districtsData.forEach((d: { id: string; name: string }) => {
      districtDataById.set(d.id, d);
    });

    console.log(`Mapped ${districtDataById.size} district IDs to data`);

    // Process counties data
    const codeCount = new Map<string, number>();
    const usedCodes = new Set<string>();

    const countiesDataForInsertion = countiesData
      .map((county: { name: string; district: string; id: string }) => {
        // Get district data from district ID
        const districtData = districtDataById.get(county.district);
        if (!districtData) {
          console.warn(
            `District ID ${county.district} not found for county ${county.name}`
          );
          return null;
        }

        // Find the corresponding district in our database using normalized name
        const normalizedVariations = normalizeDistrictName(districtData.name);
        let district;

        for (const normalizedName of normalizedVariations) {
          district = districtMap.get(normalizedName);
          if (district) break;
        }

        if (!district) {
          console.warn(
            `District not found in database for county: ${county.name}, district: ${districtData.name}`
          );
          return null;
        }

        // Remove the word "County" from the end if present and format name properly
        let cleanName = county.name;
        if (cleanName.toLowerCase().endsWith(" county")) {
          cleanName = cleanName.slice(0, -7); // Remove " County" from the end
          console.log(`Renaming "${county.name}" to "${cleanName}"`);
        }

        // Format county name properly (first letter of each word uppercase, rest lowercase)
        const formattedName = cleanName
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Generate a code using district code + first 3 letters of county name
        let baseCode = generateCountyCode(district.code, county.name);

        // Track the number of times this code has been used
        const count = (codeCount.get(baseCode) || 0) + 1;
        codeCount.set(baseCode, count);

        // If this is not the first occurrence or code is already used, modify the code
        if (count > 1 || usedCodes.has(baseCode)) {
          // Clean name for code generation
          const cleanedName = county.name.replace(/[^a-zA-Z]/g, "");

          // Try different combinations of letters from the name
          let found = false;
          for (let i = 1; i <= cleanedName.length - 3; i++) {
            const newCode = `${district.code}-${cleanedName.substring(i, i + 3).toUpperCase()}`;
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
                `${district.code}-${cleanedName.slice(0, 2).toUpperCase()}${counter}`
              )
            ) {
              counter++;
            }
            baseCode = `${district.code}-${cleanedName.slice(0, 2).toUpperCase()}${counter}`;
          }
        }

        usedCodes.add(baseCode);
        return {
          name: formattedName,
          code: baseCode,
          district_id: district.id,
          country_id: uganda.id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    console.log(
      `Prepared ${countiesDataForInsertion.length} counties for insertion`
    );

    // Insert counties in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < countiesDataForInsertion.length; i += BATCH_SIZE) {
      const batch = countiesDataForInsertion.slice(i, i + BATCH_SIZE);
      await db
        .insert(counties)
        .values(batch)
        .onConflictDoUpdate({
          target: [counties.code],
          set: {
            name: sql`EXCLUDED.name`,
            updated_at: sql`CURRENT_TIMESTAMP`,
          },
        });
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    console.log("Counties seeding completed successfully");
  } catch (error) {
    console.error("Error seeding counties:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedCounties()
    .then(() => {
      console.log("Counties seeding completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Counties seeding failed:", error);
      process.exit(1);
    });
}

export { seedCounties };
