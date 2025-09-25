import "dotenv/config";
import { db } from "./src/lib/db";
import { users } from "./src/lib/db/schema";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";

async function createTestUser() {
  try {
    console.log("Creating test user...");

    // Hash password
    const hashedPassword = await hash("password123", 10);

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        id: nanoid(),
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "super_admin",
      })
      .returning();

    console.log("✅ Test user created successfully:");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    console.log("Role:", user.role);
    console.log("User ID:", user.id);

    return { success: true, user };
  } catch (error) {
    console.error("❌ Failed to create test user:", error);
    return { success: false, error };
  }
}

// Run the script
createTestUser()
  .then(result => {
    console.log("\n=== RESULT ===");
    console.log(result.success ? "✅ Success" : "❌ Failed");
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
