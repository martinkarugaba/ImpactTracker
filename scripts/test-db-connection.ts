#!/usr/bin/env tsx
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function testConnection() {
  console.log("Testing database connection...");

  const client = postgres(process.env.DATABASE_URL, {
    ssl: {
      rejectUnauthorized: false, // Required for self-signed certificates
    },
    connect_timeout: 10,
    idle_timeout: 0.5,
    max_lifetime: 60 * 30,
  });

  const db = drizzle(client);

  try {
    console.log("Attempting connection...");
    const start = Date.now();

    const result = await db.execute(sql`
      SELECT 
        version() as pg_version,
        current_database() as database_name,
        current_user as username,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);

    const duration = Date.now() - start;

    console.log("✅ Connection successful!");
    console.log(`⏱️  Connection time: ${duration}ms`);
    console.log("Database info:", result[0]);

    // Test a simple query on participants table
    const participantCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM participants
    `);

    console.log(`📊 Participants count: ${participantCount[0].count}`);

    // Check recent participants
    const recentParticipants = await db.execute(sql`
      SELECT id, first_name, last_name, created_at 
      FROM participants 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    console.log("Recent participants:");
    recentParticipants.forEach(p => {
      console.log(`  - ${p.first_name} ${p.last_name} (${p.created_at})`);
    });
  } catch (error) {
    console.error("❌ Connection failed:", error);
    console.error("Error details:", {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      code: (error as { code?: string })?.code,
    });
  } finally {
    await client.end();
  }
}

testConnection();
