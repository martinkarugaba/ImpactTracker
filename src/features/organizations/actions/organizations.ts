"use server";

import { db } from "@/lib/db";
import { retryAsync } from "@/lib/db/retry";
import {
  organizations,
  clusters,
  projects,
  clusterUsers,
} from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/features/auth/auth";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "../schemas/organization-schema";
import {
  batchGetDistrictNamesByCodes,
  batchGetSubCountyNamesByCodes,
} from "./organization-location-lookup";

// Type that aligns with what the database expects for organization insert
type OrganizationInsertType = typeof organizations.$inferInsert;

export async function createOrganization(data: CreateOrganizationInput) {
  try {
    const validatedData = createOrganizationSchema.parse(data);

    // Ensure optional fields have default values to satisfy DB schema not-null constraints
    const organizationData = {
      ...validatedData,
      parish: validatedData.parish || "",
      village: validatedData.village || "",
      address: validatedData.address || "",
    };

    // Handle schema discrepancy - check if we need to adapt to old schema format
    // by checking if the 'sub_county' column exists in the database
    try {
      // Try with new schema format first
      const [organization] = await db
        .insert(organizations)
        .values(organizationData)
        .returning();

      revalidatePath("/dashboard/organizations");
      return { success: true, data: organization };
    } catch (error) {
      const schemaError = error as Error;
      // If error mentions 'sub_county' column, it means we need to use the old schema
      if (
        schemaError.message &&
        (schemaError.message.includes("sub_county_id") ||
          schemaError.message.includes("operation_sub_counties") ||
          schemaError.message.includes("sub_county"))
      ) {
        console.warn("Using fallback schema format for organization creation");

        // Adapt to old schema format using the sub_county_id as the single sub_county value
        // Use type assertion with Record<string, unknown> to handle the dynamic property manipulation
        const oldFormatData: Record<string, unknown> = {
          ...organizationData,
          sub_county: organizationData.sub_county_id
            ? [organizationData.sub_county_id]
            : [],
        };

        // Remove new schema fields that don't exist in the database
        delete oldFormatData.sub_county_id;
        delete oldFormatData.operation_sub_counties;

        const [organization] = await db
          .insert(organizations)
          .values(oldFormatData as OrganizationInsertType)
          .returning();

        revalidatePath("/dashboard/organizations");
        return { success: true, data: organization };
      }

      // If it's a different error, rethrow it
      throw schemaError;
    }
  } catch (error) {
    console.error("Error creating organization:", error);
    return { success: false, error: "Failed to create organization" };
  }
}

