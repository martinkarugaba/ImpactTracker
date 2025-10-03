#!/usr/bin/env tsx
import "dotenv/config";
import { db } from "../src/lib/db";
import { users, clusters, clusterUsers } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const USER_ID = "vcavkho4CFhVAmsqe_iYr";

async function assignUserToCluster() {
  try {
    console.log(`\n🔍 Checking user: ${USER_ID}...`);

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, USER_ID),
    });

    if (!user) {
      console.error(
        "❌ User not found in database. Run create-missing-user.ts first."
      );
      return { success: false, error: "User not found" };
    }

    console.log("✅ User found:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // List available clusters
    console.log("\n📋 Available clusters:");
    const availableClusters = await db.query.clusters.findMany();

    if (availableClusters.length === 0) {
      console.error("❌ No clusters found in database.");
      console.log("Please create a cluster first in the dashboard.");
      return { success: false, error: "No clusters available" };
    }

    availableClusters.forEach((cluster, index) => {
      console.log(`   ${index + 1}. ${cluster.name} (${cluster.id})`);
    });

    // Check existing cluster assignments
    const existingAssignments = await db.query.clusterUsers.findMany({
      where: eq(clusterUsers.user_id, USER_ID),
      with: {
        cluster: true,
      },
    });

    if (existingAssignments.length > 0) {
      console.log("\n✅ User already assigned to clusters:");
      existingAssignments.forEach(assignment => {
        console.log(
          `   - ${assignment.cluster.name} (role: ${assignment.role})`
        );
      });
      return { success: true, message: "User already assigned to clusters" };
    }

    console.log("\n❌ User not assigned to any cluster yet.");
    console.log("\n⚠️  TO ASSIGN USER TO A CLUSTER:");
    console.log("1. Get the cluster ID from the list above");
    console.log("2. Update line 72 with the cluster ID");
    console.log("3. Update line 73 with the desired role");
    console.log("4. Run this script again");
    console.log("\nPress Ctrl+C to cancel and edit the script.\n");

    // Wait for user to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));

    // CHANGE THESE VALUES:
    const CLUSTER_ID = "REPLACE_WITH_CLUSTER_ID"; // Get from list above
    const ROLE = "user" as const; // Options: 'super_admin', 'cluster_manager', 'organization_admin', 'organization_member', 'user'

    if (CLUSTER_ID === "REPLACE_WITH_CLUSTER_ID") {
      console.log("⚠️  Please edit the script and set the CLUSTER_ID first!");
      return { success: false, error: "Cluster ID not set" };
    }

    // Verify cluster exists
    const cluster = await db.query.clusters.findFirst({
      where: eq(clusters.id, CLUSTER_ID),
    });

    if (!cluster) {
      console.error("❌ Cluster not found:", CLUSTER_ID);
      return { success: false, error: "Invalid cluster ID" };
    }

    // Assign user to cluster
    const [assignment] = await db
      .insert(clusterUsers)
      .values({
        user_id: USER_ID,
        cluster_id: CLUSTER_ID,
        role: ROLE,
      })
      .returning();

    console.log("\n✅ User assigned to cluster successfully:");
    console.log({
      cluster: cluster.name,
      role: assignment.role,
    });

    console.log("\n🎉 Done! User can now access the participants page.");

    return { success: true, assignment };
  } catch (error) {
    console.error("\n❌ Error assigning user to cluster:", error);
    return { success: false, error };
  }
}

// Run the script
assignUserToCluster()
  .then(result => {
    console.log("\n=== RESULT ===");
    console.log(result.success ? "✅ Success" : "❌ Failed");
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
