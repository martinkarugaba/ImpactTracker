"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activityParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type ActivityParticipant } from "../types/types";

export type ActivityParticipantResponse = {
  success: boolean;
  data?: ActivityParticipant;
  error?: string;
};

export type ActivityParticipantsResponse = {
  success: boolean;
  data?: ActivityParticipant[];
  error?: string;
};

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
    }));

    return {
      success: true,
      data: enhancedParticipants,
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
