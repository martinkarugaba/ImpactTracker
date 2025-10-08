import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

async function testDatabaseConnection() {
  console.log("🔍 Testing Database Connection\n");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log(
    "DATABASE_URL format:",
    process.env.DATABASE_URL?.substring(0, 20) + "..."
  );

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set!");
    process.exit(1);
  }

  try {
    console.log("\n1️⃣  Testing raw Neon HTTP connection...");
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 as test, current_database() as db`;
    console.log("✅ Raw connection successful!");
    console.log("   Database:", result[0].db);

    console.log("\n2️⃣  Testing Drizzle ORM connection...");
    const db = drizzle(sql, { schema });

    console.log("\n3️⃣  Testing clusters table...");
    const clusters = await db.query.clusters.findMany({ limit: 3 });
    console.log(`✅ Found ${clusters.length} clusters`);
    if (clusters.length > 0) {
      clusters.forEach(c => console.log(`   - ${c.name} (${c.id})`));
    }

    console.log("\n4️⃣  Testing subcounties table...");
    const subcounties = await db.query.subCounties.findMany({ limit: 5 });
    console.log(`✅ Found ${subcounties.length} subcounties`);
    if (subcounties.length > 0) {
      subcounties.forEach(s => console.log(`   - ${s.name} (${s.code})`));
    }

    console.log("\n5️⃣  Testing users table...");
    const users = await db.query.users.findMany({ limit: 3 });
    console.log(`✅ Found ${users.length} users`);

    console.log("\n✅ All database tests passed!");
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error:", error);
    process.exit(1);
  }
}

testDatabaseConnection()
  .then(() => {
    console.log("\n✨ Test complete!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
