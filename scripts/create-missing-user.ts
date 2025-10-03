#!/usr/bin/env tsx
import "dotenv/config";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

const USER_ID = "vcavkho4CFhVAmsqe_iYr";

async function createMissingUser() {
  try {
    console.log(`\n🔍 Checking for user: ${USER_ID}...`);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, USER_ID),
    });

    if (existingUser) {
      console.log("✅ User already exists in database:");
      console.log({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      });
      return { success: true, message: "User already exists" };
    }

    console.log("❌ User not found in database. Creating user...");
    console.log("\n📝 Please provide user details:");

    // You'll need to provide these details
    // Replace with actual user information
    const userData = {
      id: USER_ID,
      name: "New User", // CHANGE THIS
      email: "user@example.com", // CHANGE THIS
      password: await hash("ChangeMe123!", 10), // CHANGE THIS PASSWORD
      role: "user" as const, // Options: 'super_admin', 'cluster_manager', 'organization_admin', 'organization_member', 'user'
    };

    console.log("\n⚠️  BEFORE RUNNING THIS SCRIPT, UPDATE THE FOLLOWING:");
    console.log("1. Set the correct name in line 31");
    console.log("2. Set the correct email in line 32");
    console.log("3. Set a secure password in line 33");
    console.log("4. Set the correct role in line 34");
    console.log("\nPress Ctrl+C to cancel and edit the script first.\n");

    // Wait a moment for user to cancel if needed
    await new Promise(resolve => setTimeout(resolve, 3000));

    const [newUser] = await db.insert(users).values(userData).returning();

    console.log("\n✅ User created successfully:");
    console.log({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    console.log("\n📌 NEXT STEPS:");
    console.log(
      "1. Assign the user to a cluster using the cluster management UI"
    );
    console.log("2. Or run: pnpm tsx scripts/assign-user-to-cluster.ts");
    console.log("\n🔐 User can now login with:");
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: (the one you set above)`);

    return { success: true, user: newUser };
  } catch (error) {
    console.error("\n❌ Error creating user:", error);
    return { success: false, error };
  }
}

// Run the script
createMissingUser()
  .then(result => {
    console.log("\n=== RESULT ===");
    console.log(result.success ? "✅ Success" : "❌ Failed");
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
