"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activitySessions, dailyAttendance, activities } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import {
  type NewActivitySession,
  type ActivitySessionResponse,
  type ActivitySessionsResponse,
} from "../types/types";
import { initializeSessionAttendance } from "./attendance";

/**
 * Get all sessions for a specific activity
 */
export async function getActivitySessions(
  activityId: string
): Promise<ActivitySessionsResponse> {
  try {
    console.log("getActivitySessions - activityId:", activityId);

    const sessions = await db.query.activitySessions.findMany({
      where: eq(activitySessions.activity_id, activityId),
      orderBy: [asc(activitySessions.session_number)],
      with: {
        dailyAttendance: {
          with: {
            participant: true,
          },
        },
      },
    });

    console.log(
      "getActivitySessions - query result:",
      JSON.stringify(sessions, null, 2)
    );

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    console.error("getActivitySessions - error:", error);
    return {
      success: false,
      error: "Failed to get activity sessions",
    };
  }
}

/**
 * Get a specific session with attendance data
 */
export async function getActivitySession(
  sessionId: string
): Promise<ActivitySessionResponse> {
  try {
    console.log("getActivitySession - sessionId:", sessionId);

    const session = await db.query.activitySessions.findFirst({
      where: eq(activitySessions.id, sessionId),
      with: {
        activity: true,
        dailyAttendance: {
          with: {
            participant: true,
          },
        },
      },
    });

    console.log(
      "getActivitySession - query result:",
      JSON.stringify(session, null, 2)
    );

    if (!session) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error getting activity session:", error);
    return {
      success: false,
      error: "Failed to get activity session",
    };
  }
}

/**
 * Create a new activity session
 */
export async function createActivitySession(
  data: NewActivitySession
): Promise<ActivitySessionResponse> {
  try {
    console.log("createActivitySession - input data:", data);

    // Prevent inserting a session with the same activity_id + session_date
    const existing = await db.query.activitySessions.findFirst({
      where: and(
        eq(activitySessions.activity_id, data.activity_id),
        eq(activitySessions.session_date, data.session_date)
      ),
      columns: { id: true },
    });

    if (existing) {
      console.log("createActivitySession - duplicate session found:", existing);
      return {
        success: false,
        error:
          "A session for this activity already exists on the provided date",
      };
    }

    const [session] = await db
      .insert(activitySessions)
      .values(data)
      .returning();

    console.log("createActivitySession - session created:", session);

    // Initialize attendance records for the new session
    await initializeSessionAttendance(session.id, data.activity_id);

    revalidatePath(`/dashboard/activities/${data.activity_id}`);

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("createActivitySession - error:", error);
    return {
      success: false,
      error: "Failed to create activity session",
    };
  }
}

/**
 * Update an activity session
 */
export async function updateActivitySession(
  sessionId: string,
  data: Partial<NewActivitySession>
): Promise<ActivitySessionResponse> {
  try {
    const [session] = await db
      .update(activitySessions)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(activitySessions.id, sessionId))
      .returning();

    // Get the activity ID for revalidation
    const sessionData = await db.query.activitySessions.findFirst({
      where: eq(activitySessions.id, sessionId),
      columns: { activity_id: true },
    });

    if (sessionData) {
      revalidatePath(`/dashboard/activities/${sessionData.activity_id}`);
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error updating activity session:", error);
    return {
      success: false,
      error: "Failed to update activity session",
    };
  }
}

/**
 * Delete an activity session and all its attendance records
 */
export async function deleteActivitySession(
  sessionId: string
): Promise<ActivitySessionResponse> {
  try {
    // First delete all attendance records for this session
    await db
      .delete(dailyAttendance)
      .where(eq(dailyAttendance.session_id, sessionId));

    // Then delete the session
    const [session] = await db
      .delete(activitySessions)
      .where(eq(activitySessions.id, sessionId))
      .returning();

    revalidatePath(`/dashboard/activities/${session.activity_id}`);

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error deleting activity session:", error);
    return {
      success: false,
      error: "Failed to delete activity session",
    };
  }
}

/**
 * Auto-generate sessions for an activity
 */
