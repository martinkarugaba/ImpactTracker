"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activityParticipants, activities } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { type ActivityParticipant } from "../types/types";

export interface ActivityParticipantResponse {
  success: boolean;
  data?: ActivityParticipant;
  error?: string;
}

export interface ActivityParticipantsResponse {
  success: boolean;
  data?: ActivityParticipant[];
  error?: string;
}

export async function createActivityParticipant(
  data: Omit<ActivityParticipant, "id" | "created_at" | "updated_at">
): Promise<ActivityParticipantResponse> {
  try {
    const [participant] = await db
      .insert(activityParticipants)
      .values({
        activity_id: data.activity_id,
        participant_id: data.participant_id,
        attendance_status: data.attendance_status || "invited",
        role: data.role || "participant",
        feedback: data.feedback || null,
      })
      .returning();

    revalidatePath(`/dashboard/activities/${data.activity_id}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error creating activity participant:", error);
    return {
      success: false,
      error: "Failed to add participant to activity",
    };
  }
}

export async function updateActivityParticipant(
  id: string,
  data: Partial<Omit<ActivityParticipant, "id" | "created_at" | "updated_at">>
): Promise<ActivityParticipantResponse> {
  try {
    const [participant] = await db
      .update(activityParticipants)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(activityParticipants.id, id))
      .returning();

    if (participant) {
      revalidatePath(`/dashboard/activities/${participant.activity_id}`);
      revalidatePath("/dashboard/activities");
    }

    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error updating activity participant:", error);
    return {
      success: false,
      error: "Failed to update participant",
    };
  }
}

export async function getActivityParticipants(
  activityId: string
): Promise<ActivityParticipantsResponse> {
  try {
    const participants = await db.query.activityParticipants.findMany({
      where: eq(activityParticipants.activity_id, activityId),
      with: {
        participant: true,
      },
    });

    // Enhance with participant names if available
    const enhancedParticipants = participants.map(p => ({
      ...p,
      participantName: p.participant
        ? `${p.participant.firstName} ${p.participant.lastName}`
        : "Unknown Participant",
      participantEmail: p.participant?.contact || "",
      participant: p.participant
        ? {
            ...p.participant,
            district: p.participant.district ?? undefined,
            subCounty: p.participant.subCounty ?? undefined,
          }
        : undefined,
    }));

    return {
      success: true,
      data: enhancedParticipants as ActivityParticipant[],
    };
  } catch (error) {
    console.error("Error getting activity participants:", error);
    return {
      success: false,
      error: "Failed to get participants",
    };
  }
}

export async function deleteActivityParticipant(
  id: string
): Promise<ActivityParticipantResponse> {
  try {
    const [participant] = await db
      .delete(activityParticipants)
      .where(eq(activityParticipants.id, id))
      .returning();

    if (participant) {
      revalidatePath(`/dashboard/activities/${participant.activity_id}`);
      revalidatePath("/dashboard/activities");
    }

    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error deleting activity participant:", error);
    return {
      success: false,
      error: "Failed to remove participant",
    };
  }
}

export async function addActivityParticipants(
  activityId: string,
  participants: Array<{
    participant_id: string;
    participantName: string;
    role: string;
    attendance_status: string;
    feedback?: string;
  }>
): Promise<ActivityParticipantsResponse> {
  try {
    const newParticipants = [];

    for (const participant of participants) {
      // Check if participant is already added to this activity
      const existingParticipant = await db.query.activityParticipants.findFirst(
        {
          where: (activityParticipants, { and, eq }) =>
            and(
              eq(activityParticipants.activity_id, activityId),
              eq(
                activityParticipants.participant_id,
                participant.participant_id
              )
            ),
        }
      );

      if (existingParticipant) {
        console.log(
          `Participant ${participant.participantName} already added to activity`
        );
        continue;
      }

      const [newParticipant] = await db
        .insert(activityParticipants)
        .values({
          activity_id: activityId,
          participant_id: participant.participant_id,
          attendance_status: participant.attendance_status,
          role: participant.role,
          feedback: participant.feedback || null,
        })
        .returning();

      newParticipants.push({
        ...newParticipant,
        participantName: participant.participantName,
        participantEmail: "",
      });
    }

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: newParticipants,
    };
  } catch (error) {
    console.error("Error adding activity participants:", error);
    return {
      success: false,
      error: "Failed to add participants",
    };
  }
}

export async function bulkUpdateActivityParticipants(
  activityId: string,
  participants: Array<{
    participant_id?: string;
    participantName: string;
    role: string;
    attendance_status: string;
    feedback?: string;
  }>
): Promise<ActivityParticipantsResponse> {
  try {
    // First, delete existing participants for this activity
    await db
      .delete(activityParticipants)
      .where(eq(activityParticipants.activity_id, activityId));

    // Then insert new participants
    const newParticipants = [];
    for (const participant of participants) {
      // Ensure we have a participant_id
      if (!participant.participant_id) {
        console.error(
          "Missing participant_id for:",
          participant.participantName
        );
        continue;
      }

      const [newParticipant] = await db
        .insert(activityParticipants)
        .values({
          activity_id: activityId,
          participant_id: participant.participant_id,
          attendance_status: participant.attendance_status,
          role: participant.role,
          feedback: participant.feedback || null,
        })
        .returning();

      newParticipants.push({
        ...newParticipant,
        participantName: participant.participantName,
        participantEmail: "",
      });
    }

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: newParticipants,
    };
  } catch (error) {
    console.error("Error bulk updating activity participants:", error);
    return {
      success: false,
      error: "Failed to update participants",
    };
  }
}

/**
 * Add specific participants to an activity and optionally to a specific session
 * This function only adds the participants you specify, not all activity participants
 */
export async function addActivityParticipantsToSession(
  activityId: string,
  sessionId: string | undefined,
  participants: Array<{
    participant_id: string;
    participantName: string;
    role: string;
    attendance_status: string;
    feedback?: string;
  }>
): Promise<ActivityParticipantsResponse> {
  try {
    const newParticipants = [];

    for (const participant of participants) {
      // Check if participant is already added to this activity
      const existingParticipant = await db.query.activityParticipants.findFirst(
        {
          where: (activityParticipants, { and, eq }) =>
            and(
              eq(activityParticipants.activity_id, activityId),
              eq(
                activityParticipants.participant_id,
                participant.participant_id
              )
            ),
        }
      );

      if (!existingParticipant) {
        // Add participant to activity if not already added
        const [newParticipant] = await db
          .insert(activityParticipants)
          .values({
            activity_id: activityId,
            participant_id: participant.participant_id,
            attendance_status: participant.attendance_status,
            role: participant.role,
            feedback: participant.feedback || null,
          })
          .returning();

        newParticipants.push({
          ...newParticipant,
          participantName: participant.participantName,
          participantEmail: "",
        });
      } else {
        // If participant already exists, add to newParticipants for consistency
        newParticipants.push({
          ...existingParticipant,
          participantName: participant.participantName,
          participantEmail: "",
        });
      }

      // If sessionId is provided, add participant to that specific session
      if (sessionId) {
        const { markAttendance } = await import("./attendance");
        await markAttendance(sessionId, participant.participant_id, {
          attendance_status: "invited",
          recorded_by: "system",
        });
      }
    }

    // Note: We don't call initializeSessionAttendance here because we only want to add
    // the specific participants that were selected, not all activity participants

    // Revalidate paths to refresh the UI
    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities/${activityId}/attendance`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: newParticipants,
    };
  } catch (error) {
    console.error("Error adding activity participants to session:", error);
    return {
      success: false,
      error: "Failed to add participants to session",
    };
  }
}

