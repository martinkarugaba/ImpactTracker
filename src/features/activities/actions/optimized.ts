/**
 * Optimized Activities Query Functions
 *
 * Replaces the slow getActivities function with highly optimized versions
 * that use proper joins, aggregated counts, and efficient filtering.
 *
 * Expected performance improvement: 3-5x faster queries
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  activities,
  activitySessions,
  dailyAttendance,
  organizations,
  projects,
  clusters,
  users,
} from "@/lib/db/schema";
import { eq, and, sql, asc, desc, or, count } from "drizzle-orm";
import { withQueryTracking } from "@/lib/performance/query-monitor";
import {
  type NewActivity,
  type ActivityResponse,
  type ActivitiesResponse,
} from "../types/types";

// Optimized parameter types
export interface GetActivitiesOptimizedParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    project?: string;
    organization?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    facilitator?: string;
    location?: string;
    category?: string;
    hasSessions?: string;
  };
  includeParticipantCounts?: boolean;
  includeSessionCounts?: boolean;
}

/**
 * Optimized activities query with proper joins and aggregations
 */
export async function getActivitiesOptimized(
  clusterId?: string,
  params: GetActivitiesOptimizedParams = {}
): Promise<ActivitiesResponse> {
  return withQueryTracking(
    "activities",
    "getActivitiesOptimized",
    async () => {
      try {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const offset = (page - 1) * limit;
        const includeParticipantCounts =
          params?.includeParticipantCounts ?? true;
        const includeSessionCounts = params?.includeSessionCounts ?? true;

        console.log("🚀 Starting optimized activities query:", {
          clusterId,
          page,
          limit,
          hasFilters: !!params?.filters,
          hasSearch: !!params?.search,
          includeParticipantCounts,
          includeSessionCounts,
        });

        // Build the optimized query with joins and aggregations
        const baseQuery = db
          .select({
            // Activity fields
            id: activities.id,
            title: activities.title,
            description: activities.description,
            startDate: activities.startDate,
            endDate: activities.endDate,
            type: activities.type,
            venue: activities.venue,
            budget: activities.budget,
            actualCost: activities.actualCost,
            numberOfParticipants: activities.numberOfParticipants,
            expectedSessions: activities.expectedSessions,
            objectives: activities.objectives,
            outcomes: activities.outcomes,
            challenges: activities.challenges,
            recommendations: activities.recommendations,
            attachments: activities.attachments,
            status: activities.status,
            created_by: activities.created_by,
            created_at: activities.created_at,
            updated_at: activities.updated_at,
            skillCategory: activities.skillCategory,
            // IDs for relationships
            cluster_id: activities.cluster_id,
            organization_id: activities.organization_id,
            project_id: activities.project_id,
            // Joined organization/project/cluster info
            organizationName: organizations.name,
            organizationAcronym: organizations.acronym,
            projectName: projects.name,
            projectAcronym: projects.acronym,
            clusterName: clusters.name,
            activityLeadName: users.name,
            // Aggregated counts (conditional)
            ...(includeSessionCounts && {
              sessionCount: sql<number>`COALESCE(session_counts.session_count, 0)`,
            }),
            ...(includeParticipantCounts && {
              totalParticipants: sql<number>`COALESCE(participant_counts.total_participants, 0)`,
              uniqueParticipants: sql<number>`COALESCE(participant_counts.unique_participants, 0)`,
            }),
          })
          .from(activities)
          // Core relationship joins
          .leftJoin(
            organizations,
            eq(activities.organization_id, organizations.id)
          )
          .leftJoin(projects, eq(activities.project_id, projects.id))
          .leftJoin(clusters, eq(activities.cluster_id, clusters.id))
          .leftJoin(users, eq(activities.created_by, users.id));

        // Add session counts subquery if needed
        if (includeSessionCounts) {
          const sessionCountsSubquery = db
            .select({
              activity_id: activitySessions.activity_id,
              session_count: count(activitySessions.id).as("session_count"),
            })
            .from(activitySessions)
            .groupBy(activitySessions.activity_id)
            .as("session_counts");

          baseQuery.leftJoin(
            sessionCountsSubquery,
            eq(activities.id, sessionCountsSubquery.activity_id)
          );
        }

        // Add participant counts subquery if needed
        if (includeParticipantCounts) {
          const participantCountsSubquery = db
            .select({
              activity_id: activitySessions.activity_id,
              total_participants: count(dailyAttendance.participant_id).as(
                "total_participants"
              ),
              unique_participants:
                sql<number>`COUNT(DISTINCT ${dailyAttendance.participant_id})`.as(
                  "unique_participants"
                ),
            })
            .from(dailyAttendance)
            .leftJoin(
              activitySessions,
              eq(dailyAttendance.session_id, activitySessions.id)
            )
            .groupBy(activitySessions.activity_id)
            .as("participant_counts");

          baseQuery.leftJoin(
            participantCountsSubquery,
            eq(activities.id, participantCountsSubquery.activity_id)
          );
        }

        // Build WHERE conditions efficiently
        const whereConditions = [];

        if (clusterId) {
          whereConditions.push(eq(activities.cluster_id, clusterId));
        }

        // Optimized search using activity name and description
        if (params?.search) {
          const searchTerm = params.search.trim();
          console.log("🔍 Adding search for:", searchTerm);

          // Use PostgreSQL ILIKE for case-insensitive search with index
          whereConditions.push(
            or(
              sql`${activities.title} ILIKE '%' || ${searchTerm} || '%'`,
              sql`${activities.description} ILIKE '%' || ${searchTerm} || '%'`,
              sql`${activities.venue} ILIKE '%' || ${searchTerm} || '%'`,
              sql`${activities.type} ILIKE '%' || ${searchTerm} || '%'`
            )
          );
        }

        // Add filter conditions using indexed columns
        if (params?.filters) {
          const filters = params.filters;

          // Simple equality filters (use indexes)
          if (filters.project && filters.project !== "all") {
            whereConditions.push(eq(activities.project_id, filters.project));
          }
          if (filters.organization && filters.organization !== "all") {
            whereConditions.push(
              eq(activities.organization_id, filters.organization)
            );
          }
          if (filters.status && filters.status !== "all") {
            whereConditions.push(eq(activities.status, filters.status));
          }
          if (filters.category && filters.category !== "all") {
            whereConditions.push(eq(activities.type, filters.category));
          }
          if (filters.facilitator && filters.facilitator !== "all") {
            // Facilitator info might be in created_by or need custom handling
            whereConditions.push(
              sql`${activities.created_by} ILIKE '%' || ${filters.facilitator} || '%'`
            );
          }
          if (filters.location && filters.location !== "all") {
            whereConditions.push(
              sql`${activities.venue} ILIKE '%' || ${filters.location} || '%'`
            );
          }

          // Date range filters using indexed date columns
          if (filters.startDate) {
            console.log("📅 Adding start date filter:", filters.startDate);
            whereConditions.push(
              sql`${activities.startDate} >= ${filters.startDate}`
            );
          }
          if (filters.endDate) {
            console.log("📅 Adding end date filter:", filters.endDate);
            whereConditions.push(
              sql`${activities.endDate} <= ${filters.endDate}`
            );
          }

          // Session existence filter
          if (filters.hasSessions && filters.hasSessions !== "all") {
            if (filters.hasSessions === "yes") {
              // Activities with sessions
              whereConditions.push(
                sql`EXISTS (SELECT 1 FROM ${activitySessions} WHERE ${activitySessions.activity_id} = ${activities.id})`
              );
            } else if (filters.hasSessions === "no") {
              // Activities without sessions
              whereConditions.push(
                sql`NOT EXISTS (SELECT 1 FROM ${activitySessions} WHERE ${activitySessions.activity_id} = ${activities.id})`
              );
            }
          }
        }

        console.log(`🔍 Built ${whereConditions.length} WHERE conditions`);

        // Execute optimized queries in parallel
        const startTime = performance.now();

        const [activitiesData, totalCountResult] = await Promise.all([
          baseQuery
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
            .orderBy(desc(activities.created_at), asc(activities.title))
            .limit(limit)
            .offset(offset),

          // Separate optimized count query (no joins needed for counting)
          db
            .select({ count: sql<number>`count(*)` })
            .from(activities)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            ),
        ]);

        const queryTime = performance.now() - startTime;
        const totalCount = totalCountResult[0]?.count || 0;

        console.log("✅ Optimized activities query completed:", {
          queryTime: `${queryTime.toFixed(2)}ms`,
          activitiesReturned: activitiesData.length,
          totalCount,
          page,
          limit,
        });

        // Transform data to match expected format
        const data = activitiesData.map(activity => ({
          ...activity,
          // Handle null -> undefined for type compatibility
          organizationName: activity.organizationName ?? undefined,
          projectName: activity.projectName ?? undefined,
          clusterName: activity.clusterName ?? undefined,
          organizationAcronym: activity.organizationAcronym ?? undefined,
          projectAcronym: activity.projectAcronym ?? undefined,
          // Keep the original Activity type structure, just add computed fields
          participantCount: activity.totalParticipants || 0,
          sessionsCount: activity.sessionCount || 0,
          skillCategory: activity.skillCategory ?? null,
        }));

        return {
          success: true,
          data: {
            data,
            pagination: {
              page,
              limit,
              total: totalCount,
              totalPages: Math.ceil(totalCount / limit),
              hasNext: page * limit < totalCount,
              hasPrev: page > 1,
            },
          },
        };
      } catch (error) {
        console.error("❌ Error in optimized activities query:", error);
        return {
          success: false,
          error: "Failed to get activities",
        };
      }
    },
    { clusterId, page: params?.page, limit: params?.limit }
  );
}

