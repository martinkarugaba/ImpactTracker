import { testDbConnection } from "./src/lib/db/config";

async function main() {
  console.log("Testing database connection using config.ts...");
  console.log("DATABASE_URL is:", process.env.DATABASE_URL ? "Set" : "Not set");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const result = await testDbConnection();

  if (result) {
    console.log("✅ Database connection test passed");
    process.exit(0);
  } else {
    console.error("❌ Database connection test failed");
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Test failed with error:", error);
  process.exit(1);
});
