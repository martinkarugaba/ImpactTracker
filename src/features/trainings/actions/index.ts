"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { trainings, trainingParticipants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  type NewTraining,
  type TrainingResponse,
  type TrainingsResponse,
  type TrainingParticipantResponse,
} from "../types/types";

export async function getTrainings(
  clusterId: string
): Promise<TrainingsResponse> {
  try {
    const trainingsData = await db.query.trainings.findMany({
      where: eq(trainings.cluster_id, clusterId),
      with: {
        trainingParticipants: true,
      },
    });

    const data = trainingsData.map(training => ({
      ...training,
      created_at: training.created_at || new Date(),
      updated_at: training.updated_at || new Date(),
    }));

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error getting trainings:", error);
    return {
      success: false,
      error: "Failed to get trainings",
    };
  }
}

export async function getTraining(id: string): Promise<TrainingResponse> {
  try {
    const trainingData = await db.query.trainings.findFirst({
      where: eq(trainings.id, id),
      with: {
        trainingParticipants: {
          with: {
            participant: true,
          },
        },
      },
    });

    if (!trainingData) {
      return {
        success: false,
        error: "Training not found",
      };
    }

    const data = {
      ...trainingData,
      created_at: trainingData.created_at || new Date(),
      updated_at: trainingData.updated_at || new Date(),
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error getting training:", error);
    return {
      success: false,
      error: "Failed to get training",
    };
  }
}

export async function createTraining(
  data: NewTraining
): Promise<TrainingResponse> {
  try {
    if (!data.cluster_id || !data.project_id || !data.organization_id) {
      return {
        success: false,
        error: "cluster_id, project_id, and organization_id are required",
      };
    }

    const [trainingData] = await db.insert(trainings).values(data).returning();

    const training = {
      ...trainingData,
      created_at: trainingData.created_at || new Date(),
      updated_at: trainingData.updated_at || new Date(),
    };

    revalidatePath(`/dashboard/trainings`);
    return {
      success: true,
      data: training,
    };
  } catch (error) {
    console.error("Error creating training:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create training",
    };
  }
}

export async function updateTraining(
  id: string,
  data: Partial<NewTraining>
): Promise<TrainingResponse> {
  try {
    const [trainingData] = await db
      .update(trainings)
      .set({ ...data, updated_at: new Date() })
      .where(eq(trainings.id, id))
      .returning();

    const training = {
      ...trainingData,
      created_at: trainingData.created_at || new Date(),
      updated_at: trainingData.updated_at || new Date(),
    };

    revalidatePath(`/dashboard/trainings`);
    return {
      success: true,
      data: training,
    };
  } catch (error) {
    console.error("Error updating training:", error);
    return {
      success: false,
      error: "Failed to update training",
    };
  }
}

export async function deleteTraining(id: string): Promise<TrainingResponse> {
  try {
    // First delete all training participants
    await db
      .delete(trainingParticipants)
      .where(eq(trainingParticipants.training_id, id));

    // Then delete the training
    const [trainingData] = await db
      .delete(trainings)
      .where(eq(trainings.id, id))
      .returning();

    const training = {
      ...trainingData,
      created_at: trainingData.created_at || new Date(),
      updated_at: trainingData.updated_at || new Date(),
    };

    revalidatePath(`/dashboard/trainings`);
    return {
      success: true,
      data: training,
    };
  } catch (error) {
    console.error("Error deleting training:", error);
    return {
      success: false,
      error: "Failed to delete training",
    };
  }
}

export async function addParticipantToTraining(
  trainingId: string,
  participantId: string
): Promise<TrainingParticipantResponse> {
  try {
    const [trainingParticipant] = await db
      .insert(trainingParticipants)
      .values({
        training_id: trainingId,
        participant_id: participantId,
      })
      .returning();

    // Update number of participants
    await db
      .update(trainings)
      .set({
        numberOfParticipants: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${trainingParticipants}
          WHERE ${trainingParticipants.training_id} = ${trainingId}
        )`,
      })
      .where(eq(trainings.id, trainingId));

    revalidatePath(`/dashboard/trainings/${trainingId}`);
    return {
      success: true,
      data: {
        ...trainingParticipant,
        created_at: trainingParticipant.created_at || new Date(),
        updated_at: trainingParticipant.updated_at || new Date(),
      },
    };
  } catch (error) {
    console.error("Error adding participant to training:", error);
    return {
      success: false,
      error: "Failed to add participant to training",
    };
  }
}

export async function removeParticipantFromTraining(
  trainingId: string,
  participantId: string
): Promise<TrainingParticipantResponse> {
  try {
    const [trainingParticipant] = await db
      .delete(trainingParticipants)
      .where(
        and(
          eq(trainingParticipants.training_id, trainingId),
          eq(trainingParticipants.participant_id, participantId)
        )
      )
      .returning();

    // Update number of participants
    await db
      .update(trainings)
      .set({
        numberOfParticipants: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${trainingParticipants}
          WHERE ${trainingParticipants.training_id} = ${trainingId}
        )`,
      })
      .where(eq(trainings.id, trainingId));

    revalidatePath(`/dashboard/trainings/${trainingId}`);
    return {
      success: true,
      data: {
        ...trainingParticipant,
        created_at: trainingParticipant.created_at || new Date(),
        updated_at: trainingParticipant.updated_at || new Date(),
      },
    };
  } catch (error) {
    console.error("Error removing participant from training:", error);
    return {
      success: false,
      error: "Failed to remove participant from training",
    };
  }
}

export async function updateAttendanceStatus(
  trainingId: string,
  participantId: string,
  status: string
): Promise<TrainingParticipantResponse> {
  try {
    const [trainingParticipantData] = await db
      .update(trainingParticipants)
      .set({
        attendance_status: status,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(trainingParticipants.training_id, trainingId),
          eq(trainingParticipants.participant_id, participantId)
        )
      )
      .returning();

    const trainingParticipant = {
      ...trainingParticipantData,
      created_at: trainingParticipantData.created_at || new Date(),
      updated_at: trainingParticipantData.updated_at || new Date(),
    };

    revalidatePath(`/dashboard/trainings/${trainingId}`);
    return {
      success: true,
      data: trainingParticipant,
    };
  } catch (error) {
    console.error("Error updating attendance status:", error);
    return {
      success: false,
      error: "Failed to update attendance status",
    };
  }
}