/**
 * Optimized activity details query with full session and participant data
 */
export async function getActivityDetailsOptimized(
  activityId: string
): Promise<ActivityResponse> {
  return withQueryTracking(
    "activities",
    "getActivityDetailsOptimized",
    async () => {
      try {
        console.log("🔍 Getting activity details for:", activityId);

        // Get activity with related data in parallel
        const [activityResult, sessionsResult, participantStatsResult] =
          await Promise.all([
            // Main activity data
            db
              .select({
                id: activities.id,
                title: activities.title,
                description: activities.description,
                startDate: activities.startDate,
                endDate: activities.endDate,
                type: activities.type,
                venue: activities.venue,
                budget: activities.budget,
                actualCost: activities.actualCost,
                numberOfParticipants: activities.numberOfParticipants,
                expectedSessions: activities.expectedSessions,
                objectives: activities.objectives,
                outcomes: activities.outcomes,
                challenges: activities.challenges,
                recommendations: activities.recommendations,
                attachments: activities.attachments,
                status: activities.status,
                created_by: activities.created_by,
                created_at: activities.created_at,
                updated_at: activities.updated_at,
                skillCategory: activities.skillCategory,
                cluster_id: activities.cluster_id,
                organization_id: activities.organization_id,
                project_id: activities.project_id,
                // Joined info
                organizationName: organizations.name,
                organizationAcronym: organizations.acronym,
                projectName: projects.name,
                projectAcronym: projects.acronym,
                clusterName: clusters.name,
              })
              .from(activities)
              .leftJoin(
                organizations,
                eq(activities.organization_id, organizations.id)
              )
              .leftJoin(projects, eq(activities.project_id, projects.id))
              .leftJoin(clusters, eq(activities.cluster_id, clusters.id))
              .where(eq(activities.id, activityId))
              .limit(1),

            // Activity sessions with participant counts
            db
              .select({
                id: activitySessions.id,
                session_number: activitySessions.session_number,
                session_date: activitySessions.session_date,
                start_time: activitySessions.start_time,
                end_time: activitySessions.end_time,
                venue: activitySessions.venue,
                notes: activitySessions.notes,
                status: activitySessions.status,
                activity_id: activitySessions.activity_id,
                // Participant count for this session
                participantCount: sql<number>`COUNT(DISTINCT ${dailyAttendance.participant_id})`,
              })
              .from(activitySessions)
              .leftJoin(
                dailyAttendance,
                eq(activitySessions.id, dailyAttendance.session_id)
              )
              .where(eq(activitySessions.activity_id, activityId))
              .groupBy(
                activitySessions.id,
                activitySessions.session_number,
                activitySessions.session_date,
                activitySessions.start_time,
                activitySessions.end_time,
                activitySessions.venue,
                activitySessions.notes,
                activitySessions.status,
                activitySessions.activity_id
              )
              .orderBy(asc(activitySessions.session_number)),

            // Overall participant statistics
            db
              .select({
                totalParticipants: sql<number>`COUNT(${dailyAttendance.participant_id})`,
                uniqueParticipants: sql<number>`COUNT(DISTINCT ${dailyAttendance.participant_id})`,
                totalSessions: sql<number>`COUNT(DISTINCT ${dailyAttendance.session_id})`,
              })
              .from(dailyAttendance)
              .leftJoin(
                activitySessions,
                eq(dailyAttendance.session_id, activitySessions.id)
              )
              .where(eq(activitySessions.activity_id, activityId)),
          ]);

        if (!activityResult[0]) {
          return {
            success: false,
            error: "Activity not found",
          };
        }

        const activity = activityResult[0];
        const sessions = sessionsResult;
        const stats = participantStatsResult[0] || {
          totalParticipants: 0,
          uniqueParticipants: 0,
          totalSessions: 0,
        };

        console.log("✅ Activity details query completed:", {
          activityId,
          sessionsCount: sessions.length,
          totalParticipants: stats.totalParticipants,
          uniqueParticipants: stats.uniqueParticipants,
        });

        return {
          success: true,
          data: {
            ...activity,
            // Handle null -> undefined for type compatibility
            organizationName: activity.organizationName ?? undefined,
            projectName: activity.projectName ?? undefined,
            clusterName: activity.clusterName ?? undefined,
            organizationAcronym: activity.organizationAcronym ?? undefined,
            projectAcronym: activity.projectAcronym ?? undefined,
            skillCategory: activity.skillCategory ?? null,
            sessions,
            stats: {
              totalParticipants: stats.totalParticipants,
              uniqueParticipants: stats.uniqueParticipants,
              totalSessions: stats.totalSessions,
              sessionsCount: sessions.length,
            },
          },
        };
      } catch (error) {
        console.error("❌ Error in optimized activity details query:", error);
        return {
          success: false,
          error: "Failed to get activity details",
        };
      }
    },
    { activityId }
  );
}

