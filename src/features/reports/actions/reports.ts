"use server";

import { db } from "@/lib/db";
import {
  activityReports,
  activities,
  projects,
  organizations,
} from "@/lib/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { getUserClusterId } from "@/features/auth/actions";

export type ReportWithDetails = {
  id: string;
  title: string;
  execution_date: Date;
  cluster_name: string;
  venue: string;
  team_leader: string;
  background_purpose: string;
  progress_achievements: string;
  challenges_recommendations: string;
  lessons_learned: string;
  follow_up_actions: string[];
  actual_cost: number | null;
  number_of_participants: number | null;
  created_by: string;
  created_at: Date | null;
  updated_at: Date | null;
  activity_id: string;
  // Activity details
  activity_title?: string;
  activity_type?: string;
  activity_status?: string;
  project_name?: string;
  organization_name?: string;
};

export type ReportsFilters = {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  activityType?: string;
  clusterId?: string;
};

export type ReportsMetrics = {
  totalReports: number;
  draftReports: number;
  submittedReports: number;
  reviewedReports: number;
  totalParticipants: number;
  totalCost: number;
  thisMonthReports: number;
  lastMonthReports: number;
};

export type ReportsResponse = {
  success: boolean;
  data?: {
    reports: ReportWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
};

export type ReportsMetricsResponse = {
  success: boolean;
  data?: ReportsMetrics;
  error?: string;
};

export async function getReports(
  page: number = 1,
  limit: number = 20,
  filters: ReportsFilters = {}
): Promise<ReportsResponse> {
  try {
    const clusterId = await getUserClusterId();
    if (!clusterId) {
      return {
        success: false,
        error: "No cluster assigned",
      };
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(activities.cluster_id, clusterId)];

    if (filters.search) {
      whereConditions.push(
        sql`(${activityReports.title} ILIKE ${`%${filters.search}%`} OR 
            ${activityReports.background_purpose} ILIKE ${`%${filters.search}%`} OR
            ${activities.title} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (filters.dateFrom) {
      whereConditions.push(
        gte(activityReports.execution_date, new Date(filters.dateFrom))
      );
    }

    if (filters.dateTo) {
      whereConditions.push(
        lte(activityReports.execution_date, new Date(filters.dateTo))
      );
    }

    if (filters.activityType) {
      whereConditions.push(eq(activities.type, filters.activityType));
    }

    // Get reports with activity details
    const reportsQuery = db
      .select({
        id: activityReports.id,
        title: activityReports.title,
        execution_date: activityReports.execution_date,
        cluster_name: activityReports.cluster_name,
        venue: activityReports.venue,
        team_leader: activityReports.team_leader,
        background_purpose: activityReports.background_purpose,
        progress_achievements: activityReports.progress_achievements,
        challenges_recommendations: activityReports.challenges_recommendations,
        lessons_learned: activityReports.lessons_learned,
        follow_up_actions: activityReports.follow_up_actions,
        actual_cost: activityReports.actual_cost,
        number_of_participants: activityReports.number_of_participants,
        created_by: activityReports.created_by,
        created_at: activityReports.created_at,
        updated_at: activityReports.updated_at,
        activity_id: activityReports.activity_id,
        activity_title: activities.title,
        activity_type: activities.type,
        activity_status: activities.status,
        project_name: projects.name,
        organization_name: organizations.name,
      })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .where(and(...whereConditions))
      .orderBy(desc(activityReports.created_at))
      .limit(limit)
      .offset(offset);

    const reports = await reportsQuery;

    // Get total count
    const totalQuery = db
      .select({ count: sql`count(*)` })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(and(...whereConditions));

    const [{ count }] = await totalQuery;
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        reports: reports as ReportWithDetails[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return {
      success: false,
      error: "Failed to fetch reports",
    };
  }
}

export async function getReportsMetrics(): Promise<ReportsMetricsResponse> {
  try {
    const clusterId = await getUserClusterId();
    if (!clusterId) {
      return {
        success: false,
        error: "No cluster assigned",
      };
    }

    // Get total reports count
    const totalReportsQuery = db
      .select({ count: sql`count(*)` })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(eq(activities.cluster_id, clusterId));

    // Get total participants and cost
    const participantsAndCostQuery = db
      .select({
        totalParticipants: sql`COALESCE(SUM(${activityReports.number_of_participants}), 0)`,
        totalCost: sql`COALESCE(SUM(${activityReports.actual_cost}), 0)`,
      })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(eq(activities.cluster_id, clusterId));

    // Get this month's reports
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthQuery = db
      .select({ count: sql`count(*)` })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(
        and(
          eq(activities.cluster_id, clusterId),
          gte(activityReports.created_at, thisMonthStart)
        )
      );

    // Get last month's reports
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const lastMonthQuery = db
      .select({ count: sql`count(*)` })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(
        and(
          eq(activities.cluster_id, clusterId),
          gte(activityReports.created_at, lastMonthStart),
          lte(activityReports.created_at, lastMonthEnd)
        )
      );

    // Execute all queries
    const [
      [{ count: totalReports }],
      [{ totalParticipants, totalCost }],
      [{ count: thisMonthReports }],
      [{ count: lastMonthReports }],
    ] = await Promise.all([
      totalReportsQuery,
      participantsAndCostQuery,
      thisMonthQuery,
      lastMonthQuery,
    ]);

    return {
      success: true,
      data: {
        totalReports: Number(totalReports),
        draftReports: 0, // We don't have draft status in current schema
        submittedReports: Number(totalReports),
        reviewedReports: Number(totalReports),
        totalParticipants: Number(totalParticipants),
        totalCost: Number(totalCost),
        thisMonthReports: Number(thisMonthReports),
        lastMonthReports: Number(lastMonthReports),
      },
    };
  } catch (error) {
    console.error("Error fetching reports metrics:", error);
    return {
      success: false,
      error: "Failed to fetch reports metrics",
    };
  }
}

export async function getActivitiesForReporting() {
  try {
    const clusterId = await getUserClusterId();
    if (!clusterId) {
      return {
        success: false,
        error: "No cluster assigned",
      };
    }

    // Get activities that don't have reports yet or can have multiple reports
    const activitiesQuery = db
      .select({
        id: activities.id,
        title: activities.title,
        type: activities.type,
        status: activities.status,
        start_date: activities.startDate,
        end_date: activities.endDate,
        venue: activities.venue,
        project_name: projects.name,
        organization_name: organizations.name,
      })
      .from(activities)
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .where(eq(activities.cluster_id, clusterId))
      .orderBy(desc(activities.startDate));

    const activitiesData = await activitiesQuery;

    return {
      success: true,
      data: activitiesData,
    };
  } catch (error) {
    console.error("Error fetching activities for reporting:", error);
    return {
      success: false,
      error: "Failed to fetch activities",
    };
  }
}
