"use server";

import { db } from "@/lib/db";
import {
  conceptNotes,
  activities,
  projects,
  organizations,
} from "@/lib/db/schema";
import { eq, desc, and, ilike, count, gte, lte } from "drizzle-orm";
import { getUserClusterId } from "@/features/auth/actions";

export type ConceptNote = {
  id: string;
  activity_id: string;
  content: string;
  title: string;
  charge_code: string | null;
  activity_lead: string | null;
  submission_date: Date | null;
  project_summary: string | null;
  methodology: string | null;
  requirements: string | null;
  participant_details: string | null;
  budget_items: string[];
  budget_notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ConceptNoteWithDetails = ConceptNote & {
  activity: {
    id: string;
    title: string;
    type: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  project: {
    id: string;
    name: string;
    acronym: string | null;
  };
  organization: {
    id: string;
    name: string;
  };
};

export type ConceptNotesFilters = {
  search?: string;
  activityType?: string;
  projectId?: string;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  month?: string;
};

export type ConceptNotesMetrics = {
  totalConceptNotes: number;
  pendingReview: number;
  approved: number;
  thisMonth: number;
  trends: {
    totalChange: number;
    pendingChange: number;
    approvedChange: number;
    monthlyChange: number;
  };
};

export type ConceptNotesResponse = {
  success: boolean;
  data?: {
    conceptNotes: ConceptNoteWithDetails[];
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

export type ConceptNotesMetricsResponse = {
  success: boolean;
  data?: ConceptNotesMetrics;
  error?: string;
};

export type ActivityOption = {
  id: string;
  title: string;
  type: string;
  projectName: string;
  organizationName: string;
};

export type ActivitiesForConceptNotesResponse = {
  success: boolean;
  data?: ActivityOption[];
  error?: string;
};

export async function getConceptNotes(
  page: number = 1,
  limit: number = 20,
  filters: ConceptNotesFilters = {}
): Promise<ConceptNotesResponse> {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    // Build where conditions
    const whereConditions = [eq(activities.cluster_id, userClusterId)];

    if (filters.search) {
      whereConditions.push(ilike(conceptNotes.title, `%${filters.search}%`));
    }

    if (filters.activityType) {
      whereConditions.push(eq(activities.type, filters.activityType));
    }

    if (filters.projectId) {
      whereConditions.push(eq(activities.project_id, filters.projectId));
    }

    if (filters.organizationId) {
      whereConditions.push(
        eq(activities.organization_id, filters.organizationId)
      );
    }

    if (filters.dateFrom) {
      whereConditions.push(
        gte(activities.startDate, new Date(filters.dateFrom))
      );
    }

    if (filters.dateTo) {
      whereConditions.push(lte(activities.endDate, new Date(filters.dateTo)));
    }

    if (filters.submissionDateFrom) {
      whereConditions.push(
        gte(conceptNotes.submission_date, new Date(filters.submissionDateFrom))
      );
    }

    if (filters.submissionDateTo) {
      whereConditions.push(
        lte(conceptNotes.submission_date, new Date(filters.submissionDateTo))
      );
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(conceptNotes)
      .leftJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .where(and(...whereConditions));

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const conceptNotesData = await db
      .select({
        id: conceptNotes.id,
        activity_id: conceptNotes.activity_id,
        content: conceptNotes.content,
        title: conceptNotes.title,
        charge_code: conceptNotes.charge_code,
        activity_lead: conceptNotes.activity_lead,
        submission_date: conceptNotes.submission_date,
        project_summary: conceptNotes.project_summary,
        methodology: conceptNotes.methodology,
        requirements: conceptNotes.requirements,
        participant_details: conceptNotes.participant_details,
        budget_items: conceptNotes.budget_items,
        budget_notes: conceptNotes.budget_notes,
        created_at: conceptNotes.created_at,
        updated_at: conceptNotes.updated_at,
        activity: {
          id: activities.id,
          title: activities.title,
          type: activities.type,
          startDate: activities.startDate,
          endDate: activities.endDate,
        },
        project: {
          id: projects.id,
          name: projects.name,
          acronym: projects.acronym,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
        },
      })
      .from(conceptNotes)
      .leftJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .where(and(...whereConditions))
      .orderBy(desc(conceptNotes.created_at))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        conceptNotes: conceptNotesData as ConceptNoteWithDetails[],
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
    console.error("Error fetching concept notes:", error);
    return {
      success: false,
      error: "Failed to fetch concept notes",
    };
  }
}

export async function getConceptNotesMetrics(): Promise<ConceptNotesMetricsResponse> {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current metrics
    const [currentMetrics] = await db
      .select({
        total: count(),
        pending: count(conceptNotes.id),
        approved: count(conceptNotes.id),
        thisMonth: count(conceptNotes.id),
      })
      .from(conceptNotes)
      .leftJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(eq(activities.cluster_id, userClusterId));

    // Get last month metrics for trends
    const [lastMonthMetrics] = await db
      .select({
        total: count(),
        thisMonth: count(conceptNotes.id),
      })
      .from(conceptNotes)
      .leftJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(
        and(
          eq(activities.cluster_id, userClusterId),
          gte(conceptNotes.created_at, startOfLastMonth),
          lte(conceptNotes.created_at, endOfLastMonth)
        )
      );

    // Get this month count
    const [thisMonthResult] = await db
      .select({ count: count() })
      .from(conceptNotes)
      .leftJoin(activities, eq(conceptNotes.activity_id, activities.id))
      .where(
        and(
          eq(activities.cluster_id, userClusterId),
          gte(conceptNotes.created_at, startOfMonth)
        )
      );

    const totalConceptNotes = currentMetrics.total;
    const thisMonth = thisMonthResult.count;
    const lastMonthTotal = lastMonthMetrics.total;
    const lastMonthThisMonth = lastMonthMetrics.thisMonth;

    // Calculate trends (simplified for now)
    const totalChange =
      lastMonthTotal > 0
        ? ((totalConceptNotes - lastMonthTotal) / lastMonthTotal) * 100
        : 0;
    const monthlyChange =
      lastMonthThisMonth > 0
        ? ((thisMonth - lastMonthThisMonth) / lastMonthThisMonth) * 100
        : 0;

    return {
      success: true,
      data: {
        totalConceptNotes,
        pendingReview: Math.floor(totalConceptNotes * 0.3), // Placeholder
        approved: Math.floor(totalConceptNotes * 0.7), // Placeholder
        thisMonth,
        trends: {
          totalChange,
          pendingChange: 0, // Placeholder
          approvedChange: 0, // Placeholder
          monthlyChange,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching concept notes metrics:", error);
    return {
      success: false,
      error: "Failed to fetch metrics",
    };
  }
}

export async function getActivitiesForConceptNotes(): Promise<ActivitiesForConceptNotesResponse> {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    const activitiesData = await db
      .select({
        id: activities.id,
        title: activities.title,
        type: activities.type,
        projectName: projects.name,
        organizationName: organizations.name,
      })
      .from(activities)
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .where(eq(activities.cluster_id, userClusterId))
      .orderBy(desc(activities.created_at));

    return {
      success: true,
      data: activitiesData as ActivityOption[],
    };
  } catch (error) {
    console.error("Error fetching activities for concept notes:", error);
    return {
      success: false,
      error: "Failed to fetch activities",
    };
  }
}

export async function createConceptNote(data: {
  activity_id: string;
  title: string;
  content: string;
  charge_code?: string;
  activity_lead?: string;
  submission_date?: Date;
  project_summary?: string;
  methodology?: string;
  requirements?: string;
  participant_details?: string;
  budget_items?: string[];
  budget_notes?: string;
}) {
  try {
    const [conceptNote] = await db
      .insert(conceptNotes)
      .values({
        ...data,
        budget_items: data.budget_items || [],
      })
      .returning();

    return {
      success: true,
      data: conceptNote,
    };
  } catch (error) {
    console.error("Error creating concept note:", error);
    return {
      success: false,
      error: "Failed to create concept note",
    };
  }
}