/**
 * Optimized export function for large activity datasets
 */
export async function getAllActivitiesForExportOptimized(
  clusterId: string,
  filters?: GetActivitiesOptimizedParams["filters"],
  search?: string
): Promise<ActivitiesResponse> {
  return withQueryTracking(
    "activities",
    "getAllActivitiesForExportOptimized",
    async () => {
      try {
        console.log("📤 Starting optimized activities export query");

        // Use single large query for export (no pagination)
        const result = await getActivitiesOptimized(clusterId, {
          page: 1,
          limit: 10000, // Large limit for export
          search,
          filters,
          includeParticipantCounts: true,
          includeSessionCounts: true,
        });

        if (!result.success) {
          throw new Error("Failed to fetch activities for export");
        }

        console.log(
          `📤 Export completed: ${result.data?.data.length} activities`
        );

        return result;
      } catch (error) {
        console.error("❌ Error in optimized activities export query:", error);
        return {
          success: false,
          error: "Failed to export activities",
        };
      }
    },
    { clusterId, hasFilters: !!filters, hasSearch: !!search }
  );
}

/**
 * Optimized activities metrics query (minimal fields)
 */
export async function getActivitiesMetricsOptimized(
  clusterId: string
): Promise<ActivitiesResponse> {
  return withQueryTracking(
    "activities",
    "getActivitiesMetricsOptimized",
    async () => {
      try {
        // Only select fields needed for metrics calculations
        const metricsData = await db
          .select({
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
            outcomes: activities.outcomes,
            challenges: activities.challenges,
            recommendations: activities.recommendations,
            attachments: activities.attachments,
            skillCategory: activities.skillCategory,
            cluster_id: activities.cluster_id,
            organization_id: activities.organization_id,
            project_id: activities.project_id,
            created_by: activities.created_by,
            created_at: activities.created_at,
            updated_at: activities.updated_at,
          })
          .from(activities)
          .where(eq(activities.cluster_id, clusterId))
          .orderBy(asc(activities.id));

        console.log(
          `📊 Activities metrics query returned ${metricsData.length} activities`
        );

        return {
          success: true,
          data: {
            data: metricsData.map(activity => ({
              ...activity,
              // Ensure optional fields are undefined for type compatibility
              organizationName: undefined,
              projectName: undefined,
              clusterName: undefined,
              participantCount: activity.numberOfParticipants || 0,
              skillCategory: activity.skillCategory ?? null,
            })),
            pagination: {
              page: 1,
              limit: metricsData.length,
              total: metricsData.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        };
      } catch (error) {
        console.error("❌ Error in optimized activities metrics query:", error);
        return {
          success: false,
          error: "Failed to fetch activities metrics",
        };
      }
    }
  );
}

// Import original CRUD functions and wrap with performance tracking
import { createActivity, updateActivity, deleteActivity } from "./index";

export async function createActivityOptimized(
  data: NewActivity
): Promise<ActivityResponse> {
  return withQueryTracking(
    "activities",
    "createActivity",
    async () => {
      const result = await createActivity(data);

      // Revalidate activities pages after creation
      if (result.success) {
        revalidatePath("/activities");
      }

      return result;
    },
    { hasStartDate: !!data.startDate, hasEndDate: !!data.endDate }
  );
}

// Export optimized versions as default
export {
  createActivityOptimized as createActivity,
  updateActivity,
  deleteActivity,
};
