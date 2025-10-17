"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  activities,
  activityParticipants,
  activityReports,
  conceptNotes,
  activitySessions,
  dailyAttendance,
  interventions,
  users,
  organizations,
  clusters,
  projects,
} from "@/lib/db/schema";
import {
  eq,
  and,
  desc,
  between,
  ilike,
  or,
  inArray,
  count,
  sql,
} from "drizzle-orm";
import {
  type NewActivity,
  type ActivityResponse,
  type ActivitiesResponse,
  type ActivityMetrics,
  type ActivityMetricsResponse,
} from "../types/types";
import type { NewDailyAttendance } from "../types/types";

// Temporary debug function to check all activities
export async function debugGetAllActivities() {
  try {
    console.log("🔍 DEBUG: Fetching ALL activities without any filters");
    const allActivities = await db.select().from(activities).limit(10);
    console.log("🔍 DEBUG: Found activities:", allActivities.length);
    console.log("🔍 DEBUG: Sample activities:", allActivities.slice(0, 3));
    return allActivities;
  } catch (error) {
    console.error("🔍 DEBUG: Error fetching all activities:", error);
    return [];
  }
}

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
    console.log("🔍 getActivities - clusterId:", clusterId);
    console.log("🔍 getActivities - params:", params);

    // Debug: Check all activities first
    await debugGetAllActivities();

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (clusterId) {
      console.log("🔍 getActivities - Adding cluster filter:", clusterId);
      whereConditions.push(eq(activities.cluster_id, clusterId));
    } else {
      console.log(
        "🔍 getActivities - No clusterId provided, will fetch all activities"
      );
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

    // Get activities with user information for activity lead
    const activitiesWithUsers = await db
      .select({
        // Activity fields
        id: activities.id,
        title: activities.title,
        description: activities.description,
        type: activities.type,
        status: activities.status,
        startDate: activities.startDate,
        endDate: activities.endDate,
        venue: activities.venue,
        budget: activities.budget,
        actualCost: activities.actualCost,
        numberOfParticipants: activities.numberOfParticipants,
        expectedSessions: activities.expectedSessions,
        objectives: activities.objectives,
        skillCategory: activities.skillCategory,
        outcomes: activities.outcomes,
        challenges: activities.challenges,
        recommendations: activities.recommendations,
        attachments: activities.attachments,
        organization_id: activities.organization_id,
        cluster_id: activities.cluster_id,
        project_id: activities.project_id,
        created_by: activities.created_by,
        created_at: activities.created_at,
        updated_at: activities.updated_at,
        // User fields for activity lead (use email as fallback when name is missing)
        activityLeadName: sql<string>`COALESCE(${users.name}, ${users.email})`,
        // Organization fields
        organizationName: organizations.name,
        // Cluster fields
        clusterName: clusters.name,
        // Project fields
        projectName: projects.name,
        projectAcronym: projects.acronym,
      })
      .from(activities)
      .leftJoin(users, eq(activities.created_by, users.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .leftJoin(clusters, eq(activities.cluster_id, clusters.id))
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(activities.created_at))
      .limit(limit)
      .offset(offset);

    // Get participant counts separately - join with activities to apply filters
    const participantCounts = await db
      .select({
        activity_id: activityParticipants.activity_id,
        count: count(),
      })
      .from(activityParticipants)
      .innerJoin(
        activities,
        eq(activityParticipants.activity_id, activities.id)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(activityParticipants.activity_id);

    // Combine the data
    const activitiesData = activitiesWithUsers.map(activity => {
      const participantCount =
        participantCounts.find(pc => pc.activity_id === activity.id)?.count ||
        0;

      return {
        ...activity,
        participantCount,
      };
    });

    const totalCount = await db
      .select({ count: count() })
      .from(activities)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    console.log(
      "🔍 getActivities - activitiesWithUsers count:",
      activitiesWithUsers.length
    );
    console.log("🔍 getActivities - totalCount:", totalCount[0]?.count || 0);
    console.log("🔍 getActivities - whereConditions:", whereConditions.length);

    // Enhance activity data with organization names and participant counts
    const data = activitiesData.map(activity => ({
      ...activity,
      organizationName: activity.organizationName || "Unknown",
      projectName: activity.projectName || "Unknown",
      clusterName: activity.clusterName || "Unknown",
      participantCount: activity.participantCount || 0,
      activityLeadName: activity.activityLeadName || "Not assigned",
    }));

    console.log("🔍 getActivities - Final data count:", data.length);
    console.log("🔍 getActivities - Final data sample:", data.slice(0, 2));

    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
          hasNext: page * limit < (totalCount[0]?.count || 0),
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
    const activityData = await db
      .select({
        // Activity fields
        id: activities.id,
        title: activities.title,
        description: activities.description,
        type: activities.type,
        status: activities.status,
        startDate: activities.startDate,
        endDate: activities.endDate,
        venue: activities.venue,
        budget: activities.budget,
        actualCost: activities.actualCost,
        numberOfParticipants: activities.numberOfParticipants,
        expectedSessions: activities.expectedSessions,
        objectives: activities.objectives,
        skillCategory: activities.skillCategory,
        outcomes: activities.outcomes,
        challenges: activities.challenges,
        recommendations: activities.recommendations,
        attachments: activities.attachments,
        organization_id: activities.organization_id,
        cluster_id: activities.cluster_id,
        project_id: activities.project_id,
        created_by: activities.created_by,
        created_at: activities.created_at,
        updated_at: activities.updated_at,
        // User fields for activity lead (use email as fallback when name is missing)
        activityLeadName: sql<string>`COALESCE(${users.name}, ${users.email})`,
        // Organization fields
        organizationName: organizations.name,
        // Cluster fields
        clusterName: clusters.name,
        // Project fields
        projectName: projects.name,
        projectAcronym: projects.acronym,
      })
      .from(activities)
      .leftJoin(users, eq(activities.created_by, users.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .leftJoin(clusters, eq(activities.cluster_id, clusters.id))
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .where(eq(activities.id, id))
      .limit(1);

    if (!activityData || activityData.length === 0) {
      return {
        success: false,
        error: "Activity not found",
      };
    }

    const activity = activityData[0];

    // Get participant count
    const participantCountResult = await db
      .select({ count: count() })
      .from(activityParticipants)
      .where(eq(activityParticipants.activity_id, id));

    const participantCount = participantCountResult[0]?.count || 0;

    const enhancedActivity = {
      ...activity,
      organizationName: activity.organizationName || "Unknown",
      projectName: activity.projectName || "Unknown",
      clusterName: activity.clusterName || "Unknown",
      participantCount,
      activityLeadName: activity.activityLeadName || "Not assigned",
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
    if (!data.cluster_id || !data.organization_id) {
      return {
        success: false,
        error: "cluster_id and organization_id are required",
      };
    }

    const [activity] = await db
      .insert(activities)
      .values({
        ...data,
        cluster_id: data.cluster_id,
        project_id: data.project_id,
        organization_id: data.organization_id,
        created_by: data.created_by,
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

    // If activity was marked completed, mark all participants as attended for its sessions
    if (data.status === "completed") {
      try {
        // fetch sessions for the activity
        const sessions = await db.query.activitySessions.findMany({
          where: eq(activitySessions.activity_id, id),
          columns: { id: true },
        });

        const sessionIds = sessions.map(s => s.id);

        // fetch participants for the activity
        const participants = await db.query.activityParticipants.findMany({
          where: eq(activityParticipants.activity_id, id),
          columns: { participant_id: true },
        });

        const participantIds = participants.map(p => p.participant_id);

        if (sessionIds.length > 0 && participantIds.length > 0) {
          // Find existing attendance records for these sessions & participants
          const existing = await db.query.dailyAttendance.findMany({
            where: and(
              inArray(dailyAttendance.session_id, sessionIds),
              inArray(dailyAttendance.participant_id, participantIds)
            ),
            columns: { id: true, session_id: true, participant_id: true },
          });

          const existingSet = new Set(
            existing.map(e => `${e.session_id}::${e.participant_id}`)
          );

          // Prepare inserts for missing attendance records
          const toInsert: NewDailyAttendance[] = [];
          for (const sid of sessionIds) {
            for (const pid of participantIds) {
              const key = `${sid}::${pid}`;
              if (!existingSet.has(key)) {
                toInsert.push({
                  session_id: sid,
                  participant_id: pid,
                  attendance_status: "attended",
                  check_in_time: null,
                  check_out_time: null,
                  notes: null,
                  recorded_by: "system",
                });
              }
            }
          }

          if (toInsert.length > 0) {
            // Insert one-by-one to avoid complex Drizzle overload typing for bulk inserts
            for (const row of toInsert) {
              await db.insert(dailyAttendance).values(row);
            }
          }

          // Update existing records to attended
          if (existing.length > 0) {
            await db
              .update(dailyAttendance)
              .set({ attendance_status: "attended", updated_at: new Date() })
              .where(
                and(
                  inArray(dailyAttendance.session_id, sessionIds),
                  inArray(dailyAttendance.participant_id, participantIds)
                )
              );
          }
        }
      } catch (err) {
        console.error("Error marking attendance when activity completed:", err);
      }
    }
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
    // Delete all related records first (in order of dependencies)
    // 1. Delete interventions (references activities and sessions)
    await db.delete(interventions).where(eq(interventions.activity_id, id));

    // 2. Delete activity sessions (references activities, will cascade to daily attendance)
    await db
      .delete(activitySessions)
      .where(eq(activitySessions.activity_id, id));

    // 3. Delete activity participants
    await db
      .delete(activityParticipants)
      .where(eq(activityParticipants.activity_id, id));

    // 4. Delete activity reports
    await db.delete(activityReports).where(eq(activityReports.activity_id, id));

    // 5. Delete concept notes
    await db.delete(conceptNotes).where(eq(conceptNotes.activity_id, id));

    // Finally delete the activity itself
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

export async function deleteMultipleActivities(
  ids: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    // Delete all related records first (in order of dependencies)
    // 1. Delete interventions (references activities and sessions)
    await db
      .delete(interventions)
      .where(inArray(interventions.activity_id, ids));

    // 2. Delete daily attendance (references sessions, will be deleted when sessions are deleted)
    // Note: This will be handled by cascade delete when sessions are deleted

    // 3. Delete activity sessions (references activities, will cascade to daily attendance)
    await db
      .delete(activitySessions)
      .where(inArray(activitySessions.activity_id, ids));

    // 4. Delete activity participants
    await db
      .delete(activityParticipants)
      .where(inArray(activityParticipants.activity_id, ids));

    // 5. Delete activity reports
    await db
      .delete(activityReports)
      .where(inArray(activityReports.activity_id, ids));

    // 6. Delete concept notes
    await db.delete(conceptNotes).where(inArray(conceptNotes.activity_id, ids));

    // Finally delete the activities
    const deleted = await db
      .delete(activities)
      .where(inArray(activities.id, ids))
      .returning();

    revalidatePath(`/dashboard/activities`);
    // Also revalidate cluster-specific paths for deleted activities
    deleted.forEach(activity => {
      if (activity.cluster_id) {
        revalidatePath(`/dashboard/clusters/${activity.cluster_id}/activities`);
      }
    });

    return {
      success: true,
      deletedCount: deleted.length,
    };
  } catch (error) {
    console.error("Error deleting multiple activities:", error);
    return {
      success: false,
      deletedCount: 0,
      error: "Failed to delete activities",
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
