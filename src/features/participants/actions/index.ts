"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { participants, organizations, clusterMembers } from "@/lib/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import {
  type NewParticipant,
  type ParticipantResponse,
  type ParticipantsResponse,
} from "../types/types";
import { calculateAge, validateDateOfBirth } from "../lib/age-calculator";

export async function getParticipants(
  clusterId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      cluster?: string;
      project?: string;
      district?: string;
      sex?: string;
      isPWD?: string;
      ageGroup?: string;
    };
  }
): Promise<ParticipantsResponse> {
  try {
    console.log("🔍 getParticipants called with:", {
      clusterId,
      params,
    });

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [eq(participants.cluster_id, clusterId)];

    // Add filter conditions
    if (params?.filters) {
      console.log("📝 Processing filters:", params.filters);

      if (params.filters.project && params.filters.project !== "all") {
        console.log("Adding project filter:", params.filters.project);
        whereConditions.push(
          eq(participants.project_id, params.filters.project)
        );
      }
      if (params.filters.district && params.filters.district !== "all") {
        console.log("Adding district filter:", params.filters.district);
        whereConditions.push(
          eq(participants.district, params.filters.district)
        );
      }
      if (params.filters.sex && params.filters.sex !== "all") {
        console.log("Adding sex filter:", params.filters.sex);
        whereConditions.push(eq(participants.sex, params.filters.sex));
      }
      if (params.filters.isPWD && params.filters.isPWD !== "all") {
        console.log("Adding isPWD filter:", params.filters.isPWD);
        if (params.filters.isPWD === "true") {
          whereConditions.push(eq(participants.isPWD, "yes"));
        } else if (params.filters.isPWD === "false") {
          whereConditions.push(eq(participants.isPWD, "no"));
        }
      }
      if (params.filters.ageGroup && params.filters.ageGroup !== "all") {
        console.log("Adding ageGroup filter:", params.filters.ageGroup);
        if (params.filters.ageGroup === "young") {
          console.log("Applying young filter: age >= 15 AND age <= 35");
          // 15-35 Years
          whereConditions.push(
            sql`${participants.age} >= 15 AND ${participants.age} <= 35`
          );
        } else if (params.filters.ageGroup === "adult") {
          console.log("Applying adult filter: age >= 36 AND age <= 59");
          // 36-59 Years
          whereConditions.push(
            sql`${participants.age} >= 36 AND ${participants.age} <= 59`
          );
        } else if (params.filters.ageGroup === "older") {
          console.log("Applying older filter: age >= 60");
          // 60+ Years
          whereConditions.push(sql`${participants.age} >= 60`);
        }
      }
    }

    // Add search condition if search term is provided
    if (params?.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`;

      whereConditions.push(
        sql`(LOWER(${participants.firstName}) LIKE ${searchTerm} OR 
             LOWER(${participants.lastName}) LIKE ${searchTerm} OR
             LOWER(${participants.designation}) LIKE ${searchTerm} OR
             LOWER(${participants.enterprise}) LIKE ${searchTerm})`
      );
    }

    const [participantsData, totalCount] = await Promise.all([
      db.query.participants.findMany({
        where: and(...whereConditions),
        limit,
        offset,
        orderBy: [asc(participants.firstName), asc(participants.lastName)],
        with: {
          cluster: true,
          project: true,
        },
      }),
      db.query.participants.findMany({
        where: and(...whereConditions),
        columns: {
          id: true,
        },
      }),
    ]);

    // Get organization names for all participants
    const organizationIds = [
      ...new Set(participantsData.map(p => p.organization_id)),
    ];

    let orgs: Array<{ id: string; name: string }> = [];
    if (organizationIds.length > 0) {
      orgs = await db.query.organizations.findMany({
        where: (organizations, { inArray }) =>
          inArray(organizations.id, organizationIds),
        columns: {
          id: true,
          name: true,
        },
      });
    }

    const orgMap = new Map(orgs.map(org => [org.id, org.name]));

    // We want to just pass the district, subCounty, and country values directly
    // The LocationNameCell will handle fetching and displaying the actual names

    // Enhance participant data with organization, project, and location names
    const data = participantsData.map(participant => ({
      ...participant,
      organizationName: orgMap.get(participant.organization_id) || "Unknown",
      projectName: participant.project?.name || "Unknown",
      projectAcronym: participant.project?.acronym || "UNK",
      clusterName: participant.cluster?.name || "Unknown",
      // We'll pass these values directly to the LocationNameCell component later
      districtName: participant.district,
      subCountyName: participant.subCounty,
      countyName: participant.country,
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
    console.error("Error getting participants:", error);
    return {
      success: false,
      error: "Failed to get participants",
    };
  }
}

export async function createParticipant(
  data: NewParticipant
): Promise<ParticipantResponse> {
  try {
    if (!data.cluster_id || !data.project_id || !data.organization_id) {
      return {
        success: false,
        error: "cluster_id, project_id, and organization_id are required",
      };
    }

    // Verify that the organization exists and belongs to the cluster
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, data.organization_id),
    });

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Verify that the organization belongs to the cluster
    const clusterMember = await db.query.clusterMembers.findFirst({
      where: and(
        eq(clusterMembers.organization_id, data.organization_id),
        eq(clusterMembers.cluster_id, data.cluster_id)
      ),
    });

    if (!clusterMember) {
      return {
        success: false,
        error: "Organization does not belong to the specified cluster",
      };
    }

    // Calculate age from date of birth if provided, otherwise leave age as null
    let calculatedAge: number | null = null;
    if (data.dateOfBirth) {
      const validation = validateDateOfBirth(data.dateOfBirth);
      if (validation.isValid) {
        calculatedAge = calculateAge(data.dateOfBirth);
        console.log(
          `Calculated age ${calculatedAge} from date of birth ${data.dateOfBirth}`
        );
      } else {
        console.warn(
          `Invalid date of birth: ${validation.error}, leaving age as null`
        );
        calculatedAge = null;
      }
    } else if (data.age) {
      // Only use provided age if dateOfBirth is empty but age is provided
      calculatedAge = data.age;
      console.log(`Using provided age: ${calculatedAge}`);
    } else {
      console.log(`No date of birth or age provided, leaving age as null`);
      calculatedAge = null;
    }

    const [participant] = await db
      .insert(participants)
      .values({
        ...data,
        age: calculatedAge, // Use calculated age instead of provided age
        cluster_id: data.cluster_id,
        project_id: data.project_id,
        organization_id: data.organization_id,
      })
      .returning();

    revalidatePath(`/clusters/${data.cluster_id}/participants`);
    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error creating participant:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create participant",
    };
  }
}

export async function updateParticipant(
  id: string,
  data: NewParticipant
): Promise<ParticipantResponse> {
  try {
    // Calculate age from date of birth if provided, otherwise leave age as null
    let calculatedAge: number | null = null;
    if (data.dateOfBirth) {
      const validation = validateDateOfBirth(data.dateOfBirth);
      if (validation.isValid) {
        calculatedAge = calculateAge(data.dateOfBirth);
        console.log(
          `Calculated age ${calculatedAge} from date of birth ${data.dateOfBirth}`
        );
      } else {
        console.warn(
          `Invalid date of birth: ${validation.error}, leaving age as null`
        );
        calculatedAge = null;
      }
    } else if (data.age) {
      // Only use provided age if dateOfBirth is empty but age is provided
      calculatedAge = data.age;
      console.log(`Using provided age: ${calculatedAge}`);
    } else {
      console.log(`No date of birth or age provided, leaving age as null`);
      calculatedAge = null;
    }

    const [participant] = await db
      .update(participants)
      .set({
        ...data,
        age: calculatedAge, // Use calculated age instead of provided age
      })
      .where(eq(participants.id, id))
      .returning();

    revalidatePath(`/clusters/${data.cluster_id}/participants`);
    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error updating participant:", error);
    return {
      success: false,
      error: "Failed to update participant",
    };
  }
}

export async function deleteParticipant(
  id: string
): Promise<ParticipantResponse> {
  try {
    const [participant] = await db
      .delete(participants)
      .where(eq(participants.id, id))
      .returning();

    revalidatePath(`/clusters/${participant.cluster_id}/participants`);
    return {
      success: true,
      data: participant,
    };
  } catch (error) {
    console.error("Error deleting participant:", error);
    return {
      success: false,
      error: "Failed to delete participant",
    };
  }
}

export async function getAllParticipantsForMetrics(
  clusterId: string
): Promise<ParticipantsResponse> {
  try {
    // Get all participants for the cluster without pagination or filters
    const allParticipants = await db.query.participants.findMany({
      where: eq(participants.cluster_id, clusterId),
      orderBy: asc(participants.id),
    });

    return {
      success: true,
      data: {
        data: allParticipants,
        pagination: {
          page: 1,
          limit: allParticipants.length,
          total: allParticipants.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching all participants for metrics:", error);
    return {
      success: false,
      error: "Failed to fetch participants metrics",
    };
  }
}
