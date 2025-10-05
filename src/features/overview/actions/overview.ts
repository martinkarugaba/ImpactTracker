"use server";

import { db } from "@/lib/db";
import {
  participants,
  activities,
  vslas,
  vslaMembers,
  conceptNotes,
  organizationMembers,
  trainings,
  trainingParticipants,
  activityReports,
  projects,
  clusters,
  clusterUsers,
} from "@/lib/db/schema";
import { sql, eq, and, gte, lte, desc } from "drizzle-orm";
import { auth } from "@/features/auth/auth";
import { getUserClusterId } from "@/features/auth/actions";

export interface KPIOverviewMetrics {
  participants: {
    total: number;
    males: number;
    females: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byDistrict: Array<{ district: string; count: number }>;
    byAge: Array<{ ageGroup: string; count: number }>;
    recentRegistrations: Array<{
      id: string;
      firstName: string;
      lastName: string;
      district: string;
      created_at: Date;
    }>;
  };
  activities: {
    total: number;
    completed: number;
    ongoing: number;
    planned: number;
    cancelled: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      startDate: Date;
      venue: string;
    }>;
  };
  vslas: {
    total: number;
    active: number;
    inactive: number;
    totalMembers: number;
    totalSavings: number;
    totalLoans: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byDistrict: Array<{
      district: string;
      count: number;
      totalSavings: number;
    }>;
    topPerformers: Array<{
      id: string;
      name: string;
      totalMembers: number;
      totalSavings: number;
      district: string;
    }>;
  };
  conceptNotes: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    recent: Array<{
      id: string;
      title: string;
      activity_lead: string;
      submission_date: Date | null;
    }>;
  };
  trainings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    totalParticipants: number;
    completed: number;
    ongoing: number;
    planned: number;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      startDate: Date;
      totalParticipants: number;
    }>;
  };
  activityReports: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    recent: Array<{
      id: string;
      title: string;
      execution_date: Date;
      cluster_name: string;
      team_leader: string;
    }>;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      startDate: Date;
      budget: number | null;
    }>;
  };
  clusters: {
    total: number;
    active: number;
    totalMembers: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byDistrict: Array<{
      district: string;
      count: number;
    }>;
  };
  reports: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  successStories: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export async function getKPIOverviewMetrics(clusterId?: string): Promise<{
  success: boolean;
  data?: KPIOverviewMetrics;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Date ranges for growth calculations
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Resolve cluster context (prefer explicit argument, else from user assignment)
    const resolvedClusterId = clusterId || (await getUserClusterId());

    // Get user's organization and cluster context (retain org for any additional scoping if needed)
    let userOrgId: string | undefined;
    let userClusterIds: string[] = resolvedClusterId ? [resolvedClusterId] : [];

    // For non-super_admin users, find their organization and clusters
    if (session.user.role !== "super_admin") {
      // Get user's organization
      const userMembership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.user_id, session.user.id),
      });
      userOrgId = userMembership?.organization_id;
      // If no explicit cluster resolved yet, get user's clusters (fallback)
      if (!resolvedClusterId) {
        const userClusters = await db.query.clusterUsers.findMany({
          where: eq(clusterUsers.user_id, session.user.id),
        });
        userClusterIds = userClusters.map(uc => uc.cluster_id);
      }
    }

    // Participants metrics - filter by both organization and clusters
    const participantsQuery = resolvedClusterId
      ? eq(participants.cluster_id, resolvedClusterId)
      : userOrgId || userClusterIds.length > 0
        ? userOrgId
          ? and(
              eq(participants.organization_id, userOrgId),
              userClusterIds.length > 0
                ? sql`${participants.cluster_id} = ANY(${userClusterIds})`
                : undefined
            )
          : userClusterIds.length > 0
            ? sql`${participants.cluster_id} = ANY(${userClusterIds})`
            : undefined
        : undefined;

    const [participantStats] = await db
      .select({
        total: sql`count(*)`,
        males: sql`sum(CASE WHEN ${participants.sex} = 'male' THEN 1 ELSE 0 END)`,
        females: sql`sum(CASE WHEN ${participants.sex} = 'female' THEN 1 ELSE 0 END)`,
      })
      .from(participants)
      .where(participantsQuery);

    const [participantsThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(participantsQuery, gte(participants.created_at, thisMonthStart))
      );

    const [participantsLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(participants)
      .where(
        and(
          participantsQuery,
          gte(participants.created_at, lastMonthStart),
          lte(participants.created_at, lastMonthEnd)
        )
      );

    // Participants by district
    const participantsByDistrict = await db
      .select({
        district: participants.district,
        count: sql`count(*)`,
      })
      .from(participants)
      .where(participantsQuery)
      .groupBy(participants.district)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Participants by age group
    const participantsByAge = await db
      .select({
        ageGroup: sql<string>`
          CASE 
            WHEN age < 18 THEN 'Under 18'
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 50 THEN '36-50'
            WHEN age > 50 THEN 'Over 50'
            ELSE 'Unknown'
          END
        `.as("ageGroup"),
        count: sql`count(*)`,
      })
      .from(participants)
      .where(participantsQuery)
      .groupBy(
        sql`
        CASE 
          WHEN age < 18 THEN 'Under 18'
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 50 THEN '36-50'
          WHEN age > 50 THEN 'Over 50'
          ELSE 'Unknown'
        END
      `
      )
      .orderBy(desc(sql`count(*)`));

    // Recent participants
    const recentParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        district: participants.district,
        created_at: participants.created_at,
      })
      .from(participants)
      .where(participantsQuery)
      .orderBy(desc(participants.created_at))
      .limit(5);

    // Activities metrics
    const activitiesQuery = resolvedClusterId
      ? eq(activities.cluster_id, resolvedClusterId)
      : userOrgId || userClusterIds.length > 0
        ? userOrgId
          ? and(
              eq(activities.organization_id, userOrgId),
              userClusterIds.length > 0
                ? sql`${activities.cluster_id} = ANY(${userClusterIds})`
                : undefined
            )
          : userClusterIds.length > 0
            ? sql`${activities.cluster_id} = ANY(${userClusterIds})`
            : undefined
        : undefined;

    const [activityStats] = await db
      .select({
        total: sql`count(*)`,
        completed: sql`sum(CASE WHEN ${activities.status} = 'completed' THEN 1 ELSE 0 END)`,
        ongoing: sql`sum(CASE WHEN ${activities.status} = 'ongoing' THEN 1 ELSE 0 END)`,
        planned: sql`sum(CASE WHEN ${activities.status} = 'planned' THEN 1 ELSE 0 END)`,
        cancelled: sql`sum(CASE WHEN ${activities.status} = 'cancelled' THEN 1 ELSE 0 END)`,
      })
      .from(activities)
      .where(activitiesQuery);

    const [activitiesThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(activities)
      .where(and(activitiesQuery, gte(activities.created_at, thisMonthStart)));

    const [activitiesLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(activities)
      .where(
        and(
          activitiesQuery,
          gte(activities.created_at, lastMonthStart),
          lte(activities.created_at, lastMonthEnd)
        )
      );

    // Activities by status
    const activitiesByStatus = await db
      .select({
        status: activities.status,
        count: sql`count(*)`,
      })
      .from(activities)
      .where(activitiesQuery)
      .groupBy(activities.status)
      .orderBy(desc(sql`count(*)`));

    // Activities by type
    const activitiesByType = await db
      .select({
        type: activities.type,
        count: sql`count(*)`,
      })
      .from(activities)
      .where(activitiesQuery)
      .groupBy(activities.type)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Recent activities
    const recentActivities = await db
      .select({
        id: activities.id,
        title: activities.title,
        status: activities.status,
        startDate: activities.startDate,
        venue: activities.venue,
      })
      .from(activities)
      .where(activitiesQuery)
      .orderBy(desc(activities.created_at))
      .limit(5);

    // VSLAs metrics
    const vslasQuery = resolvedClusterId
      ? eq(vslas.cluster_id, resolvedClusterId)
      : userOrgId || userClusterIds.length > 0
        ? userOrgId
          ? and(
              eq(vslas.organization_id, userOrgId),
              userClusterIds.length > 0
                ? sql`${vslas.cluster_id} = ANY(${userClusterIds})`
                : undefined
            )
          : userClusterIds.length > 0
            ? sql`${vslas.cluster_id} = ANY(${userClusterIds})`
            : undefined
        : undefined;

    const [vslaStats] = await db
      .select({
        total: sql`count(*)`,
        active: sql`sum(CASE WHEN ${vslas.status} = 'active' THEN 1 ELSE 0 END)`,
        inactive: sql`sum(CASE WHEN ${vslas.status} != 'active' THEN 1 ELSE 0 END)`,
        totalSavings: sql`sum(${vslas.total_savings})`,
        totalLoans: sql`sum(${vslas.total_loans})`,
      })
      .from(vslas)
      .where(vslasQuery);

    // VSLA member count
    const [vslaMemberCount] = await db
      .select({
        totalMembers: sql`count(*)`,
      })
      .from(vslaMembers)
      .leftJoin(vslas, eq(vslaMembers.vsla_id, vslas.id))
      .where(vslasQuery);

    const [vslasThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(vslas)
      .where(and(vslasQuery, gte(vslas.created_at, thisMonthStart)));

    const [vslasLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(vslas)
      .where(
        and(
          vslasQuery,
          gte(vslas.created_at, lastMonthStart),
          lte(vslas.created_at, lastMonthEnd)
        )
      );

    // VSLAs by district
    const vslasByDistrict = await db
      .select({
        district: vslas.district,
        count: sql`count(*)`,
        totalSavings: sql`sum(${vslas.total_savings})`,
      })
      .from(vslas)
      .where(vslasQuery)
      .groupBy(vslas.district)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Top performing VSLAs
    const topVSLAs = await db
      .select({
        id: vslas.id,
        name: vslas.name,
        totalMembers: vslas.total_members,
        totalSavings: vslas.total_savings,
        district: vslas.district,
      })
      .from(vslas)
      .where(vslasQuery)
      .orderBy(desc(vslas.total_savings))
      .limit(5);

    // Concept notes metrics - filter through activities relationship
    const conceptNotesQuery = undefined; // Will filter through activities relationship

    const [conceptNoteStats] = await db
      .select({
        total: sql`count(*)`,
      })
      .from(conceptNotes)
      .innerJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(activitiesQuery);

    const [conceptNotesThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(conceptNotes)
      .innerJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(
        and(activitiesQuery, gte(conceptNotes.created_at, thisMonthStart))
      );

    const [conceptNotesLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(conceptNotes)
      .innerJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(
        and(
          activitiesQuery,
          gte(conceptNotes.created_at, lastMonthStart),
          lte(conceptNotes.created_at, lastMonthEnd)
        )
      );

    // Recent concept notes
    const recentConceptNotes = await db
      .select({
        id: conceptNotes.id,
        title: conceptNotes.title,
        activity_lead: conceptNotes.activity_lead,
        submission_date: conceptNotes.submission_date,
      })
      .from(conceptNotes)
      .where(conceptNotesQuery)
      .orderBy(desc(conceptNotes.created_at))
      .limit(5);

    // Trainings metrics
    const trainingsQuery = resolvedClusterId
      ? eq(trainings.cluster_id, resolvedClusterId)
      : userOrgId || userClusterIds.length > 0
        ? userOrgId
          ? and(
              eq(trainings.organization_id, userOrgId),
              userClusterIds.length > 0
                ? sql`${trainings.cluster_id} = ANY(${userClusterIds})`
                : undefined
            )
          : userClusterIds.length > 0
            ? sql`${trainings.cluster_id} = ANY(${userClusterIds})`
            : undefined
        : undefined;

    const [trainingStats] = await db
      .select({
        total: sql`count(*)`,
        completed: sql`sum(CASE WHEN ${trainings.status} = 'completed' THEN 1 ELSE 0 END)`,
        ongoing: sql`sum(CASE WHEN ${trainings.status} = 'ongoing' THEN 1 ELSE 0 END)`,
        planned: sql`sum(CASE WHEN ${trainings.status} = 'planned' THEN 1 ELSE 0 END)`,
      })
      .from(trainings)
      .where(trainingsQuery);

    // Training participants count
    const [trainingParticipantCount] = await db
      .select({
        totalParticipants: sql`count(*)`,
      })
      .from(trainingParticipants)
      .leftJoin(trainings, eq(trainingParticipants.training_id, trainings.id))
      .where(trainingsQuery);

    const [trainingsThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(trainings)
      .where(and(trainingsQuery, gte(trainings.created_at, thisMonthStart)));

    const [trainingsLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(trainings)
      .where(
        and(
          trainingsQuery,
          gte(trainings.created_at, lastMonthStart),
          lte(trainings.created_at, lastMonthEnd)
        )
      );

    // Recent trainings
    const recentTrainings = await db
      .select({
        id: trainings.id,
        title: trainings.name,
        status: trainings.status,
        startDate: trainings.trainingDate,
        totalParticipants: trainings.numberOfParticipants,
      })
      .from(trainings)
      .where(trainingsQuery)
      .orderBy(desc(trainings.created_at))
      .limit(5);

    // Activity reports metrics - filter through activities relationship
    const activityReportsQuery = undefined; // Will filter through activities relationship
    const [activityReportStats] = await db
      .select({
        total: sql`count(*)`,
      })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(activitiesQuery);

    const [activityReportsThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(
        and(activitiesQuery, gte(activityReports.created_at, thisMonthStart))
      );

    const [activityReportsLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(
        and(
          activitiesQuery,
          gte(activityReports.created_at, lastMonthStart),
          lte(activityReports.created_at, lastMonthEnd)
        )
      );

    // Recent activity reports
    const recentActivityReports = await db
      .select({
        id: activityReports.id,
        title: activityReports.title,
        execution_date: activityReports.execution_date,
        cluster_name: activityReports.cluster_name,
        team_leader: activityReports.team_leader,
      })
      .from(activityReports)
      .where(activityReportsQuery)
      .orderBy(desc(activityReports.created_at))
      .limit(5);

    // Projects metrics - projects don't have direct cluster/organization fields
    const projectsQuery = undefined; // Projects are linked through participants

    const [projectStats] = await db
      .select({
        total: sql`count(*)`,
        active: sql`sum(CASE WHEN ${projects.status} = 'active' THEN 1 ELSE 0 END)`,
        completed: sql`sum(CASE WHEN ${projects.status} = 'completed' THEN 1 ELSE 0 END)`,
      })
      .from(projects)
      .where(projectsQuery);

    const [projectsThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(and(projectsQuery, gte(projects.createdAt, thisMonthStart)));

    const [projectsLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(
        and(
          projectsQuery,
          gte(projects.createdAt, lastMonthStart),
          lte(projects.createdAt, lastMonthEnd)
        )
      );

    // Recent projects
    const recentProjects = await db
      .select({
        id: projects.id,
        title: projects.name,
        status: projects.status,
        startDate: projects.startDate,
        budget: sql<number>`NULL`,
      })
      .from(projects)
      .where(projectsQuery)
      .orderBy(desc(projects.createdAt))
      .limit(5);

    // Clusters metrics - show only clusters the user belongs to
    const clustersQuery = resolvedClusterId
      ? eq(clusters.id, resolvedClusterId)
      : userClusterIds.length > 0
        ? sql`${clusters.id} = ANY(${userClusterIds})`
        : undefined;

    const [clusterStats] = await db
      .select({
        total: sql`count(*)`,
        active: sql`count(*)`, // All clusters are considered active since there's no status field
        totalMembers: sql<number>`0`, // No member count field in clusters table
      })
      .from(clusters)
      .where(clustersQuery);

    const [clustersThisMonth] = await db
      .select({ count: sql`count(*)` })
      .from(clusters)
      .where(and(clustersQuery, gte(clusters.createdAt, thisMonthStart)));

    const [clustersLastMonth] = await db
      .select({ count: sql`count(*)` })
      .from(clusters)
      .where(
        and(
          clustersQuery,
          gte(clusters.createdAt, lastMonthStart),
          lte(clusters.createdAt, lastMonthEnd)
        )
      );

    // Clusters by district - using first district from districts array
    const clustersByDistrict = await db
      .select({
        district: sql<string>`${clusters.districts}[1]`,
        count: sql`count(*)`,
      })
      .from(clusters)
      .where(clustersQuery)
      .groupBy(sql`${clusters.districts}[1]`)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const metrics: KPIOverviewMetrics = {
      participants: {
        total: (participantStats?.total as number) || 0,
        males: (participantStats?.males as number) || 0,
        females: (participantStats?.females as number) || 0,
        thisMonth: (participantsThisMonth?.count as number) || 0,
        lastMonth: (participantsLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (participantsThisMonth?.count as number) || 0,
          (participantsLastMonth?.count as number) || 0
        ),
        byDistrict: participantsByDistrict.map(p => ({
          district: p.district,
          count: p.count as number,
        })),
        byAge: participantsByAge.map(p => ({
          ageGroup: p.ageGroup,
          count: p.count as number,
        })),
        recentRegistrations: recentParticipants.map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          district: p.district,
          created_at: p.created_at!,
        })),
      },
      activities: {
        total: (activityStats?.total as number) || 0,
        completed: (activityStats?.completed as number) || 0,
        ongoing: (activityStats?.ongoing as number) || 0,
        planned: (activityStats?.planned as number) || 0,
        cancelled: (activityStats?.cancelled as number) || 0,
        thisMonth: (activitiesThisMonth?.count as number) || 0,
        lastMonth: (activitiesLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (activitiesThisMonth?.count as number) || 0,
          (activitiesLastMonth?.count as number) || 0
        ),
        byStatus: activitiesByStatus.map(a => ({
          status: a.status,
          count: a.count as number,
        })),
        byType: activitiesByType.map(a => ({
          type: a.type,
          count: a.count as number,
        })),
        recent: recentActivities.map(a => ({
          id: a.id,
          title: a.title,
          status: a.status,
          startDate: a.startDate,
          venue: a.venue,
        })),
      },
      vslas: {
        total: (vslaStats?.total as number) || 0,
        active: (vslaStats?.active as number) || 0,
        inactive: (vslaStats?.inactive as number) || 0,
        totalMembers: (vslaMemberCount?.totalMembers as number) || 0,
        totalSavings: (vslaStats?.totalSavings as number) || 0,
        totalLoans: (vslaStats?.totalLoans as number) || 0,
        thisMonth: (vslasThisMonth?.count as number) || 0,
        lastMonth: (vslasLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (vslasThisMonth?.count as number) || 0,
          (vslasLastMonth?.count as number) || 0
        ),
        byDistrict: vslasByDistrict.map(v => ({
          district: v.district,
          count: v.count as number,
          totalSavings: (v.totalSavings as number) || 0,
        })),
        topPerformers: topVSLAs.map(v => ({
          id: v.id,
          name: v.name,
          totalMembers: v.totalMembers,
          totalSavings: v.totalSavings,
          district: v.district,
        })),
      },
      conceptNotes: {
        total: (conceptNoteStats?.total as number) || 0,
        thisMonth: (conceptNotesThisMonth?.count as number) || 0,
        lastMonth: (conceptNotesLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (conceptNotesThisMonth?.count as number) || 0,
          (conceptNotesLastMonth?.count as number) || 0
        ),
        recent: recentConceptNotes.map(c => ({
          id: c.id,
          title: c.title,
          activity_lead: c.activity_lead || "Not assigned",
          submission_date: c.submission_date,
        })),
      },
      trainings: {
        total: (trainingStats?.total as number) || 0,
        thisMonth: (trainingsThisMonth?.count as number) || 0,
        lastMonth: (trainingsLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (trainingsThisMonth?.count as number) || 0,
          (trainingsLastMonth?.count as number) || 0
        ),
        totalParticipants:
          (trainingParticipantCount?.totalParticipants as number) || 0,
        completed: (trainingStats?.completed as number) || 0,
        ongoing: (trainingStats?.ongoing as number) || 0,
        planned: (trainingStats?.planned as number) || 0,
        recent: recentTrainings.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          startDate: t.startDate,
          totalParticipants: t.totalParticipants,
        })),
      },
      activityReports: {
        total: (activityReportStats?.total as number) || 0,
        thisMonth: (activityReportsThisMonth?.count as number) || 0,
        lastMonth: (activityReportsLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (activityReportsThisMonth?.count as number) || 0,
          (activityReportsLastMonth?.count as number) || 0
        ),
        recent: recentActivityReports.map(r => ({
          id: r.id,
          title: r.title,
          execution_date: r.execution_date,
          cluster_name: r.cluster_name,
          team_leader: r.team_leader,
        })),
      },
      projects: {
        total: (projectStats?.total as number) || 0,
        active: (projectStats?.active as number) || 0,
        completed: (projectStats?.completed as number) || 0,
        thisMonth: (projectsThisMonth?.count as number) || 0,
        lastMonth: (projectsLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (projectsThisMonth?.count as number) || 0,
          (projectsLastMonth?.count as number) || 0
        ),
        recent: recentProjects.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          startDate: p.startDate || new Date(), // Provide default date if null
          budget: p.budget,
        })),
      },
      clusters: {
        total: (clusterStats?.total as number) || 0,
        active: (clusterStats?.active as number) || 0,
        totalMembers: (clusterStats?.totalMembers as number) || 0,
        thisMonth: (clustersThisMonth?.count as number) || 0,
        lastMonth: (clustersLastMonth?.count as number) || 0,
        growth: calculateGrowth(
          (clustersThisMonth?.count as number) || 0,
          (clustersLastMonth?.count as number) || 0
        ),
        byDistrict: clustersByDistrict.map(c => ({
          district: c.district,
          count: c.count as number,
        })),
      },
      reports: {
        total: 0, // TODO: Implement when reports table is available
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
      },
      successStories: {
        total: 0, // TODO: Implement when success stories table is available
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
      },
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error fetching KPI overview metrics:", error);
    return { success: false, error: "Failed to fetch overview metrics" };
  }
}

export async function getKPITrendData(): Promise<{
  success: boolean;
  data?: Array<{
    month: string;
    participants: number;
    activities: number;
    vslas: number;
    conceptNotes: number;
    trainings: number;
    activityReports: number;
    projects: number;
    clusters: number;
  }>;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get data for the last 6 months
    const months = [];

    // Get user's organization and cluster context
    let userOrgId: string | undefined;

    // For non-super_admin users, find their organization and clusters
    if (session.user.role !== "super_admin") {
      // Get user's organization
      const userMembership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.user_id, session.user.id),
      });
      userOrgId = userMembership?.organization_id;

      // Get user's clusters
      const _userClusters = await db.query.clusterUsers.findMany({
        where: eq(clusterUsers.user_id, session.user.id),
      });
      // Note: Trend data currently only filters by organization, not cluster
    }

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const participantsQuery = userOrgId
        ? eq(participants.organization_id, userOrgId)
        : undefined;
      const activitiesQuery = userOrgId
        ? eq(activities.organization_id, userOrgId)
        : undefined;
      const vslasQuery = userOrgId
        ? eq(vslas.organization_id, userOrgId)
        : undefined;
      const conceptNotesQuery = userOrgId
        ? sql`EXISTS (SELECT 1 FROM ${activities} WHERE ${activities.id} = ${conceptNotes.activity_id} AND ${activities.organization_id} = ${userOrgId})`
        : undefined;
      const trainingsQuery = userOrgId
        ? eq(trainings.organization_id, userOrgId)
        : undefined;
      const activityReportsQuery = userOrgId
        ? sql`EXISTS (SELECT 1 FROM ${activities} WHERE ${activities.id} = ${activityReports.activity_id} AND ${activities.organization_id} = ${userOrgId})`
        : undefined;
      const projectsQuery = undefined; // Projects don't have organization filtering
      const clustersQuery = undefined; // Clusters don't have organization filtering

      const [participantCount] = await db
        .select({ count: sql`count(*)` })
        .from(participants)
        .where(
          and(
            participantsQuery,
            gte(participants.created_at, startOfMonth),
            lte(participants.created_at, endOfMonth)
          )
        );

      const [activityCount] = await db
        .select({ count: sql`count(*)` })
        .from(activities)
        .where(
          and(
            activitiesQuery,
            gte(activities.created_at, startOfMonth),
            lte(activities.created_at, endOfMonth)
          )
        );

      const [vslaCount] = await db
        .select({ count: sql`count(*)` })
        .from(vslas)
        .where(
          and(
            vslasQuery,
            gte(vslas.created_at, startOfMonth),
            lte(vslas.created_at, endOfMonth)
          )
        );

      const [conceptNoteCount] = await db
        .select({ count: sql`count(*)` })
        .from(conceptNotes)
        .where(
          and(
            conceptNotesQuery,
            gte(conceptNotes.created_at, startOfMonth),
            lte(conceptNotes.created_at, endOfMonth)
          )
        );

      const [trainingCount] = await db
        .select({ count: sql`count(*)` })
        .from(trainings)
        .where(
          and(
            trainingsQuery,
            gte(trainings.created_at, startOfMonth),
            lte(trainings.created_at, endOfMonth)
          )
        );

      const [activityReportCount] = await db
        .select({ count: sql`count(*)` })
        .from(activityReports)
        .where(
          and(
            activityReportsQuery,
            gte(activityReports.created_at, startOfMonth),
            lte(activityReports.created_at, endOfMonth)
          )
        );

      const [projectCount] = await db
        .select({ count: sql`count(*)` })
        .from(projects)
        .where(
          and(
            projectsQuery,
            gte(projects.createdAt, startOfMonth),
            lte(projects.createdAt, endOfMonth)
          )
        );

      const [clusterCount] = await db
        .select({ count: sql`count(*)` })
        .from(clusters)
        .where(
          and(
            clustersQuery,
            gte(clusters.createdAt, startOfMonth),
            lte(clusters.createdAt, endOfMonth)
          )
        );

      months.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        participants: (participantCount?.count as number) || 0,
        activities: (activityCount?.count as number) || 0,
        vslas: (vslaCount?.count as number) || 0,
        conceptNotes: (conceptNoteCount?.count as number) || 0,
        trainings: (trainingCount?.count as number) || 0,
        activityReports: (activityReportCount?.count as number) || 0,
        projects: (projectCount?.count as number) || 0,
        clusters: (clusterCount?.count as number) || 0,
      });
    }

    return { success: true, data: months };
  } catch (error) {
    console.error("Error fetching KPI trend data:", error);
    return { success: false, error: "Failed to fetch trend data" };
  }
}
