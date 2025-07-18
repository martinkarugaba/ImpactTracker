"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  activities,
  activityParticipants,
  participants,
  conceptNotes,
} from "@/lib/db/schema";
import { eq, and, desc, between, ilike, or, inArray } from "drizzle-orm";
import {
  type NewActivity,
  type ActivityResponse,
  type ActivitiesResponse,
  type ActivityMetrics,
  type ActivityMetricsResponse,
  type AttendanceRecord,
  type BudgetItem,
  type ConceptNoteResponse,
} from "../types/types";

export async function getActivities(
  clusterId?: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      type?: string;
      status?: string;
      organization?: string;
      project?: string;
      dateFrom?: string;
      dateTo?: string;
    };
  }
): Promise<ActivitiesResponse> {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (clusterId) {
      whereConditions.push(eq(activities.cluster_id, clusterId));
    }

    // Add filter conditions
    if (params?.filters) {
      if (params.filters.type) {
        whereConditions.push(eq(activities.type, params.filters.type));
      }
      if (params.filters.status) {
        whereConditions.push(eq(activities.status, params.filters.status));
      }
      if (params.filters.organization) {
        whereConditions.push(
          eq(activities.organization_id, params.filters.organization)
        );
      }
      if (params.filters.project) {
        whereConditions.push(eq(activities.project_id, params.filters.project));
      }
      if (params.filters.dateFrom && params.filters.dateTo) {
        whereConditions.push(
          between(
            activities.startDate,
            new Date(params.filters.dateFrom),
            new Date(params.filters.dateTo)
          )
        );
      }
    }

    // Add search condition if search term is provided
    if (params?.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`;
      whereConditions.push(
        or(
          ilike(activities.title, searchTerm),
          ilike(activities.description, searchTerm),
          ilike(activities.venue, searchTerm)
        )
      );
    }

    const [activitiesData, totalCount] = await Promise.all([
      db.query.activities.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        orderBy: [desc(activities.created_at)],
        with: {
          cluster: true,
          project: true,
          organization: true,
          activityParticipants: true,
        },
      }),
      db.query.activities.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        columns: {
          id: true,
        },
      }),
    ]);

    // Enhance activity data with organization names and participant counts
    const data = activitiesData.map(activity => ({
      ...activity,
      organizationName: activity.organization?.name || "Unknown",
      projectName: activity.project?.name || "Unknown",
      clusterName: activity.cluster?.name || "Unknown",
      participantCount: activity.activityParticipants?.length || 0,
    }));

    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit),
          hasNext: page * limit < totalCount.length,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error getting activities:", error);
    return {
      success: false,
      error: "Failed to get activities",
    };
  }
}

export async function getActivity(id: string): Promise<ActivityResponse> {
  try {
    // First try to get activity with conceptNotes relation
    let activity;
    let conceptNote = null;

    try {
      activity = await db.query.activities.findFirst({
        where: eq(activities.id, id),
        with: {
          cluster: true,
          project: true,
          organization: true,
          activityParticipants: {
            with: {
              participant: true,
            },
          },
          conceptNotes: true,
        },
      });

      // Get the concept note if it exists
      conceptNote = activity?.conceptNotes?.[0] || null;
    } catch (error) {
      // If conceptNotes relation doesn't exist, get activity without it
      console.warn("ConceptNotes table may not exist yet:", error);
      activity = await db.query.activities.findFirst({
        where: eq(activities.id, id),
        with: {
          cluster: true,
          project: true,
          organization: true,
          activityParticipants: {
            with: {
              participant: true,
            },
          },
        },
      });
    }

    if (!activity) {
      return {
        success: false,
        error: "Activity not found",
      };
    }

    const enhancedActivity = {
      ...activity,
      organizationName: activity.organization?.name || "Unknown",
      projectName: activity.project?.name || "Unknown",
      clusterName: activity.cluster?.name || "Unknown",
      participantCount: activity.activityParticipants?.length || 0,
      // Use concept note if it exists, otherwise create a fallback from objectives array
      conceptNote:
        conceptNote ||
        (activity.objectives && activity.objectives.length > 0
          ? {
              content: activity.objectives[0],
              title: activity.title,
              id: "",
              activity_id: activity.id,
              created_at: activity.created_at,
              updated_at: activity.updated_at,
              charge_code: null,
              activity_lead: null,
              submission_date: null,
              project_summary: null,
              methodology: null,
              requirements: null,
              participant_details: null,
              budget_items: [],
              budget_notes: null,
            }
          : null),
    };

    return {
      success: true,
      data: enhancedActivity,
    };
  } catch (error) {
    console.error("Error getting activity:", error);
    return {
      success: false,
      error: "Failed to get activity",
    };
  }
}

export async function createActivity(
  data: NewActivity
): Promise<ActivityResponse> {
  try {
    if (!data.cluster_id || !data.project_id || !data.organization_id) {
      return {
        success: false,
        error: "cluster_id, project_id, and organization_id are required",
      };
    }

    const [activity] = await db
      .insert(activities)
      .values({
        ...data,
        cluster_id: data.cluster_id,
        project_id: data.project_id,
        organization_id: data.organization_id,
      })
      .returning();

    revalidatePath(`/dashboard/activities`);
    if (data.cluster_id) {
      revalidatePath(`/dashboard/clusters/${data.cluster_id}/activities`);
    }

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Error creating activity:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create activity",
    };
  }
}

export async function updateActivity(
  id: string,
  data: Partial<NewActivity>
): Promise<ActivityResponse> {
  try {
    const [activity] = await db
      .update(activities)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    revalidatePath(`/dashboard/activities`);
    if (activity.cluster_id) {
      revalidatePath(`/dashboard/clusters/${activity.cluster_id}/activities`);
    }

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Error updating activity:", error);
    return {
      success: false,
      error: "Failed to update activity",
    };
  }
}

export async function deleteActivity(id: string): Promise<ActivityResponse> {
  try {
    // First delete all activity participants
    await db
      .delete(activityParticipants)
      .where(eq(activityParticipants.activity_id, id));

    // Delete any concept notes associated with this activity
    await db.delete(conceptNotes).where(eq(conceptNotes.activity_id, id));

    // Then delete the activity
    const [activity] = await db
      .delete(activities)
      .where(eq(activities.id, id))
      .returning();

    revalidatePath(`/dashboard/activities`);
    if (activity.cluster_id) {
      revalidatePath(`/dashboard/clusters/${activity.cluster_id}/activities`);
    }

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Error deleting activity:", error);
    return {
      success: false,
      error: "Failed to delete activity",
    };
  }
}

export async function getActivityMetrics(
  clusterId?: string
): Promise<ActivityMetricsResponse> {
  try {
    const whereConditions = [];
    if (clusterId) {
      whereConditions.push(eq(activities.cluster_id, clusterId));
    }

    const allActivities = await db.query.activities.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        activityParticipants: true,
      },
    });

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const metrics: ActivityMetrics = {
      totalActivities: allActivities.length,
      activeActivities: allActivities.filter(a => a.status === "ongoing")
        .length,
      completedActivities: allActivities.filter(a => a.status === "completed")
        .length,
      ongoingActivities: allActivities.filter(a => a.status === "ongoing")
        .length,
      plannedActivities: allActivities.filter(a => a.status === "planned")
        .length,
      totalParticipants: allActivities.reduce(
        (sum, activity) => sum + (activity.activityParticipants?.length || 0),
        0
      ),
      thisMonth: allActivities.filter(
        a =>
          new Date(a.startDate) >= startOfThisMonth &&
          new Date(a.startDate) < startOfNextMonth
      ).length,
      nextMonth: allActivities.filter(
        a =>
          new Date(a.startDate) >= startOfNextMonth &&
          new Date(a.startDate) <= endOfNextMonth
      ).length,
      totalBudget: allActivities.reduce(
        (sum, activity) => sum + (activity.budget || 0),
        0
      ),
      overdue: allActivities.filter(
        a =>
          new Date(a.startDate) < now &&
          a.status !== "completed" &&
          a.status !== "cancelled"
      ).length,
      actualSpent: allActivities.reduce(
        (sum, activity) => sum + (activity.actualCost || 0),
        0
      ),
      byType: {},
      byStatus: {},
    };

    // Group by type
    allActivities.forEach(activity => {
      metrics.byType[activity.type] = (metrics.byType[activity.type] || 0) + 1;
    });

    // Group by status
    allActivities.forEach(activity => {
      metrics.byStatus[activity.status] =
        (metrics.byStatus[activity.status] || 0) + 1;
    });

    return {
      success: true,
      data: metrics,
    };
  } catch (error) {
    console.error("Error getting activity metrics:", error);
    return {
      success: false,
      error: "Failed to get activity metrics",
    };
  }
}

// =============================================================================
// CONCEPT NOTES CRUD
// =============================================================================

// Get a concept note for an activity
export async function getActivityConceptNote(
  activityId: string
): Promise<ConceptNoteResponse> {
  try {
    const conceptNote = await db.query.conceptNotes.findFirst({
      where: eq(conceptNotes.activity_id, activityId),
    });

    return {
      success: true,
      data: conceptNote || undefined,
    };
  } catch (error) {
    console.error("Error getting concept note:", error);
    return {
      success: false,
      error: "Failed to get concept note",
    };
  }
}

// Create or update a concept note
export async function updateActivityConceptNote(
  activityId: string,
  conceptNoteData: {
    title: string;
    content: string;
    charge_code?: string;
    activity_lead?: string;
    submission_date?: Date;
    project_summary?: string;
    methodology?: string;
    requirements?: string;
    participant_details?: string;
    budget_items?: BudgetItem[];
    budget_notes?: string;
  }
): Promise<ConceptNoteResponse> {
  try {
    // Check if a concept note already exists for this activity
    const existingConceptNote = await db.query.conceptNotes.findFirst({
      where: eq(conceptNotes.activity_id, activityId),
    });

    let result;

    if (existingConceptNote) {
      // Update the existing concept note
      [result] = await db
        .update(conceptNotes)
        .set({
          ...conceptNoteData,
          budget_items: conceptNoteData.budget_items
            ? conceptNoteData.budget_items.map(item => JSON.stringify(item))
            : [],
          updated_at: new Date(),
        })
        .where(eq(conceptNotes.id, existingConceptNote.id))
        .returning();
    } else {
      // Create a new concept note
      [result] = await db
        .insert(conceptNotes)
        .values({
          activity_id: activityId,
          ...conceptNoteData,
          budget_items: conceptNoteData.budget_items
            ? conceptNoteData.budget_items.map(item => JSON.stringify(item))
            : [],
        })
        .returning();
    }

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error updating concept note:", error);
    return {
      success: false,
      error: "Failed to update concept note",
    };
  }
}

export async function deleteActivityConceptNote(
  activityId: string
): Promise<ConceptNoteResponse> {
  try {
    // Find the concept note for this activity
    const conceptNote = await db.query.conceptNotes.findFirst({
      where: eq(conceptNotes.activity_id, activityId),
    });

    if (!conceptNote) {
      return {
        success: false,
        error: "Concept note not found",
      };
    }

    // Delete the concept note
    const [deletedConceptNote] = await db
      .delete(conceptNotes)
      .where(eq(conceptNotes.id, conceptNote.id))
      .returning();

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: deletedConceptNote,
    };
  } catch (error) {
    console.error("Error deleting concept note:", error);
    return {
      success: false,
      error: "Failed to delete concept note",
    };
  }
}

// =============================================================================
// ACTIVITY REPORTS CRUD
// =============================================================================

export async function updateActivityReport(
  activityId: string,
  reportData: {
    status?: string;
    outcomes?: string;
    challenges?: string;
    recommendations?: string;
    actualCost?: number;
    numberOfParticipants?: number;
  }
): Promise<ActivityResponse> {
  try {
    const [activity] = await db
      .update(activities)
      .set({
        ...reportData,
        updated_at: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Error updating activity report:", error);
    return {
      success: false,
      error: "Failed to update activity report",
    };
  }
}

export async function deleteActivityReport(
  activityId: string
): Promise<ActivityResponse> {
  try {
    const [activity] = await db
      .update(activities)
      .set({
        outcomes: null,
        challenges: null,
        recommendations: null,
        actualCost: null,
        updated_at: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Error deleting activity report:", error);
    return {
      success: false,
      error: "Failed to delete activity report",
    };
  }
}

// =============================================================================
// ATTENDANCE LISTS CRUD
// =============================================================================

export async function getAvailableParticipants(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    cluster?: string;
  }>;
  error?: string;
}> {
  try {
    const participantsData = await db.query.participants.findMany({
      with: {
        cluster: true,
      },
      orderBy: [desc(participants.created_at)],
    });

    const formattedParticipants = participantsData.map(participant => ({
      id: participant.id,
      name: `${participant.firstName} ${participant.lastName}`.trim(),
      email: "", // participants table doesn't have email field
      phone: participant.contact || undefined,
      organization: undefined, // need to fetch organization separately if needed
      cluster: participant.cluster?.name || undefined,
    }));

    return {
      success: true,
      data: formattedParticipants,
    };
  } catch (error) {
    console.error("Error getting available participants:", error);
    return {
      success: false,
      error: "Failed to get available participants",
    };
  }
}

export async function addActivityParticipants(
  activityId: string,
  participantIds: string[]
): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    activity_id: string;
    participant_id: string;
    attendance_status: string;
  }>;
  error?: string;
}> {
  try {
    // Check if participants are already registered for this activity
    const existingParticipants = await db.query.activityParticipants.findMany({
      where: and(
        eq(activityParticipants.activity_id, activityId),
        inArray(activityParticipants.participant_id, participantIds)
      ),
    });

    const existingParticipantIds = existingParticipants.map(
      p => p.participant_id
    );
    const newParticipantIds = participantIds.filter(
      id => !existingParticipantIds.includes(id)
    );

    if (newParticipantIds.length === 0) {
      return {
        success: false,
        error:
          "All selected participants are already registered for this activity",
      };
    }

    // Add new participants
    const newActivityParticipants = await db
      .insert(activityParticipants)
      .values(
        newParticipantIds.map(participantId => ({
          activity_id: activityId,
          participant_id: participantId,
          attendance_status: "invited",
        }))
      )
      .returning();

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: newActivityParticipants,
    };
  } catch (error) {
    console.error("Error adding activity participants:", error);
    return {
      success: false,
      error: "Failed to add participants to activity",
    };
  }
}

export async function updateActivityAttendance(
  activityId: string,
  participantId: string,
  attendanceStatus: "invited" | "attended" | "absent",
  role?: string,
  feedback?: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    activity_id: string;
    participant_id: string;
    attendance_status: string;
  };
  error?: string;
}> {
  try {
    const [updatedParticipant] = await db
      .update(activityParticipants)
      .set({
        attendance_status: attendanceStatus,
        role: role || "participant",
        feedback: feedback || null,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(activityParticipants.activity_id, activityId),
          eq(activityParticipants.participant_id, participantId)
        )
      )
      .returning();

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: updatedParticipant,
    };
  } catch (error) {
    console.error("Error updating attendance:", error);
    return {
      success: false,
      error: "Failed to update attendance",
    };
  }
}

export async function removeActivityParticipant(
  activityId: string,
  participantId: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    activity_id: string;
    participant_id: string;
  };
  error?: string;
}> {
  try {
    const [removedParticipant] = await db
      .delete(activityParticipants)
      .where(
        and(
          eq(activityParticipants.activity_id, activityId),
          eq(activityParticipants.participant_id, participantId)
        )
      )
      .returning();

    revalidatePath(`/dashboard/activities/${activityId}`);
    revalidatePath(`/dashboard/activities`);

    return {
      success: true,
      data: removedParticipant,
    };
  } catch (error) {
    console.error("Error removing participant:", error);
    return {
      success: false,
      error: "Failed to remove participant",
    };
  }
}

export async function getActivityAttendanceList(activityId: string): Promise<{
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
}> {
  try {
    const attendanceData = await db.query.activityParticipants.findMany({
      where: eq(activityParticipants.activity_id, activityId),
      with: {
        participant: {
          with: {
            organization: true,
            cluster: true,
          },
        },
      },
    });

    const attendanceList: AttendanceRecord[] = attendanceData.map(record => ({
      id: record.id,
      name: `${record.participant.firstName} ${record.participant.lastName}`.trim(),
      email: "", // participants table doesn't have email field
      attended: record.attendance_status === "attended",
      role: record.role || undefined,
      organization: record.participant.organization?.name || undefined,
      checkInTime: undefined, // Not available in current schema
      checkOutTime: undefined, // Not available in current schema
      notes: record.feedback || undefined,
    }));

    return {
      success: true,
      data: attendanceList,
    };
  } catch (error) {
    console.error("Error getting attendance list:", error);
    return {
      success: false,
      error: "Failed to get attendance list",
    };
  }
}
