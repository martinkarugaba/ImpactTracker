"use server";

import { db } from "@/lib/db";
import { interventions } from "@/lib/db/schema";
import type { Intervention } from "../types/types";

export async function createInterventions(
  items: Intervention[]
): Promise<{ success: boolean; inserted?: number; error?: string }> {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "No interventions provided" };
    }

    // Map incoming Intervention objects to DB rows. We'll insert one row per activity
    // If an Intervention has `activities` array, expand it.
    const rows: Array<typeof interventions.$inferInsert> = [];

    for (const it of items) {
      if (
        it.activities &&
        Array.isArray(it.activities) &&
        it.activities.length > 0
      ) {
        // Handle multiple activities case
        for (const activity of it.activities) {
          rows.push({
            participant_id: it.participantId,
            activity_id: activity.activityId,
            session_id: undefined, // Will be set if we have session data later
            source: activity.source || "activity_participants",
            skill_category: activity.skillCategory ?? undefined,
            outcomes: activity.outcomes ?? [],
            attended_at: activity.attendedAt
              ? new Date(activity.attendedAt)
              : undefined,
            notes: undefined,
            created_by: undefined,
          });
        }
      } else if (it.activityId) {
        // Handle single activity case
        rows.push({
          participant_id: it.participantId,
          activity_id: it.activityId,
          session_id: undefined, // Will be set if we have session data later
          source: it.source || "activity_participants",
          skill_category: it.skillCategory ?? undefined,
          outcomes: it.outcomes ?? [],
          attended_at: it.attendedAt ? new Date(it.attendedAt) : undefined,
          notes: undefined,
          created_by: undefined,
        });
      }
    }

    if (rows.length === 0) {
      return { success: false, error: "No valid interventions to insert" };
    }

    // Use drizzle insertMany
    const res = await db
      .insert(interventions)
      .values(rows)
      .onConflictDoNothing()
      .returning({ id: interventions.id });

    const inserted = Array.isArray(res) ? res.length : 0;

    return { success: true, inserted };
  } catch (error) {
    console.error("createInterventions error", error);
    return { success: false, error: (error as Error).message };
  }
}
