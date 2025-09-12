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
import { count, sum, sql, eq, and, gte, lte, desc } from "drizzle-orm";
import { auth } from "@/features/auth/auth";

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

export async function getKPIOverviewMetrics(): Promise<{
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

    // Get user's organization and cluster context
    let userOrgId: string | undefined;
    let userClusterIds: string[] = [];

    // For non-super_admin users, find their organization and clusters
    if (session.user.role !== "super_admin") {
      // Get user's organization
      const userMembership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.user_id, session.user.id),
      });
      userOrgId = userMembership?.organization_id;

      // Get user's clusters
      const userClusters = await db.query.clusterUsers.findMany({
        where: eq(clusterUsers.user_id, session.user.id),
      });
      userClusterIds = userClusters.map(uc => uc.cluster_id);
    }

    // Participants metrics - filter by both organization and clusters
    const participantsQuery =
      userOrgId || userClusterIds.length > 0
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
        total: count(),
        males: sum(
          sql`CASE WHEN ${participants.sex} = 'male' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        females: sum(
          sql`CASE WHEN ${participants.sex} = 'female' THEN 1 ELSE 0 END`
        ).mapWith(Number),
      })
      .from(participants)
      .where(participantsQuery);

    const [participantsThisMonth] = await db
      .select({ count: count() })
      .from(participants)
      .where(
        and(participantsQuery, gte(participants.created_at, thisMonthStart))
      );

    const [participantsLastMonth] = await db
      .select({ count: count() })
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
        count: count(),
      })
      .from(participants)
      .where(participantsQuery)
      .groupBy(participants.district)
      .orderBy(desc(count()))
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
        count: count(),
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
      .orderBy(desc(count()));

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
    const activitiesQuery =
      userOrgId || userClusterIds.length > 0
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
        total: count(),
        completed: sum(
          sql`CASE WHEN ${activities.status} = 'completed' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        ongoing: sum(
          sql`CASE WHEN ${activities.status} = 'ongoing' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        planned: sum(
          sql`CASE WHEN ${activities.status} = 'planned' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        cancelled: sum(
          sql`CASE WHEN ${activities.status} = 'cancelled' THEN 1 ELSE 0 END`
        ).mapWith(Number),
      })
      .from(activities)
      .where(activitiesQuery);

    const [activitiesThisMonth] = await db
      .select({ count: count() })
      .from(activities)
      .where(and(activitiesQuery, gte(activities.created_at, thisMonthStart)));

    const [activitiesLastMonth] = await db
      .select({ count: count() })
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
        count: count(),
      })
      .from(activities)
      .where(activitiesQuery)
      .groupBy(activities.status)
      .orderBy(desc(count()));

    // Activities by type
    const activitiesByType = await db
      .select({
        type: activities.type,
        count: count(),
      })
      .from(activities)
      .where(activitiesQuery)
      .groupBy(activities.type)
      .orderBy(desc(count()))
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
    const vslasQuery =
      userOrgId || userClusterIds.length > 0
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
        total: count(),
        active: sum(
          sql`CASE WHEN ${vslas.status} = 'active' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        inactive: sum(
          sql`CASE WHEN ${vslas.status} != 'active' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        totalSavings: sum(vslas.total_savings).mapWith(Number),
        totalLoans: sum(vslas.total_loans).mapWith(Number),
      })
      .from(vslas)
      .where(vslasQuery);

    // VSLA member count
    const [vslaMemberCount] = await db
      .select({
        totalMembers: count(),
      })
      .from(vslaMembers)
      .leftJoin(vslas, eq(vslaMembers.vsla_id, vslas.id))
      .where(vslasQuery);

    const [vslasThisMonth] = await db
      .select({ count: count() })
      .from(vslas)
      .where(and(vslasQuery, gte(vslas.created_at, thisMonthStart)));

    const [vslasLastMonth] = await db
      .select({ count: count() })
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
        count: count(),
        totalSavings: sum(vslas.total_savings).mapWith(Number),
      })
      .from(vslas)
      .where(vslasQuery)
      .groupBy(vslas.district)
      .orderBy(desc(count()))
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
        total: count(),
      })
      .from(conceptNotes)
      .innerJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(activitiesQuery);

    const [conceptNotesThisMonth] = await db
      .select({ count: count() })
      .from(conceptNotes)
      .innerJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(
        and(activitiesQuery, gte(conceptNotes.created_at, thisMonthStart))
      );

    const [conceptNotesLastMonth] = await db
      .select({ count: count() })
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
    const trainingsQuery =
      userOrgId || userClusterIds.length > 0
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
        total: count(),
        completed: sum(
          sql`CASE WHEN ${trainings.status} = 'completed' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        ongoing: sum(
          sql`CASE WHEN ${trainings.status} = 'ongoing' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        planned: sum(
          sql`CASE WHEN ${trainings.status} = 'planned' THEN 1 ELSE 0 END`
        ).mapWith(Number),
      })
      .from(trainings)
      .where(trainingsQuery);

    // Training participants count
    const [trainingParticipantCount] = await db
      .select({
        totalParticipants: count(),
      })
      .from(trainingParticipants)
      .leftJoin(trainings, eq(trainingParticipants.training_id, trainings.id))
      .where(trainingsQuery);

    const [trainingsThisMonth] = await db
      .select({ count: count() })
      .from(trainings)
      .where(and(trainingsQuery, gte(trainings.created_at, thisMonthStart)));

    const [trainingsLastMonth] = await db
      .select({ count: count() })
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
        total: count(),
      })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(activitiesQuery);

    const [activityReportsThisMonth] = await db
      .select({ count: count() })
      .from(activityReports)
      .innerJoin(activities, eq(activityReports.activity_id, activities.id))
      .where(
        and(activitiesQuery, gte(activityReports.created_at, thisMonthStart))
      );

    const [activityReportsLastMonth] = await db
      .select({ count: count() })
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
        total: count(),
        active: sum(
          sql`CASE WHEN ${projects.status} = 'active' THEN 1 ELSE 0 END`
        ).mapWith(Number),
        completed: sum(
          sql`CASE WHEN ${projects.status} = 'completed' THEN 1 ELSE 0 END`
        ).mapWith(Number),
      })
      .from(projects)
      .where(projectsQuery);

    const [projectsThisMonth] = await db
      .select({ count: count() })
      .from(projects)
      .where(and(projectsQuery, gte(projects.createdAt, thisMonthStart)));

    const [projectsLastMonth] = await db
      .select({ count: count() })
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
    const clustersQuery =
      userClusterIds.length > 0
        ? sql`${clusters.id} = ANY(${userClusterIds})`
        : undefined;

    const [clusterStats] = await db
      .select({
        total: count(),
        active: count(), // All clusters are considered active since there's no status field
        totalMembers: sql<number>`0`, // No member count field in clusters table
      })
      .from(clusters)
      .where(clustersQuery);

    const [clustersThisMonth] = await db
      .select({ count: count() })
      .from(clusters)
      .where(and(clustersQuery, gte(clusters.createdAt, thisMonthStart)));

    const [clustersLastMonth] = await db
      .select({ count: count() })
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
        count: count(),
      })
      .from(clusters)
      .where(clustersQuery)
      .groupBy(sql`${clusters.districts}[1]`)
      .orderBy(desc(count()))
      .limit(5);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const metrics: KPIOverviewMetrics = {
      participants: {
        total: participantStats?.total || 0,
        males: participantStats?.males || 0,
        females: participantStats?.females || 0,
        thisMonth: participantsThisMonth?.count || 0,
        lastMonth: participantsLastMonth?.count || 0,
        growth: calculateGrowth(
          participantsThisMonth?.count || 0,
          participantsLastMonth?.count || 0
        ),
        byDistrict: participantsByDistrict.map(p => ({
          district: p.district,
          count: p.count,
        })),
        byAge: participantsByAge.map(p => ({
          ageGroup: p.ageGroup,
          count: p.count,
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
        total: activityStats?.total || 0,
        completed: activityStats?.completed || 0,
        ongoing: activityStats?.ongoing || 0,
        planned: activityStats?.planned || 0,
        cancelled: activityStats?.cancelled || 0,
        thisMonth: activitiesThisMonth?.count || 0,
        lastMonth: activitiesLastMonth?.count || 0,
        growth: calculateGrowth(
          activitiesThisMonth?.count || 0,
          activitiesLastMonth?.count || 0
        ),
        byStatus: activitiesByStatus.map(a => ({
          status: a.status,
          count: a.count,
        })),
        byType: activitiesByType.map(a => ({
          type: a.type,
          count: a.count,
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
        total: vslaStats?.total || 0,
        active: vslaStats?.active || 0,
        inactive: vslaStats?.inactive || 0,
        totalMembers: vslaMemberCount?.totalMembers || 0,
        totalSavings: vslaStats?.totalSavings || 0,
        totalLoans: vslaStats?.totalLoans || 0,
        thisMonth: vslasThisMonth?.count || 0,
        lastMonth: vslasLastMonth?.count || 0,
        growth: calculateGrowth(
          vslasThisMonth?.count || 0,
          vslasLastMonth?.count || 0
        ),
        byDistrict: vslasByDistrict.map(v => ({
          district: v.district,
          count: v.count,
          totalSavings: v.totalSavings || 0,
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
        total: conceptNoteStats?.total || 0,
        thisMonth: conceptNotesThisMonth?.count || 0,
        lastMonth: conceptNotesLastMonth?.count || 0,
        growth: calculateGrowth(
          conceptNotesThisMonth?.count || 0,
          conceptNotesLastMonth?.count || 0
        ),
        recent: recentConceptNotes.map(c => ({
          id: c.id,
          title: c.title,
          activity_lead: c.activity_lead || "Not assigned",
          submission_date: c.submission_date,
        })),
      },
      trainings: {
        total: trainingStats?.total || 0,
        thisMonth: trainingsThisMonth?.count || 0,
        lastMonth: trainingsLastMonth?.count || 0,
        growth: calculateGrowth(
          trainingsThisMonth?.count || 0,
          trainingsLastMonth?.count || 0
        ),
        totalParticipants: trainingParticipantCount?.totalParticipants || 0,
        completed: trainingStats?.completed || 0,
        ongoing: trainingStats?.ongoing || 0,
        planned: trainingStats?.planned || 0,
        recent: recentTrainings.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          startDate: t.startDate,
          totalParticipants: t.totalParticipants,
        })),
      },
      activityReports: {
        total: activityReportStats?.total || 0,
        thisMonth: activityReportsThisMonth?.count || 0,
        lastMonth: activityReportsLastMonth?.count || 0,
        growth: calculateGrowth(
          activityReportsThisMonth?.count || 0,
          activityReportsLastMonth?.count || 0
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
        total: projectStats?.total || 0,
        active: projectStats?.active || 0,
        completed: projectStats?.completed || 0,
        thisMonth: projectsThisMonth?.count || 0,
        lastMonth: projectsLastMonth?.count || 0,
        growth: calculateGrowth(
          projectsThisMonth?.count || 0,
          projectsLastMonth?.count || 0
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
        total: clusterStats?.total || 0,
        active: clusterStats?.active || 0,
        totalMembers: clusterStats?.totalMembers || 0,
        thisMonth: clustersThisMonth?.count || 0,
        lastMonth: clustersLastMonth?.count || 0,
        growth: calculateGrowth(
          clustersThisMonth?.count || 0,
          clustersLastMonth?.count || 0
        ),
        byDistrict: clustersByDistrict.map(c => ({
          district: c.district,
          count: c.count,
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
        .select({ count: count() })
        .from(participants)
        .where(
          and(
            participantsQuery,
            gte(participants.created_at, startOfMonth),
            lte(participants.created_at, endOfMonth)
          )
        );

      const [activityCount] = await db
        .select({ count: count() })
        .from(activities)
        .where(
          and(
            activitiesQuery,
            gte(activities.created_at, startOfMonth),
            lte(activities.created_at, endOfMonth)
          )
        );

      const [vslaCount] = await db
        .select({ count: count() })
        .from(vslas)
        .where(
          and(
            vslasQuery,
            gte(vslas.created_at, startOfMonth),
            lte(vslas.created_at, endOfMonth)
          )
        );

      const [conceptNoteCount] = await db
        .select({ count: count() })
        .from(conceptNotes)
        .where(
          and(
            conceptNotesQuery,
            gte(conceptNotes.created_at, startOfMonth),
            lte(conceptNotes.created_at, endOfMonth)
          )
        );

      const [trainingCount] = await db
        .select({ count: count() })
        .from(trainings)
        .where(
          and(
            trainingsQuery,
            gte(trainings.created_at, startOfMonth),
            lte(trainings.created_at, endOfMonth)
          )
        );

      const [activityReportCount] = await db
        .select({ count: count() })
        .from(activityReports)
        .where(
          and(
            activityReportsQuery,
            gte(activityReports.created_at, startOfMonth),
            lte(activityReports.created_at, endOfMonth)
          )
        );

      const [projectCount] = await db
        .select({ count: count() })
        .from(projects)
        .where(
          and(
            projectsQuery,
            gte(projects.createdAt, startOfMonth),
            lte(projects.createdAt, endOfMonth)
          )
        );

      const [clusterCount] = await db
        .select({ count: count() })
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
        participants: participantCount?.count || 0,
        activities: activityCount?.count || 0,
        vslas: vslaCount?.count || 0,
        conceptNotes: conceptNoteCount?.count || 0,
        trainings: trainingCount?.count || 0,
        activityReports: activityReportCount?.count || 0,
        projects: projectCount?.count || 0,
        clusters: clusterCount?.count || 0,
      });
    }

    return { success: true, data: months };
  } catch (error) {
    console.error("Error fetching KPI trend data:", error);
    return { success: false, error: "Failed to fetch trend data" };
  }
}
