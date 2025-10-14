"use server";

import { db } from "@/lib/db";
import { activityParticipants, dailyAttendance } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Intervention } from "../types/types";

export async function getInterventions(_opts?: {
  clusterId?: string;
}): Promise<{ success: boolean; data?: Intervention[]; error?: string }> {
  try {
    // 1) Activity participants marked as attended
    const ap = await db.query.activityParticipants.findMany({
      where: eq(activityParticipants.attendance_status, "attended"),
      with: {
        participant: true,
        activity: true,
      },
    });

    const apMapped: Intervention[] = (ap || []).map(r => ({
      participantId: r.participant_id,
      participantName: r.participant
        ? `${r.participant.firstName ?? ""} ${r.participant.lastName ?? ""}`.trim()
        : "Unknown",
      participantContact: r.participant?.contact ?? null,
      activityId: r.activity_id,
      activityTitle: r.activity?.title ?? null,
      skillCategory: r.activity?.skillCategory ?? null,
      outcomes: Array.isArray(r.activity?.outcomes)
        ? (r.activity?.outcomes as string[])
        : r.activity?.outcomes
          ? [String(r.activity.outcomes)]
          : null,
      source: "activity_participants",
      attendedAt: null,
    }));

    // 2) Daily/session attendance records
    const sa = await db.query.dailyAttendance.findMany({
      where: eq(dailyAttendance.attendance_status, "attended"),
      with: {
        participant: true,
        session: {
          with: {
            activity: true,
          },
        },
      },
    });

    const saMapped: Intervention[] = (sa || []).map(r => ({
      participantId: r.participant_id,
      participantName: r.participant
        ? `${r.participant.firstName ?? ""} ${r.participant.lastName ?? ""}`.trim()
        : "Unknown",
      participantContact: r.participant?.contact ?? null,
      activityId: r.session?.activity_id ?? r.session?.activity?.id ?? "",
      activityTitle: r.session?.activity?.title ?? null,
      skillCategory: r.session?.activity?.skillCategory ?? null,
      outcomes: Array.isArray(r.session?.activity?.outcomes)
        ? (r.session?.activity?.outcomes as string[])
        : r.session?.activity?.outcomes
          ? [String(r.session.activity.outcomes)]
          : null,
      source: "session_attendance",
      attendedAt: r.check_in_time
        ? new Date(r.check_in_time).toISOString()
        : null,
    }));

    // Merge & dedupe
    const map = new Map<string, Intervention>();
    for (const i of [...apMapped, ...saMapped]) {
      if (!i.participantId || !i.activityId) continue;
      const key = `${i.participantId}_${i.activityId}`;
      if (!map.has(key)) map.set(key, i);
      else {
        const existing = map.get(key)!;
        if (!existing.attendedAt && i.attendedAt) map.set(key, i);
      }
    }

    return { success: true, data: Array.from(map.values()) };
  } catch (error) {
    console.error("getInterventions error", error);
    return { success: false, error: "Failed to load interventions" };
  }
}