export async function getOrganizations(cluster_id?: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Determine which clusters the user can see
    let allowedClusterIds: string[] | undefined;

    if (session.user.role === "cluster_manager") {
      // Cluster manager sees only organizations in clusters they manage
      const userClusters = await db
        .select({ cluster_id: clusterUsers.cluster_id })
        .from(clusterUsers)
        .where(
          and(
            eq(clusterUsers.user_id, session.user.id),
            eq(clusterUsers.role, "cluster_manager")
          )
        );

      allowedClusterIds = userClusters.map(uc => uc.cluster_id);

      if (allowedClusterIds.length === 0) {
        return { success: true, data: [] };
      }
    }
    // super_admin sees all organizations (no filter applied)

    const orgs = await retryAsync(() =>
      db
        .select({
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
          cluster_id: organizations.cluster_id,
          project_id: organizations.project_id,
          country: organizations.country,
          district: organizations.district,
          sub_county_id: organizations.sub_county_id,
          operation_sub_counties: organizations.operation_sub_counties,
          parish: organizations.parish,
          village: organizations.village,
          address: organizations.address,
          created_at: organizations.created_at,
          updated_at: organizations.updated_at,
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
        .from(organizations)
        .leftJoin(clusters, eq(organizations.cluster_id, clusters.id))
        .leftJoin(projects, eq(organizations.project_id, projects.id))
        .where(
          cluster_id
            ? eq(organizations.cluster_id, cluster_id)
            : allowedClusterIds
              ? inArray(organizations.cluster_id, allowedClusterIds)
              : undefined
        )
    );

    // Collect all district codes and subcounty codes for batch lookup
    const districtCodes = orgs.map(org => org.district).filter(Boolean);
    const allSubCountyCodes = orgs.flatMap(
      org => org.operation_sub_counties || []
    );

    // Batch lookup location names
    const [districtNameMap, subCountyNameMap] = await Promise.all([
      batchGetDistrictNamesByCodes(districtCodes),
      batchGetSubCountyNamesByCodes(allSubCountyCodes),
    ]);

    // Transform the data to include location names
    const transformedOrgs = orgs.map(org => ({
      ...org,
      // Convert district code to name
      district: districtNameMap[org.district] || org.district,
      // Convert operation subcounty codes to names
      operation_sub_counties: (org.operation_sub_counties || []).map(
        code => subCountyNameMap[code] || code
      ),
      project: org.project
        ? {
            id: org.project.id,
            name: org.project.name,
            acronym: org.project.acronym || "",
          }
        : null,
    }));

    return { success: true, data: transformedOrgs };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return { success: false, error: "Failed to fetch organizations" };
  }
}

export async function getOrganization(id: string) {
  try {
    const [organization] = await retryAsync(() =>
      db
        .select({
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
          cluster_id: organizations.cluster_id,
          project_id: organizations.project_id,
          country: organizations.country,
          district: organizations.district,
          sub_county_id: organizations.sub_county_id,
          operation_sub_counties: organizations.operation_sub_counties,
          parish: organizations.parish,
          village: organizations.village,
          address: organizations.address,
          created_at: organizations.created_at,
          updated_at: organizations.updated_at,
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
        .from(organizations)
        .leftJoin(clusters, eq(organizations.cluster_id, clusters.id))
        .leftJoin(projects, eq(organizations.project_id, projects.id))
        .where(eq(organizations.id, id))
    );

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Lookup location names
    const [districtNameMap, subCountyNameMap] = await Promise.all([
      batchGetDistrictNamesByCodes([organization.district]),
      batchGetSubCountyNamesByCodes(organization.operation_sub_counties || []),
    ]);

    // Transform the data to include location names
    const transformedOrg = {
      ...organization,
      // Convert district code to name
      district: districtNameMap[organization.district] || organization.district,
      // Convert operation subcounty codes to names
      operation_sub_counties: (organization.operation_sub_counties || []).map(
        code => subCountyNameMap[code] || code
      ),
      project: organization.project
        ? {
            id: organization.project.id,
            name: organization.project.name,
            acronym: organization.project.acronym || "",
          }
        : null,
    };

    return { success: true, data: transformedOrg };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return { success: false, error: "Failed to fetch organization" };
  }
}

export async function updateOrganization(
  id: string,
  data: Partial<CreateOrganizationInput>
) {
  try {
    const [organization] = await db
      .update(organizations)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    revalidatePath("/dashboard/organizations");
    return { success: true, data: organization };
  } catch (error) {
    console.error("Error updating organization:", error);
    return { success: false, error: "Failed to update organization" };
  }
}

export async function deleteOrganization(id: string) {
  try {
    await db.delete(organizations).where(eq(organizations.id, id));

    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return { success: false, error: "Failed to delete organization" };
  }
}

export async function deleteOrganizations(ids: string[]) {
  try {
    await db.delete(organizations).where(inArray(organizations.id, ids));

    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting organizations:", error);
    return { success: false, error: "Failed to delete organizations" };
  }
}

export async function getCurrentOrganizationWithCluster(
  organizationId: string
) {
  try {
    // Guard against empty or invalid organizationId
    if (!organizationId || organizationId.trim() === "") {
      return { success: false, error: "Organization ID is required" };
    }

    const [organization] = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        acronym: organizations.acronym,
        cluster_id: organizations.cluster_id,
        project_id: organizations.project_id,
        country: organizations.country,
        district: organizations.district,
        sub_county_id: organizations.sub_county_id,
        operation_sub_counties: organizations.operation_sub_counties,
        parish: organizations.parish,
        village: organizations.village,
        address: organizations.address,
        created_at: organizations.created_at,
        updated_at: organizations.updated_at,
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
      .from(organizations)
      .leftJoin(clusters, eq(organizations.cluster_id, clusters.id))
      .leftJoin(projects, eq(organizations.project_id, projects.id))
      .where(eq(organizations.id, organizationId));

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Lookup location names
    const [districtNameMap, subCountyNameMap] = await Promise.all([
      batchGetDistrictNamesByCodes([organization.district]),
      batchGetSubCountyNamesByCodes(organization.operation_sub_counties || []),
    ]);

    // Transform the data to include location names
    const transformedOrg = {
      ...organization,
      // Convert district code to name
      district: districtNameMap[organization.district] || organization.district,
      // Convert operation subcounty codes to names
      operation_sub_counties: (organization.operation_sub_counties || []).map(
        code => subCountyNameMap[code] || code
      ),
      project: organization.project
        ? {
            id: organization.project.id,
            name: organization.project.name,
            acronym: organization.project.acronym || "",
          }
        : null,
    };

    return { success: true, data: transformedOrg };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return { success: false, error: "Failed to fetch organization" };
  }
}

export async function getOrganizationsByCluster(clusterId: string) {
  try {
    const orgs = await retryAsync(() =>
      db
        .select({
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
          cluster_id: organizations.cluster_id,
          project_id: organizations.project_id,
          country: organizations.country,
          district: organizations.district,
          sub_county_id: organizations.sub_county_id,
          operation_sub_counties: organizations.operation_sub_counties,
          parish: organizations.parish,
          village: organizations.village,
          address: organizations.address,
          created_at: organizations.created_at,
          updated_at: organizations.updated_at,
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
        .from(organizations)
        .leftJoin(clusters, eq(organizations.cluster_id, clusters.id))
        .leftJoin(projects, eq(organizations.project_id, projects.id))
        .where(eq(organizations.cluster_id, clusterId))
    );

    // Collect all district codes and subcounty codes for batch lookup
    const districtCodes = orgs.map(org => org.district).filter(Boolean);
    const allSubCountyCodes = orgs.flatMap(
      org => org.operation_sub_counties || []
    );

    // Batch lookup location names
    const [districtNameMap, subCountyNameMap] = await Promise.all([
      batchGetDistrictNamesByCodes(districtCodes),
      batchGetSubCountyNamesByCodes(allSubCountyCodes),
    ]);

    // Transform the data to include location names
    const transformedOrgs = orgs.map(org => ({
      ...org,
      // Convert district code to name
      district: districtNameMap[org.district] || org.district,
      // Convert operation subcounty codes to names
      operation_sub_counties: (org.operation_sub_counties || []).map(
        code => subCountyNameMap[code] || code
      ),
      project: org.project
        ? {
            id: org.project.id,
            name: org.project.name,
            acronym: org.project.acronym || "",
          }
        : null,
    }));

    return { success: true, data: transformedOrgs };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return { success: false, error: "Failed to fetch organizations" };
  }
}
