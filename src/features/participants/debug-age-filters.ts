"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";

export async function debugAgeFilters(clusterId: string) {
  console.log("🔍 Debugging age filters for cluster:", clusterId);

  try {
    // Get all participants for this cluster to check their ages
    const allParticipants = await db.query.participants.findMany({
      where: eq(participants.cluster_id, clusterId),
      columns: {
        id: true,
        age: true,
        sex: true,
        isPWD: true,
      },
    });

    console.log("📊 Total participants in cluster:", allParticipants.length);

    if (allParticipants.length === 0) {
      return {
        success: false,
        error: "No participants found in this cluster",
      };
    }

    // Age distribution analysis
    const ageStats = {
      total: allParticipants.length,
      age15to35: allParticipants.filter(
        p => p.age !== null && p.age >= 15 && p.age <= 35
      ).length,
      ageOver35: allParticipants.filter(p => p.age !== null && p.age > 35)
        .length,
      age36to59: allParticipants.filter(
        p => p.age !== null && p.age >= 36 && p.age <= 59
      ).length,
      ageOver60: allParticipants.filter(p => p.age !== null && p.age >= 60)
        .length,
      ages: allParticipants
        .map(p => p.age)
        .filter((age): age is number => age !== null)
        .sort((a, b) => a - b),
      agesWithNull: allParticipants.filter(p => p.age === null).length,
      sexDistribution: {
        male: allParticipants.filter(p => p.sex === "male").length,
        female: allParticipants.filter(p => p.sex === "female").length,
      },
      pwdDistribution: {
        yes: allParticipants.filter(p => p.isPWD === "yes").length,
        no: allParticipants.filter(p => p.isPWD === "no").length,
      },
    };

    console.log("📈 Age statistics:", ageStats);

    // Test the exact SQL that would be used in filtering
    const testYoungFilter = await db
      .select({ count: sql<number>`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          sql`${participants.age} >= 15 AND ${participants.age} <= 35`
        )
      );

    const testAdultFilter = await db
      .select({ count: sql<number>`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          sql`${participants.age} >= 36 AND ${participants.age} <= 59`
        )
      );

    const testOlderFilter = await db
      .select({ count: sql<number>`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          sql`${participants.age} >= 60`
        )
      );

    console.log("🎯 SQL Filter Results:");
    console.log("Young (15-35):", testYoungFilter[0]?.count);
    console.log("Adult (36-59):", testAdultFilter[0]?.count);
    console.log("Older (60+):", testOlderFilter[0]?.count);

    // Test individual age queries
    const ageQueries = [];
    for (let age = 20; age <= 70; age += 10) {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(participants)
        .where(
          and(
            eq(participants.cluster_id, clusterId),
            sql`${participants.age} = ${age}`
          )
        );
      ageQueries.push({ age, count: count[0]?.count || 0 });
    }

    console.log("🎯 Specific age counts:", ageQueries);

    return {
      success: true,
      data: {
        ageStats,
        sqlResults: {
          young: testYoungFilter[0]?.count,
          adult: testAdultFilter[0]?.count,
          older: testOlderFilter[0]?.count,
        },
        ageQueries,
        sampleParticipants: allParticipants.slice(0, 10),
      },
    };
  } catch (error) {
    console.error("❌ Debug error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
