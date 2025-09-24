import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

// Get dirname equivalent in ESM
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export async function runFixUserRoleMigration() {
  try {
    console.log("Starting user_role enum fix migration...");

    // Read the SQL file
    const sqlFilePath = join(__dirname, "fix_user_role.sql");
    const sqlContent = readFileSync(sqlFilePath, "utf8");

    // Execute the SQL using sql template literal
    await db.execute(sql.raw(sqlContent));

    console.log("Successfully fixed user_role enum in database");
    return { success: true };
  } catch (error) {
    console.error("Error fixing user_role enum:", error);
    return { success: false, error };
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === fileURLToPath(process.argv[1])) {
  runFixUserRoleMigration()
    .then(result => {
      if (result.success) {
        console.log("Migration completed successfully");
        process.exit(0);
      } else {
        console.error("Migration failed:", result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("Migration failed with error:", error);
      process.exit(1);
    });
}
