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
    let apMapped: Intervention[] = [];
    try {
      const ap = await db.query.activityParticipants.findMany({
        where: eq(activityParticipants.attendance_status, "attended"),
        with: {
          participant: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              contact: true,
              district: true,
              subCounty: true,
              age: true,
              sex: true,
            },
          },
          activity: {
            columns: {
              id: true,
              title: true,
              skillCategory: true,
              outcomes: true,
            },
          },
        },
      });

      const cap = (s?: string | null) =>
        s && s.length > 0
          ? `${s.charAt(0).toUpperCase()}${s.slice(1)}`
          : (s ?? "");

      apMapped = (ap || []).map(r => ({
        participantId: r.participant_id,
        participantName: r.participant
          ? `${cap(r.participant.firstName)} ${cap(r.participant.lastName)}`.trim()
          : "Unknown",
        participantContact: r.participant?.contact ?? null,
        age: r.participant?.age ?? null,
        sex: r.participant?.sex ?? null,
        subcounty: r.participant?.subCounty ?? null,
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
    } catch (err) {
      console.error("getInterventions: activityParticipants query failed", err);
      apMapped = [];
    }

    // 2) Daily/session attendance records
    let saMapped: Intervention[] = [];
    try {
      const sa = await db.query.dailyAttendance.findMany({
        where: eq(dailyAttendance.attendance_status, "attended"),
        with: {
          participant: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              contact: true,
              district: true,
              subCounty: true,
              age: true,
              sex: true,
            },
          },
          session: {
            columns: {
              id: true,
              activity_id: true,
            },
            with: {
              activity: {
                columns: {
                  id: true,
                  title: true,
                  skillCategory: true,
                  outcomes: true,
                },
              },
            },
          },
        },
      });

      const cap = (s?: string | null) =>
        s && s.length > 0
          ? `${s.charAt(0).toUpperCase()}${s.slice(1)}`
          : (s ?? "");

      saMapped = (sa || []).map(r => ({
        participantId: r.participant_id,
        participantName: r.participant
          ? `${cap(r.participant.firstName)} ${cap(r.participant.lastName)}`.trim()
          : "Unknown",
        participantContact: r.participant?.contact ?? null,
        age: r.participant?.age ?? null,
        sex: r.participant?.sex ?? null,
        subcounty: r.participant?.subCounty ?? null,
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

      // Debugging logs
      saMapped.forEach(r => {
        console.log("Participant data for dailyAttendance:", {
          age: r.age,
          subCounty: r.subcounty,
        });
        console.log("Age:", r.age, "Subcounty:", r.subcounty);
      });
    } catch (err) {
      console.error("getInterventions: dailyAttendance query failed", err);
      saMapped = [];
    }

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

export async function getAllFilteredInterventionsForExport(
  clusterId: string,
  filters?: Record<string, unknown>,
  search?: string
): Promise<{ success: boolean; data?: Intervention[]; error?: string }> {
  try {
    const interventions = await getInterventions({ clusterId });

    if (!interventions.success || !interventions.data) {
      return { success: false, error: interventions.error || "No data found" };
    }

    let filteredData = interventions.data;

    // Apply filters
    if (filters) {
      filteredData = filteredData.filter(intervention => {
        return Object.entries(filters).every(([key, value]) => {
          return intervention[key as keyof Intervention] === value;
        });
      });
    }

    // Apply search
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredData = filteredData.filter(intervention => {
        return (
          intervention.participantName?.toLowerCase().includes(lowerSearch) ||
          intervention.activityTitle?.toLowerCase().includes(lowerSearch)
        );
      });
    }

    return { success: true, data: filteredData };
  } catch (error) {
    console.error("getAllFilteredInterventionsForExport error", error);
    return { success: false, error: "Failed to export interventions" };
  }
}
