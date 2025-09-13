"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activities, activityParticipants } from "@/lib/db/schema";
import { eq, and, desc, between, ilike, or } from "drizzle-orm";
import {
  type NewActivity,
  type ActivityResponse,
  type ActivitiesResponse,
  type ActivityMetrics,
  type ActivityMetricsResponse,
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
    const activity = await db.query.activities.findFirst({
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
        activitySessions: true,
      },
    });

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    // Calculate session-based metrics
    const allSessions = allActivities.flatMap(a => a.activitySessions || []);
    const activitiesWithSessions = allActivities.filter(
      a => (a.activitySessions?.length || 0) > 0
    );
    const multiDayActivities = activitiesWithSessions.length;
    const singleDayActivities = allActivities.length - multiDayActivities;

    const totalSessions = allSessions.length;
    const completedSessions = allSessions.filter(
      s => s.status === "completed"
    ).length;
    const scheduledSessions = allSessions.filter(
      s => s.status === "scheduled"
    ).length;
    const sessionCompletionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Calculate average sessions per activity (only for activities that have sessions)
    const averageSessionsPerActivity =
      activitiesWithSessions.length > 0
        ? totalSessions / activitiesWithSessions.length
        : 0;

    // Calculate average activity duration in days
    const totalDuration = allActivities.reduce((sum, activity) => {
      const start = new Date(activity.startDate);
      const end = new Date(activity.endDate || activity.startDate);
      const duration =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      return sum + duration;
    }, 0);
    const averageActivityDuration =
      allActivities.length > 0 ? totalDuration / allActivities.length : 0;

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
      // Session-based metrics
      multiDayActivities,
      singleDayActivities,
      totalSessions,
      completedSessions,
      scheduledSessions,
      averageSessionsPerActivity:
        Math.round(averageSessionsPerActivity * 10) / 10,
      averageActivityDuration: Math.round(averageActivityDuration * 10) / 10,
      sessionCompletionRate: Math.round(sessionCompletionRate * 10) / 10,
      activitiesWithSessions: activitiesWithSessions.length,
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
