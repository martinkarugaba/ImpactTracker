"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  dailyAttendance,
  activitySessions,
  activityParticipants,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import {
  type DailyAttendanceResponse,
  type DailyAttendanceListResponse,
  type DailyAttendanceStatus,
} from "../types/types";

/**
 * Get attendance records for a specific session
 */
export async function getSessionAttendance(
  sessionId: string
): Promise<DailyAttendanceListResponse> {
  try {
    const attendanceRecords = await db.query.dailyAttendance.findMany({
      where: eq(dailyAttendance.session_id, sessionId),
      with: {
        participant: true,
        session: true,
      },
    });

    // Enhance with participant names
    const enhancedRecords = attendanceRecords.map(record => ({
      ...record,
      participantName: record.participant
        ? `${record.participant.firstName} ${record.participant.lastName}`
        : "Unknown",
      participantEmail: record.participant?.contact || "",
    }));

    return {
      success: true,
      data: enhancedRecords,
    };
  } catch (error) {
    console.error("Error getting session attendance:", error);
    return {
      success: false,
      error: "Failed to get session attendance",
    };
  }
}

/**
 * Get attendance records for a specific participant across all sessions of an activity
 */
export async function getParticipantAttendance(
  activityId: string,
  participantId: string
): Promise<DailyAttendanceListResponse> {
  try {
    // First get all session IDs for the activity
    const sessions = await db.query.activitySessions.findMany({
      where: eq(activitySessions.activity_id, activityId),
      columns: { id: true },
    });

    const sessionIds = sessions.map(s => s.id);

    if (sessionIds.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Then get attendance records for this participant in those sessions
    const attendanceRecords = await db.query.dailyAttendance.findMany({
      where: and(
        eq(dailyAttendance.participant_id, participantId),
        inArray(dailyAttendance.session_id, sessionIds)
      ),
      with: {
        participant: true,
        session: true,
      },
    });

    // Enhance with participant names
    const enhancedRecords = attendanceRecords.map(record => ({
      ...record,
      participantName: record.participant
        ? `${record.participant.firstName} ${record.participant.lastName}`
        : "Unknown",
      participantEmail: record.participant?.contact || "",
    }));

    return {
      success: true,
      data: enhancedRecords,
    };
  } catch (error) {
    console.error("Error getting participant attendance:", error);
    return {
      success: false,
      error: "Failed to get participant attendance",
    };
  }
}

/**
 * Mark attendance for a single participant in a session
 */
export async function markAttendance(
  sessionId: string,
  participantId: string,
  attendanceData: {
    attendance_status: DailyAttendanceStatus;
    check_in_time?: Date;
    check_out_time?: Date;
    notes?: string;
    recorded_by?: string;
  }
): Promise<DailyAttendanceResponse> {
  try {
    // Check if attendance record already exists
    const existingRecord = await db.query.dailyAttendance.findFirst({
      where: and(
        eq(dailyAttendance.session_id, sessionId),
        eq(dailyAttendance.participant_id, participantId)
      ),
    });

    let attendanceRecord;

    if (existingRecord) {
      // Update existing record
      [attendanceRecord] = await db
        .update(dailyAttendance)
        .set({
          ...attendanceData,
          updated_at: new Date(),
        })
        .where(eq(dailyAttendance.id, existingRecord.id))
        .returning();
    } else {
      // Create new record
      [attendanceRecord] = await db
        .insert(dailyAttendance)
        .values({
          session_id: sessionId,
          participant_id: participantId,
          ...attendanceData,
        })
        .returning();
    }

    // Get session info for revalidation
    const session = await db.query.activitySessions.findFirst({
      where: eq(activitySessions.id, sessionId),
      columns: { activity_id: true },
    });

    if (session) {
      revalidatePath(`/dashboard/activities/${session.activity_id}`);
    }

    return {
      success: true,
      data: attendanceRecord,
    };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return {
      success: false,
      error: "Failed to mark attendance",
    };
  }
}

/**
 * Bulk mark attendance for multiple participants in a session
 */
export async function bulkMarkAttendance(
  sessionId: string,
  attendanceUpdates: Array<{
    participant_id: string;
    attendance_status: DailyAttendanceStatus;
    check_in_time?: Date;
    check_out_time?: Date;
    notes?: string;
    recorded_by?: string;
  }>
): Promise<DailyAttendanceListResponse> {
  try {
    const results = [];

    for (const update of attendanceUpdates) {
      const result = await markAttendance(sessionId, update.participant_id, {
        attendance_status: update.attendance_status,
        check_in_time: update.check_in_time,
        check_out_time: update.check_out_time,
        notes: update.notes,
        recorded_by: update.recorded_by,
      });

      if (result.success && result.data) {
        results.push(result.data);
      }
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error bulk marking attendance:", error);
    return {
      success: false,
      error: "Failed to bulk mark attendance",
    };
  }
}

/**
 * Initialize attendance records for all activity participants in a session
 */
export async function initializeSessionAttendance(
  sessionId: string,
  activityId: string
): Promise<DailyAttendanceListResponse> {
  try {
    // Get all participants for the activity
    const activityParticipantsData =
      await db.query.activityParticipants.findMany({
        where: eq(activityParticipants.activity_id, activityId),
        columns: { participant_id: true },
      });

    const participantIds = activityParticipantsData.map(
      ap => ap.participant_id
    );

    if (participantIds.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Check which participants already have attendance records for this session
    const existingAttendance = await db.query.dailyAttendance.findMany({
      where: and(
        eq(dailyAttendance.session_id, sessionId),
        inArray(dailyAttendance.participant_id, participantIds)
      ),
      columns: { participant_id: true },
    });

    const existingParticipantIds = existingAttendance.map(
      ea => ea.participant_id
    );
    const newParticipantIds = participantIds.filter(
      id => !existingParticipantIds.includes(id)
    );

    // Create attendance records for participants who don't have one yet
    if (newParticipantIds.length > 0) {
      const newAttendanceRecords = newParticipantIds.map(participantId => ({
        session_id: sessionId,
        participant_id: participantId,
        attendance_status: "invited" as DailyAttendanceStatus,
        recorded_by: "system",
      }));

      await db.insert(dailyAttendance).values(newAttendanceRecords);
    }

    // Return all attendance records for this session
    return await getSessionAttendance(sessionId);
  } catch (error) {
    console.error("Error initializing session attendance:", error);
    return {
      success: false,
      error: "Failed to initialize session attendance",
    };
  }
}

/**
 * Delete attendance record
 */
export async function deleteAttendanceRecord(
  attendanceId: string
): Promise<DailyAttendanceResponse> {
  try {
    const [deletedRecord] = await db
      .delete(dailyAttendance)
      .where(eq(dailyAttendance.id, attendanceId))
      .returning();

    // Get session info for revalidation
    const session = await db.query.activitySessions.findFirst({
      where: eq(activitySessions.id, deletedRecord.session_id),
      columns: { activity_id: true },
    });

    if (session) {
      revalidatePath(`/dashboard/activities/${session.activity_id}`);
    }

    return {
      success: true,
      data: deletedRecord,
    };
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    return {
      success: false,
      error: "Failed to delete attendance record",
    };
  }
}

/**
 * Get attendance summary for an activity
 */
export async function getActivityAttendanceSummary(activityId: string) {
  try {
    // Get all sessions for the activity
    const sessions = await db.query.activitySessions.findMany({
      where: eq(activitySessions.activity_id, activityId),
      with: {
        dailyAttendance: {
          with: {
            participant: true,
          },
        },
      },
    });

    // Calculate summary statistics
    const summary = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === "completed").length,
      upcomingSessions: sessions.filter(s => s.status === "scheduled").length,
      cancelledSessions: sessions.filter(s => s.status === "cancelled").length,
      sessionSummaries: sessions.map(session => {
        const attendance = session.dailyAttendance;
        const totalParticipants = attendance.length;
        const attended = attendance.filter(
          a => a.attendance_status === "attended"
        ).length;
        const absent = attendance.filter(
          a => a.attendance_status === "absent"
        ).length;
        const late = attendance.filter(
          a => a.attendance_status === "late"
        ).length;
        const excused = attendance.filter(
          a => a.attendance_status === "excused"
        ).length;

        return {
          sessionId: session.id,
          sessionDate: session.session_date,
          sessionNumber: session.session_number,
          status: session.status,
          totalParticipants,
          attended,
          absent,
          late,
          excused,
          attendanceRate:
            totalParticipants > 0
              ? Math.round((attended / totalParticipants) * 100)
              : 0,
        };
      }),
    };

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Error getting activity attendance summary:", error);
    return {
      success: false,
      error: "Failed to get activity attendance summary",
    };
  }
}
