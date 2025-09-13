"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activitySessions, dailyAttendance, activities } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  type NewActivitySession,
  type ActivitySessionResponse,
  type ActivitySessionsResponse,
} from "../types/types";

/**
 * Get all sessions for a specific activity
 */
export async function getActivitySessions(
  activityId: string
): Promise<ActivitySessionsResponse> {
  try {
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

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    console.error("Error getting activity sessions:", error);
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
    const [session] = await db
      .insert(activitySessions)
      .values(data)
      .returning();

    revalidatePath(`/dashboard/activities/${data.activity_id}`);

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error creating activity session:", error);
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
 * Auto-generate sessions for a multi-day activity
 */
export async function generateActivitySessions(
  activityId: string,
  startDate: Date,
  endDate: Date,
  sessionData?: {
    start_time?: string;
    end_time?: string;
    venue?: string;
  }
): Promise<ActivitySessionsResponse> {
  try {
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

    // Calculate the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const sessions: NewActivitySession[] = [];

    let sessionNumber = 1;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      sessions.push({
        activity_id: activityId,
        session_date: currentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        session_number: sessionNumber,
        start_time: sessionData?.start_time || null,
        end_time: sessionData?.end_time || null,
        venue: sessionData?.venue || activity.venue,
        status: "scheduled",
        notes: null,
      });

      sessionNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert all sessions
    const createdSessions = await db
      .insert(activitySessions)
      .values(sessions)
      .returning();

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