/**
 * Initialize all activity participants in a session (bulk operation)
 * This adds ALL activity participants to a session, not just selected ones
 */
export async function initializeAllActivityParticipantsInSession(
  activityId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { initializeSessionAttendance } = await import("./attendance");

    // Initialize attendance for all activity participants in this session
    const result = await initializeSessionAttendance(sessionId, activityId);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to initialize session attendance",
      };
    }

    // Revalidate paths to refresh the UI
    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities/${activityId}/attendance`);
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      message: `Initialized ${result.data?.length || 0} participants in session`,
    };
  } catch (error) {
    console.error(
      "Error initializing all activity participants in session:",
      error
    );
    return {
      success: false,
      error: "Failed to initialize all participants in session",
    };
  }
}

export async function getAllActivityParticipants(clusterId?: string) {
  try {
    // Get all unique participants from activities
    // If clusterId is provided, filter activities by cluster
    const whereConditions = [];
    if (clusterId) {
      // Need to join with activities table to filter by cluster
      const activitiesInCluster = await db.query.activities.findMany({
        where: eq(activities.cluster_id, clusterId),
        columns: { id: true },
      });

      if (activitiesInCluster.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      const activityIds = activitiesInCluster.map(a => a.id);
      whereConditions.push(
        inArray(activityParticipants.activity_id, activityIds)
      );
    }

    // Get activity participants with basic participant info
    const activityParticipantsData =
      await db.query.activityParticipants.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          participant: true,
        },
      });

    // Extract unique participants directly (since participant: true gives us the basic data)
    const uniqueParticipantsMap = new Map();
    activityParticipantsData.forEach(ap => {
      if (ap.participant && !uniqueParticipantsMap.has(ap.participant.id)) {
        // Add basic enhancement properties to match expected type
        const participant = {
          ...ap.participant,
          organizationName: "Unknown",
          projectName: "Unknown",
          clusterName: "Unknown",
          districtName: "Unknown",
          subCountyName: "Unknown",
          countyName: "Unknown",
        };
        uniqueParticipantsMap.set(ap.participant.id, participant);
      }
    });

    const uniqueParticipants = Array.from(uniqueParticipantsMap.values());

    return {
      success: true,
      data: uniqueParticipants,
    };
  } catch (error) {
    console.error("Error getting all activity participants:", error);
    return {
      success: false,
      error: "Failed to get activity participants",
    };
  }
}
