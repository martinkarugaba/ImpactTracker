#!/usr/bin/env tsx
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function debugInterventions() {
  console.log("🔍 Debugging interventions data...");

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  try {
    console.log("Checking activityParticipants table...");

    const apCountResult = await sql`
      SELECT COUNT(*) as count FROM activity_participants
    `;
    const apCount = Number(apCountResult[0].count);
    console.log(`📊 Total activityParticipants records: ${apCount}`);

    const apAttendedResult = await sql`
      SELECT COUNT(*) as count FROM activity_participants
      WHERE attendance_status = 'attended'
    `;
    const apAttended = Number(apAttendedResult[0].count);
    console.log(`✅ Attended activityParticipants: ${apAttended}`);

    console.log("Checking dailyAttendance table...");

    const daCountResult = await sql`
      SELECT COUNT(*) as count FROM daily_attendance
    `;
    const daCount = Number(daCountResult[0].count);
    console.log(`📊 Total dailyAttendance records: ${daCount}`);

    const daAttendedResult = await sql`
      SELECT COUNT(*) as count FROM daily_attendance
      WHERE attendance_status = 'attended'
    `;
    const daAttended = Number(daAttendedResult[0].count);
    console.log(`✅ Attended dailyAttendance: ${daAttended}`);

    if (apAttended > 0) {
      console.log("\n📋 Sample activityParticipants data:");
      const sampleAP = await db.query.activityParticipants.findMany({
        where: eq(schema.activityParticipants.attendance_status, "attended"),
        limit: 3,
        with: {
          participant: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          activity: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      });

      sampleAP.forEach((record: (typeof sampleAP)[0], i: number) => {
        console.log(
          `  ${i + 1}. ${record.participant?.firstName} ${record.participant?.lastName} - ${record.activity?.title}`
        );
      });
    }

    if (daAttended > 0) {
      console.log("\n📋 Sample dailyAttendance data:");
      const sampleDA = await db.query.dailyAttendance.findMany({
        where: eq(schema.dailyAttendance.attendance_status, "attended"),
        limit: 3,
        with: {
          participant: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          session: {
            with: {
              activity: {
                columns: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      sampleDA.forEach((record: (typeof sampleDA)[0], i: number) => {
        console.log(
          `  ${i + 1}. ${record.participant?.firstName} ${record.participant?.lastName} - ${record.session?.activity?.title}`
        );
      });
    }

    const totalInterventions = apAttended + daAttended;
    console.log(`\n🎯 Total interventions expected: ${totalInterventions}`);

    if (totalInterventions === 0) {
      console.log(
        "❌ No interventions data found! This explains the 'no results' message."
      );
    } else {
      console.log(
        "✅ Interventions data exists. The issue might be elsewhere."
      );
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugInterventions();
