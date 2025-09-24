"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { type CountResult } from "../types/types";

export async function getParticipantMetrics(clusterId: string) {
  try {
    // Total participants
    const totalParticipants = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(eq(participants.cluster_id, clusterId))
      .then(res => res[0] as CountResult);

    // Total females
    const totalFemales = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "female")
        )
      )
      .then(res => res[0] as CountResult);

    // Females aged 15-35
    const femalesYouth = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "female"),
          sql`${participants.age} >= 15`,
          sql`${participants.age} <= 35`
        )
      )
      .then(res => res[0] as CountResult);

    // Females aged 36-64
    const femalesAdult = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "female"),
          sql`${participants.age} >= 36`,
          sql`${participants.age} <= 64`
        )
      )
      .then(res => res[0] as CountResult);

    // Females aged 65+
    const femalesElderly = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "female"),
          sql`${participants.age} >= 65`
        )
      )
      .then(res => res[0] as CountResult);

    // Females > 35
    const femalesOlder = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "female"),
          sql`${participants.age} > 35`
        )
      )
      .then(res => res[0] as CountResult);

    // Total males
    const totalMales = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "male")
        )
      )
      .then(res => res[0] as CountResult);

    // Males aged 15-35
    const malesYouth = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "male"),
          sql`${participants.age} >= 15`,
          sql`${participants.age} <= 35`
        )
      )
      .then(res => res[0] as CountResult);

    // Males aged 36-64
    const malesAdult = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "male"),
          sql`${participants.age} >= 36`,
          sql`${participants.age} <= 64`
        )
      )
      .then(res => res[0] as CountResult);

    // Males aged 65+
    const malesElderly = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "male"),
          sql`${participants.age} >= 65`
        )
      )
      .then(res => res[0] as CountResult);

    // Males > 35
    const malesOlder = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.sex, "male"),
          sql`${participants.age} > 35`
        )
      )
      .then(res => res[0] as CountResult);

    // Total persons with disabilities
    const totalPWD = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.isPWD, "yes")
        )
      )
      .then(res => res[0] as CountResult);

    // Male persons with disabilities
    const pwdMale = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.isPWD, "yes"),
          eq(participants.sex, "male")
        )
      )
      .then(res => res[0] as CountResult);

    // Female persons with disabilities
    const pwdFemale = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          eq(participants.cluster_id, clusterId),
          eq(participants.isPWD, "yes"),
          eq(participants.sex, "female")
        )
      )
      .then(res => res[0] as CountResult);

    return {
      success: true,
      data: {
        totalParticipants: totalParticipants.count,
        totalFemales: totalFemales.count,
        femalesYouth: femalesYouth.count,
        femalesAdult: femalesAdult.count,
        femalesElderly: femalesElderly.count,
        femalesOlder: femalesOlder.count,
        totalMales: totalMales.count,
        malesYouth: malesYouth.count,
        malesAdult: malesAdult.count,
        malesElderly: malesElderly.count,
        malesOlder: malesOlder.count,
        totalPWD: totalPWD.count,
        pwdMale: pwdMale.count,
        pwdFemale: pwdFemale.count,
      },
    };
  } catch (error) {
    console.error("Error getting participant metrics:", error);
    return {
      success: false,
      error: "Failed to fetch participant metrics",
    };
  }
}
