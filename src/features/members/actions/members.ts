"use server";

import { db } from "@/lib/db";
import { clusterMembers, organizations, projects } from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, isNull } from "drizzle-orm";
import { getUserClusterId } from "@/features/auth/actions";

export interface ClusterMember {
  id: string;
  organization_id: string;
  cluster_id: string;
  created_at: Date;
  updated_at: Date;
  organization: {
    id: string;
    name: string;
    acronym: string | null;
    country: string | null;
    district: string | null;
    address: string | null;
  };
  project: {
    id: string;
    name: string;
    acronym: string | null;
  } | null;
}

export interface MembersFilters {
  search?: string;
  district?: string;
  country?: string;
}

export interface MembersMetrics {
  totalMembers: number;
  activeProjects: number;
  totalDistricts: number;
  thisMonth: number;
  trends: {
    totalChange: number;
    projectsChange: number;
    districtsChange: number;
    monthlyChange: number;
  };
}

export interface MembersResponse {
  success: boolean;
  data?: {
    members: ClusterMember[];
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
}

export interface MembersMetricsResponse {
  success: boolean;
  data?: MembersMetrics;
  error?: string;
}

export interface AvailableOrganization {
  id: string;
  name: string;
  acronym: string | null;
  district: string | null;
  country: string | null;
}

export interface AvailableOrganizationsResponse {
  success: boolean;
  data?: AvailableOrganization[];
  error?: string;
}

export async function getClusterMembers(
  page: number = 1,
  limit: number = 20,
  filters: MembersFilters = {}
): Promise<MembersResponse> {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    // Build where conditions
    const whereConditions = [eq(clusterMembers.cluster_id, userClusterId)];

    if (filters.search) {
      whereConditions.push(ilike(organizations.name, `%${filters.search}%`));
    }

    if (filters.district) {
      whereConditions.push(eq(organizations.district, filters.district));
    }

    if (filters.country) {
      whereConditions.push(eq(organizations.country, filters.country));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(clusterMembers)
      .leftJoin(
        organizations,
        eq(clusterMembers.organization_id, organizations.id)
      )
      .where(and(...whereConditions));

    const total = totalResult.count as number;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const membersData = await db
      .select({
        id: clusterMembers.id,
        organization_id: clusterMembers.organization_id,
        cluster_id: clusterMembers.cluster_id,
        created_at: clusterMembers.created_at,
        updated_at: clusterMembers.updated_at,
        organization: {
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
          country: organizations.country,
          district: organizations.district,
          address: organizations.address,
        },
        project: {
          id: projects.id,
          name: projects.name,
          acronym: projects.acronym,
        },
      })
      .from(clusterMembers)
      .leftJoin(
        organizations,
        eq(clusterMembers.organization_id, organizations.id)
      )
      .leftJoin(projects, eq(organizations.project_id, projects.id))
      .where(and(...whereConditions))
      .orderBy(desc(clusterMembers.created_at))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        members: membersData as ClusterMember[],
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
    console.error("Error fetching cluster members:", error);
    return {
      success: false,
      error: "Failed to fetch cluster members",
    };
  }
}

export async function getMembersMetrics(): Promise<MembersMetricsResponse> {
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

    // Get current metrics
    const membersResult = await db
      .select({
        total: sql`count(*)`,
        district: organizations.district,
        project_id: organizations.project_id,
      })
      .from(clusterMembers)
      .leftJoin(
        organizations,
        eq(clusterMembers.organization_id, organizations.id)
      )
      .where(eq(clusterMembers.cluster_id, userClusterId))
      .groupBy(organizations.district, organizations.project_id);

    const totalMembers = membersResult.length;
    const uniqueDistricts = new Set(
      membersResult.map(r => r.district).filter(Boolean)
    ).size;
    const uniqueProjects = new Set(
      membersResult.map(r => r.project_id).filter(Boolean)
    ).size;

    // Get this month count
    const [thisMonthResult] = await db
      .select({ count: sql`count(*)` })
      .from(clusterMembers)
      .where(
        and(
          eq(clusterMembers.cluster_id, userClusterId),
          eq(clusterMembers.created_at, startOfMonth)
        )
      );

    // Get last month count for trends (simplified calculation)
    const [lastMonthResult] = await db
      .select({ count: sql`count(*)` })
      .from(clusterMembers)
      .where(
        and(
          eq(clusterMembers.cluster_id, userClusterId),
          eq(clusterMembers.created_at, startOfLastMonth)
        )
      );

    const thisMonth = thisMonthResult.count as number;
    const lastMonthTotal = lastMonthResult.count as number;

    // Calculate trends (simplified)
    const totalChange =
      lastMonthTotal > 0
        ? ((totalMembers - lastMonthTotal) / lastMonthTotal) * 100
        : 0;
    const monthlyChange =
      lastMonthTotal > 0
        ? ((thisMonth - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    return {
      success: true,
      data: {
        totalMembers,
        activeProjects: uniqueProjects,
        totalDistricts: uniqueDistricts,
        thisMonth,
        trends: {
          totalChange,
          projectsChange: 0, // Placeholder
          districtsChange: 0, // Placeholder
          monthlyChange,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching members metrics:", error);
    return {
      success: false,
      error: "Failed to fetch metrics",
    };
  }
}

export async function getAvailableOrganizations(): Promise<AvailableOrganizationsResponse> {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    // Get organizations not in any cluster or specifically not in this cluster
    const availableOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        acronym: organizations.acronym,
        district: organizations.district,
        country: organizations.country,
      })
      .from(organizations)
      .leftJoin(
        clusterMembers,
        and(
          eq(clusterMembers.organization_id, organizations.id),
          eq(clusterMembers.cluster_id, userClusterId)
        )
      )
      .where(isNull(clusterMembers.id))
      .orderBy(organizations.name);

    return {
      success: true,
      data: availableOrgs as AvailableOrganization[],
    };
  } catch (error) {
    console.error("Error fetching available organizations:", error);
    return {
      success: false,
      error: "Failed to fetch available organizations",
    };
  }
}

export async function addClusterMember(organizationId: string) {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    // Check if already a member
    const existingMember = await db.query.clusterMembers.findFirst({
      where: and(
        eq(clusterMembers.organization_id, organizationId),
        eq(clusterMembers.cluster_id, userClusterId)
      ),
    });

    if (existingMember) {
      return {
        success: false,
        error: "Organization is already a member of this cluster",
      };
    }

    // Add to cluster
    const [newMember] = await db
      .insert(clusterMembers)
      .values({
        organization_id: organizationId,
        cluster_id: userClusterId,
      })
      .returning();

    return {
      success: true,
      data: newMember,
    };
  } catch (error) {
    console.error("Error adding cluster member:", error);
    return {
      success: false,
      error: "Failed to add organization to cluster",
    };
  }
}

export async function removeClusterMember(memberId: string) {
  try {
    const userClusterId = await getUserClusterId();
    if (!userClusterId) {
      return {
        success: false,
        error: "Unauthorized: No cluster access",
      };
    }

    // Verify the member belongs to the user's cluster before removing
    const member = await db.query.clusterMembers.findFirst({
      where: and(
        eq(clusterMembers.id, memberId),
        eq(clusterMembers.cluster_id, userClusterId)
      ),
    });

    if (!member) {
      return {
        success: false,
        error: "Member not found or not authorized to remove",
      };
    }

    await db.delete(clusterMembers).where(eq(clusterMembers.id, memberId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error removing cluster member:", error);
    return {
      success: false,
      error: "Failed to remove member from cluster",
    };
  }
}
