import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { vslas } from "./src/lib/db/schema";

async function checkVSLAs() {
  try {
    console.log("Checking VSLAs in database...");

    const allVSLAs = await db.select().from(vslas);

    console.log(`Total VSLAs in database: ${allVSLAs.length}`);

    if (allVSLAs.length > 0) {
      console.log("\nRecent VSLAs:");
      allVSLAs.slice(-10).forEach(vsla => {
        console.log(
          `- ${vsla.name} (${vsla.code}) - Created: ${vsla.created_at}`
        );
      });
    } else {
      console.log("No VSLAs found in the database.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking VSLAs:", error);
    process.exit(1);
  }
}

checkVSLAs();
