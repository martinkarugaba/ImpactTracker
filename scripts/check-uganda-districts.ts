import { db } from "../src/lib/db";
import { countries, districts } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function checkUgandaDistricts() {
  try {
    console.log("🔍 Checking Uganda districts in database...");

    // First, find Uganda
    const uganda = await db.query.countries.findFirst({
      where: eq(countries.code, "UG"),
    });

    if (!uganda) {
      console.log("❌ Uganda not found in countries table");
      return;
    }

    console.log(`✅ Found Uganda: ${uganda.name} (${uganda.code})`);

    // Now get districts for Uganda
    const ugandaDistricts = await db.query.districts.findMany({
      where: eq(districts.country_id, uganda.id),
      orderBy: (districts, { asc }) => [asc(districts.name)],
    });

    console.log(`✅ Found ${ugandaDistricts.length} districts for Uganda:`);

    // Show first 10 districts
    ugandaDistricts.slice(0, 10).forEach((district, index) => {
      console.log(`  ${index + 1}. ${district.name} (${district.code})`);
    });

    if (ugandaDistricts.length > 10) {
      console.log(`  ... and ${ugandaDistricts.length - 10} more districts`);
    }

    return ugandaDistricts;
  } catch (error) {
    console.error("❌ Error checking Uganda districts:", error);
    throw error;
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkUgandaDistricts()
    .then(() => {
      console.log("\n✅ Database check completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("\n❌ Database check failed:", error);
      process.exit(1);
    });
}

export { checkUgandaDistricts };
