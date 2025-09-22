import { db } from "../src/lib/db";
import { subCounties, countries, districts } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function checkSubCounties() {
  try {
    console.log("🔍 Checking Uganda subcounties in database...");

    // First check Uganda
    const uganda = await db.query.countries.findFirst({
      where: eq(countries.code, "UG"),
    });

    if (!uganda) {
      console.log("❌ Uganda not found");
      return;
    }

    console.log(`✅ Found Uganda: ${uganda.name} (${uganda.code})`);

    // Get total subcounties for Uganda
    const ugandaSubCounties = await db.query.subCounties.findMany({
      where: eq(subCounties.country_id, uganda.id),
      orderBy: (subCounties, { asc }) => [asc(subCounties.name)],
    });

    console.log(`✅ Found ${ugandaSubCounties.length} subcounties for Uganda`);

    // Show first 10 subcounties
    if (ugandaSubCounties.length > 0) {
      console.log("📋 Sample subcounties:");
      ugandaSubCounties.slice(0, 10).forEach((sc, index) => {
        console.log(`  ${index + 1}. ${sc.name} (${sc.code})`);
      });

      if (ugandaSubCounties.length > 10) {
        console.log(
          `  ... and ${ugandaSubCounties.length - 10} more subcounties`
        );
      }
    }

    // Check how many districts have subcounties
    const ugandaDistricts = await db.query.districts.findMany({
      where: eq(districts.country_id, uganda.id),
    });

    console.log(`\n📊 Uganda has ${ugandaDistricts.length} districts`);

    // Count subcounties per district for sample districts
    console.log("\n📈 Checking subcounty distribution across districts...");

    let districtsWithSubCounties = 0;
    let districtsWithoutSubCounties = 0;

    for (const district of ugandaDistricts.slice(0, 10)) {
      const count = await db.query.subCounties.findMany({
        where: eq(subCounties.district_id, district.id),
      });

      console.log(`  ${district.name}: ${count.length} subcounties`);

      if (count.length > 0) {
        districtsWithSubCounties++;
      } else {
        districtsWithoutSubCounties++;
      }
    }

    console.log(`\n📊 Sample Summary (first 10 districts):`);
    console.log(`  Districts with subcounties: ${districtsWithSubCounties}`);
    console.log(
      `  Districts without subcounties: ${districtsWithoutSubCounties}`
    );

    // Check if we need to seed subcounties
    if (ugandaSubCounties.length === 0) {
      console.log("\n❌ No subcounties found! Need to run subcounty seeding.");
    } else if (ugandaSubCounties.length < 1000) {
      console.log(
        `\n⚠️  Found only ${ugandaSubCounties.length} subcounties. Uganda should have around 1600+ subcounties.`
      );
      console.log(
        "   Consider running subcounty seeding to get complete data."
      );
    } else {
      console.log(
        `\n✅ Good subcounty coverage with ${ugandaSubCounties.length} subcounties.`
      );
    }

    return ugandaSubCounties;
  } catch (error) {
    console.error("❌ Error checking Uganda subcounties:", error);
    throw error;
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkSubCounties()
    .then(() => {
      console.log("\n✅ Subcounty check completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("\n❌ Subcounty check failed:", error);
      process.exit(1);
    });
}

export { checkSubCounties };
