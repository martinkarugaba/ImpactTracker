"use server";

import { db } from "@/lib/db";
import { vslas, organizations, clusters, projects } from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createVSLASchema, type CreateVSLAInput } from "../schemas/vsla-schema";

export async function createVSLA(data: CreateVSLAInput) {
  try {
    const validatedData = createVSLASchema.parse(data);

    const [vsla] = await db.insert(vslas).values(validatedData).returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: vsla };
  } catch (error) {
    console.error("Error creating VSLA:", error);
    return { success: false, error: "Failed to create VSLA" };
  }
}

export async function getVSLAs(organization_id?: string, cluster_id?: string) {
  try {
    // Build where conditions
    const conditions = [];

    if (organization_id) {
      conditions.push(eq(vslas.organization_id, organization_id));
    }

    if (cluster_id) {
      conditions.push(eq(vslas.cluster_id, cluster_id));
    }

    // Build the query with conditional where clause
    const baseQuery = db
      .select({
        id: vslas.id,
        name: vslas.name,
        code: vslas.code,
        description: vslas.description,
        organization_id: vslas.organization_id,
        cluster_id: vslas.cluster_id,
        project_id: vslas.project_id,
        country: vslas.country,
        district: vslas.district,
        sub_county: vslas.sub_county,
        parish: vslas.parish,
        village: vslas.village,
        address: vslas.address,
        total_members: vslas.total_members,
        total_savings: vslas.total_savings,
        total_loans: vslas.total_loans,
        meeting_frequency: vslas.meeting_frequency,
        meeting_day: vslas.meeting_day,
        meeting_time: vslas.meeting_time,
        status: vslas.status,
        formed_date: vslas.formed_date,
        created_at: vslas.created_at,
        updated_at: vslas.updated_at,
        organization: {
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
        },
        cluster: {
          id: clusters.id,
          name: clusters.name,
        },
        project: {
          id: projects.id,
          name: projects.name,
          acronym: projects.acronym,
        },
      })
      .from(vslas)
      .leftJoin(organizations, eq(vslas.organization_id, organizations.id))
      .leftJoin(clusters, eq(vslas.cluster_id, clusters.id))
      .leftJoin(projects, eq(vslas.project_id, projects.id));

    // Apply where conditions if any exist
    const query =
      conditions.length > 0
        ? baseQuery.where(
            conditions.length === 1 ? conditions[0] : and(...conditions)
          )
        : baseQuery;

    const vslaList = await query;

    return { success: true, data: vslaList };
  } catch (error) {
    console.error("Error fetching VSLAs:", error);
    return { success: false, error: "Failed to fetch VSLAs" };
  }
}

export async function getVSLA(id: string) {
  try {
    const [vsla] = await db
      .select({
        id: vslas.id,
        name: vslas.name,
        code: vslas.code,
        description: vslas.description,
        organization_id: vslas.organization_id,
        cluster_id: vslas.cluster_id,
        project_id: vslas.project_id,
        country: vslas.country,
        district: vslas.district,
        sub_county: vslas.sub_county,
        parish: vslas.parish,
        village: vslas.village,
        address: vslas.address,
        total_members: vslas.total_members,
        total_savings: vslas.total_savings,
        total_loans: vslas.total_loans,
        meeting_frequency: vslas.meeting_frequency,
        meeting_day: vslas.meeting_day,
        meeting_time: vslas.meeting_time,
        status: vslas.status,
        formed_date: vslas.formed_date,
        created_at: vslas.created_at,
        updated_at: vslas.updated_at,
        organization: {
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
        },
        cluster: {
          id: clusters.id,
          name: clusters.name,
        },
        project: {
          id: projects.id,
          name: projects.name,
          acronym: projects.acronym,
        },
      })
      .from(vslas)
      .leftJoin(organizations, eq(vslas.organization_id, organizations.id))
      .leftJoin(clusters, eq(vslas.cluster_id, clusters.id))
      .leftJoin(projects, eq(vslas.project_id, projects.id))
      .where(eq(vslas.id, id));

    if (!vsla) {
      return { success: false, error: "VSLA not found" };
    }

    return { success: true, data: vsla };
  } catch (error) {
    console.error("Error fetching VSLA:", error);
    return { success: false, error: "Failed to fetch VSLA" };
  }
}

export async function updateVSLA(id: string, data: Partial<CreateVSLAInput>) {
  try {
    const [vsla] = await db
      .update(vslas)
      .set({ ...data, updated_at: new Date() })
      .where(eq(vslas.id, id))
      .returning();

    revalidatePath("/dashboard/vslas");
    return { success: true, data: vsla };
  } catch (error) {
    console.error("Error updating VSLA:", error);
    return { success: false, error: "Failed to update VSLA" };
  }
}

export async function deleteVSLA(id: string) {
  try {
    await db.delete(vslas).where(eq(vslas.id, id));

    revalidatePath("/dashboard/vslas");
    return { success: true };
  } catch (error) {
    console.error("Error deleting VSLA:", error);
    return { success: false, error: "Failed to delete VSLA" };
  }
}

export async function deleteVSLAs(ids: string[]) {
  try {
    await db.delete(vslas).where(inArray(vslas.id, ids));

    revalidatePath("/dashboard/vslas");
    return { success: true };
  } catch (error) {
    console.error("Error deleting VSLAs:", error);
    return { success: false, error: "Failed to delete VSLAs" };
  }
}

export async function getVSLAsByOrganization(organizationId: string) {
  try {
    const vslaList = await db
      .select({
        id: vslas.id,
        name: vslas.name,
        code: vslas.code,
        status: vslas.status,
        total_members: vslas.total_members,
        total_savings: vslas.total_savings,
        total_loans: vslas.total_loans,
      })
      .from(vslas)
      .where(eq(vslas.organization_id, organizationId));

    return { success: true, data: vslaList };
  } catch (error) {
    console.error("Error fetching VSLAs by organization:", error);
    return { success: false, error: "Failed to fetch VSLAs" };
  }
}

export async function getVSLAsByCluster(clusterId: string) {
  try {
    const vslaList = await db
      .select({
        id: vslas.id,
        name: vslas.name,
        code: vslas.code,
        status: vslas.status,
        total_members: vslas.total_members,
        total_savings: vslas.total_savings,
        total_loans: vslas.total_loans,
        organization: {
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
        },
      })
      .from(vslas)
      .leftJoin(organizations, eq(vslas.organization_id, organizations.id))
      .where(eq(vslas.cluster_id, clusterId));

    return { success: true, data: vslaList };
  } catch (error) {
    console.error("Error fetching VSLAs by cluster:", error);
    return { success: false, error: "Failed to fetch VSLAs" };
  }
}
