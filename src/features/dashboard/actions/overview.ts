"use server";

import { db } from "@/lib/db";
import {
  participants,
  activities,
  vslas,
  vslaMembers,
  conceptNotes,
  organizationMembers,
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

    // Get user's organization context (if applicable)
    let userOrgId: string | undefined;

    // For non-super_admin users, find their organization
    if (session.user.role !== "super_admin") {
      const userMembership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.user_id, session.user.id),
      });
      userOrgId = userMembership?.organization_id;
    }

    // Participants metrics
    const participantsQuery = userOrgId
      ? eq(participants.organization_id, userOrgId)
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
    const activitiesQuery = userOrgId
      ? eq(activities.organization_id, userOrgId)
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
    const vslasQuery = userOrgId
      ? eq(vslas.organization_id, userOrgId)
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

    // Concept Notes metrics
    const conceptNotesQuery = userOrgId
      ? sql`EXISTS (SELECT 1 FROM ${activities} WHERE ${activities.id} = ${conceptNotes.activity_id} AND ${activities.organization_id} = ${userOrgId})`
      : undefined;

    const [conceptNoteStats] = await db
      .select({
        total: count(),
      })
      .from(conceptNotes)
      .where(conceptNotesQuery);

    const [conceptNotesThisMonth] = await db
      .select({ count: count() })
      .from(conceptNotes)
      .where(
        and(conceptNotesQuery, gte(conceptNotes.created_at, thisMonthStart))
      );

    const [conceptNotesLastMonth] = await db
      .select({ count: count() })
      .from(conceptNotes)
      .where(
        and(
          conceptNotesQuery,
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

    // Get user's organization context (if applicable)
    let userOrgId: string | undefined;

    // For non-super_admin users, find their organization
    if (session.user.role !== "super_admin") {
      const userMembership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.user_id, session.user.id),
      });
      userOrgId = userMembership?.organization_id;
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

      months.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        participants: participantCount?.count || 0,
        activities: activityCount?.count || 0,
        vslas: vslaCount?.count || 0,
        conceptNotes: conceptNoteCount?.count || 0,
      });
    }

    return { success: true, data: months };
  } catch (error) {
    console.error("Error fetching KPI trend data:", error);
    return { success: false, error: "Failed to fetch trend data" };
  }
}