export async function generateActivitySessions(
  activityId: string,
  sessionCount: number,
  sessionData?: {
    start_time?: string;
    end_time?: string;
    venue?: string;
  }
): Promise<ActivitySessionsResponse> {
  try {
    // Validate session count
    if (sessionCount < 1 || sessionCount > 50) {
      return {
        success: false,
        error: "Session count must be between 1 and 50",
      };
    }

    // Check if activity exists
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
    });

    if (!activity) {
      return {
        success: false,
        error: "Activity not found",
      };
    }

    // Generate placeholder sessions with dates starting from activity start date or today
    const sessions: NewActivitySession[] = [];
    const baseDate = activity.startDate
      ? new Date(activity.startDate)
      : new Date();

    for (let i = 1; i <= sessionCount; i++) {
      // Create a date for each session (spaced 1 day apart as placeholder)
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(baseDate.getDate() + (i - 1));

      const formattedDate = sessionDate.toISOString().split("T")[0];

      // Skip dates that already have a session for this activity
      const exists = await db.query.activitySessions.findFirst({
        where: and(
          eq(activitySessions.activity_id, activityId),
          eq(activitySessions.session_date, formattedDate)
        ),
        columns: { id: true },
      });

      if (exists) continue;

      sessions.push({
        activity_id: activityId,
        session_date: formattedDate, // Format as YYYY-MM-DD
        session_number: i,
        title: `Session ${i}`, // Default title based on session number
        start_time: sessionData?.start_time || null,
        end_time: sessionData?.end_time || null,
        venue: sessionData?.venue || activity.venue,
        status: "scheduled",
        notes: null,
      });
    }

    // Insert all sessions
    const createdSessions = await db
      .insert(activitySessions)
      .values(sessions)
      .returning();

    // Initialize attendance records for all newly created sessions
    for (const session of createdSessions) {
      await initializeSessionAttendance(session.id, activityId);
    }

    revalidatePath(`/dashboard/activities/${activityId}`);

    return {
      success: true,
      data: createdSessions,
    };
  } catch (error) {
    console.error("Error generating activity sessions:", error);
    return {
      success: false,
      error: "Failed to generate activity sessions",
    };
  }
}

/**
 * Update session status (scheduled, completed, cancelled, postponed)
 */
export async function updateSessionStatus(
  sessionId: string,
  status: "scheduled" | "completed" | "cancelled" | "postponed"
): Promise<ActivitySessionResponse> {
  try {
    const [session] = await db
      .update(activitySessions)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(activitySessions.id, sessionId))
      .returning();

    // Get the activity ID for revalidation
    const sessionData = await db.query.activitySessions.findFirst({
      where: eq(activitySessions.id, sessionId),
      columns: { activity_id: true },
    });

    if (sessionData) {
      revalidatePath(`/dashboard/activities/${sessionData.activity_id}`);
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error updating session status:", error);
    return {
      success: false,
      error: "Failed to update session status",
    };
  }
}

/**
 * Duplicate an existing session
 * Creates a new session with the same details but incremented session number
 */
export async function duplicateActivitySession(
  sessionId: string
): Promise<ActivitySessionResponse> {
  try {
    // Get the session to duplicate
    const originalSession = await db.query.activitySessions.findFirst({
      where: eq(activitySessions.id, sessionId),
    });

    if (!originalSession) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    // Get the highest session number for this activity
    const allSessions = await db.query.activitySessions.findMany({
      where: eq(activitySessions.activity_id, originalSession.activity_id),
      orderBy: [asc(activitySessions.session_number)],
    });

    const highestSessionNumber = Math.max(
      ...allSessions.map(s => s.session_number)
    );

    // Calculate new session date (1 day after the last session)
    const lastSession = allSessions[allSessions.length - 1];
    const newDate = new Date(lastSession.session_date);
    newDate.setDate(newDate.getDate() + 1);

    // Create the duplicated session
    const [newSession] = await db
      .insert(activitySessions)
      .values({
        activity_id: originalSession.activity_id,
        session_date: newDate.toISOString().split("T")[0],
        session_number: highestSessionNumber + 1,
        title: originalSession.title
          ? `${originalSession.title} (Copy)`
          : `Session ${highestSessionNumber + 1}`,
        start_time: originalSession.start_time,
        end_time: originalSession.end_time,
        venue: originalSession.venue,
        status: "scheduled",
        notes: originalSession.notes,
      })
      .returning();

    // Initialize attendance records for the duplicated session
    await initializeSessionAttendance(
      newSession.id,
      originalSession.activity_id
    );

    revalidatePath(`/dashboard/activities/${originalSession.activity_id}`);

    return {
      success: true,
      data: newSession,
    };
  } catch (error) {
    console.error("Error duplicating session:", error);
    return {
      success: false,
      error: "Failed to duplicate session",
    };
  }
}
