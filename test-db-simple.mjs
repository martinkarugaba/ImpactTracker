import { testDbConnection } from "./src/lib/db/index.js";

async function testConnection() {
  console.log("🔍 Testing database connection...");
  const isConnected = await testDbConnection();

  if (isConnected) {
    console.log("✅ Database connection successful!");
  } else {
    console.log("❌ Database connection failed!");
  }
}

testConnection();
