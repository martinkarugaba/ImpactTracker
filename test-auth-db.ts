import "dotenv/config";
import { db } from "@/lib/db";

export async function testAuthConnection() {
  try {
    console.log("Testing database connection for auth...");
    console.log("Environment variables:");
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "✓ Set" : "✗ Not set"
    );
    console.log(
      "POSTGRES_URL:",
      process.env.POSTGRES_URL ? "✓ Set" : "✗ Not set"
    );

    // Test basic connection
    const testQuery = await db.query.users.findMany({
      limit: 1,
    });

    console.log("✅ Database connection successful");
    console.log("Users in database:", testQuery.length);

    if (testQuery.length > 0) {
      console.log("Sample user:", {
        id: testQuery[0].id,
        email: testQuery[0].email,
        hasPassword: !!testQuery[0].password,
      });
    }

    return { success: true, userCount: testQuery.length };
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return { success: false, error };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAuthConnection()
    .then(result => {
      console.log("Test result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}
