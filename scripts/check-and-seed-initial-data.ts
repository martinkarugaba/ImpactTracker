import "dotenv/config";
import { db } from "../src/lib/db";
import { clusters } from "../src/lib/db/schema";

async function checkAndSeedInitialData() {
  console.log("🔍 Checking database for required data...\n");

  try {
    // Check clusters
    console.log("Checking clusters table...");
    const existingClusters = await db.select().from(clusters);
    console.log(`Found ${existingClusters.length} clusters`);

    if (existingClusters.length === 0) {
      console.log("⚠️  No clusters found! Creating default cluster...");

      const [newCluster] = await db
        .insert(clusters)
        .values({
          name: "Default Cluster",
          about: "Default cluster for initial setup",
          country: "Uganda",
          districts: [],
        })
        .returning();

      console.log("✅ Created default cluster:", newCluster.name);
      console.log("   Cluster ID:", newCluster.id);
    } else {
      console.log("✅ Clusters exist:");
      existingClusters.forEach(cluster => {
        console.log(`   - ${cluster.name} (ID: ${cluster.id})`);
      });
    }

    console.log("\n✅ Database check complete!");
  } catch (error) {
    console.error("❌ Error checking/seeding database:", error);
    process.exit(1);
  }
}

checkAndSeedInitialData()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
