"use server";

import { db } from "@/lib/db";
import type {
  ActionResponse,
  ClusterMember,
  ClusterData,
  ClusterUpdateData,
} from "./types";
import { clusters, clusterMembers, organizations } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get all clusters
/**
 * Fetches all clusters from the database
 * @returns {Promise<ActionResponse<Array<typeof clusters.$inferSelect>>>} List of clusters or error message
 */
export async function getClusters(): Promise<
  ActionResponse<Array<typeof clusters.$inferSelect>>
> {
  try {
    console.log("🔄 Attempting to fetch clusters...");

    const clustersList = await db.select().from(clusters);

    console.log(`✅ Successfully fetched ${clustersList.length} clusters`);
    return { success: true, data: clustersList };
  } catch (error) {
    console.error("❌ Error fetching clusters:", error);

    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes("fetch failed")) {
        return {
          success: false,
          error:
            "Database connection failed. Please check your DATABASE_URL and network connectivity.",
        };
      }
      if (error.message.includes("unauthorized")) {
        return {
          success: false,
          error:
            "Database authentication failed. Please check your DATABASE_URL credentials.",
        };
      }
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return { success: false, error: "Failed to fetch clusters" };
  }
}

// Get a single cluster by ID
/**
 * Fetches a single cluster by its ID
 * @param {string} id - The ID of the cluster to fetch
 * @returns {Promise<ActionResponse<typeof clusters.$inferSelect>>} The cluster or error message
 */
export async function getClusterById(
  id: string
): Promise<ActionResponse<typeof clusters.$inferSelect>> {
  try {
    const [cluster] = await db
      .select()
      .from(clusters)
      .where(eq(clusters.id, id));

    if (!cluster) {
      return { success: false, error: "Cluster not found" };
    }

    return { success: true, data: cluster };
  } catch (error) {
    console.error("Error fetching cluster:", error);
    return { success: false, error: "Failed to fetch cluster" };
  }
}

// Get cluster member organizations
/**
 * Fetches all members of a specific cluster
 * @param {string} clusterId - The ID of the cluster
 * @returns {Promise<ActionResponse<ClusterMember[]>>} List of cluster members or error message
 */
export async function getClusterMembers(
  clusterId: string
): Promise<ActionResponse<ClusterMember[]>> {
  try {
    const members = await db
      .select({
        id: clusterMembers.id,
        organization: {
          id: organizations.id,
          name: organizations.name,
          acronym: organizations.acronym,
        },
        created_at: clusterMembers.created_at,
      })
      .from(clusterMembers)
      .innerJoin(
        organizations,
        eq(clusterMembers.organization_id, organizations.id)
      )
      .where(eq(clusterMembers.cluster_id, clusterId));

    return { success: true, data: members };
  } catch (error) {
    console.error("Error fetching cluster members:", error);
    return { success: false, error: "Failed to fetch cluster members" };
  }
}

// Add organization to cluster
/**
 * Adds an organization to a cluster
 * @param {string} clusterId - The ID of the cluster
 * @param {string} organizationId - The ID of the organization to add
 * @returns {Promise<ActionResponse<typeof clusterMembers.$inferSelect>>} The new membership or error message
 */
export async function addClusterMember(
  clusterId: string,
  organizationId: string
): Promise<ActionResponse<typeof clusterMembers.$inferSelect>> {
  try {
    // Check if the membership already exists
    const existingMember = await db
      .select()
      .from(clusterMembers)
      .where(
        and(
          eq(clusterMembers.cluster_id, clusterId),
          eq(clusterMembers.organization_id, organizationId)
        )
      );

    if (existingMember.length > 0) {
      return {
        success: false,
        error: "Organization is already a member of this cluster",
      };
    }

    // Add the organization as a member
    const [member] = await db
      .insert(clusterMembers)
      .values({
        cluster_id: clusterId,
        organization_id: organizationId,
      })
      .returning();

    revalidatePath(`/dashboard/clusters/${clusterId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error("Error adding cluster member:", error);
    return { success: false, error: "Failed to add organization to cluster" };
  }
}

// Remove organization from cluster
/**
 * Removes an organization from a cluster
 * @param {string} membershipId - The ID of the membership to remove
 * @param {string} clusterId - The ID of the cluster
 * @returns {Promise<ActionResponse<void>>} Success status or error message
 */
export async function removeClusterMember(
  membershipId: string,
  clusterId: string
): Promise<ActionResponse<void>> {
  try {
    await db.delete(clusterMembers).where(eq(clusterMembers.id, membershipId));

    revalidatePath(`/dashboard/clusters/${clusterId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing cluster member:", error);
    return {
      success: false,
      error: "Failed to remove organization from cluster",
    };
  }
}

// Get organizations that are not members of the specified cluster
/**
 * Fetches organizations that are not members of a specific cluster
 * @param {string} clusterId - The ID of the cluster
 * @returns {Promise<ActionResponse<Array<typeof organizations.$inferSelect>>>} List of non-member organizations or error message
 */
export async function getNonMemberOrganizations(
  clusterId: string
): Promise<ActionResponse<Array<typeof organizations.$inferSelect>>> {
  try {
    // Get organizations that are not in the clusterMembers table for this cluster
    const result = await db.execute(sql`
      SELECT o.* FROM organizations o
      WHERE NOT EXISTS (
        SELECT 1 FROM cluster_members cm
        WHERE cm.organization_id = o.id
        AND cm.cluster_id = ${clusterId}
      )
    `);

    // Safely type cast the result to an array
    const nonMembers = result as unknown as Array<
      typeof organizations.$inferSelect
    >;

    return { success: true, data: nonMembers };

    return { success: true, data: nonMembers };
  } catch (error) {
    console.error("Error fetching non-member organizations:", error);
    return { success: false, error: "Failed to fetch available organizations" };
  }
}

// Create a new cluster
/**
 * Creates a new cluster
 * @param {ClusterData} data - The cluster data
 * @returns {Promise<ActionResponse<typeof clusters.$inferSelect>>} The created cluster or error message
 */
export async function createCluster(
  data: ClusterData
): Promise<ActionResponse<typeof clusters.$inferSelect>> {
  try {
    const [newCluster] = await db
      .insert(clusters)
      .values({
        name: data.name,
        about: data.about || null,
        country: data.country,
        districts: data.districts,
      })
      .returning();

    revalidatePath("/dashboard/clusters");
    return { success: true, data: newCluster };
  } catch (error) {
    console.error("Error creating cluster:", error);
    return { success: false, error: "Failed to create cluster" };
  }
}

// Update an existing cluster
/**
 * Updates an existing cluster
 * @param {ClusterUpdateData} data - The updated cluster data
 * @returns {Promise<ActionResponse<typeof clusters.$inferSelect>>} The updated cluster or error message
 */
export async function updateCluster(
  data: ClusterUpdateData
): Promise<ActionResponse<typeof clusters.$inferSelect>> {
  try {
    const [updatedCluster] = await db
      .update(clusters)
      .set({
        name: data.name,
        about: data.about || null,
        country: data.country,
        districts: data.districts,
      })
      .where(eq(clusters.id, data.id))
      .returning();

    if (!updatedCluster) {
      return { success: false, error: "Cluster not found" };
    }

    revalidatePath(`/dashboard/clusters/${data.id}`);
    return { success: true, data: updatedCluster };
  } catch (error) {
    console.error("Error updating cluster:", error);
    return { success: false, error: "Failed to update cluster" };
  }
}

// Delete a cluster
export async function deleteCluster(id: string) {
  try {
    // Check if the cluster exists
    const [existingCluster] = await db
      .select()
      .from(clusters)
      .where(eq(clusters.id, id));

    if (!existingCluster) {
      return { success: false, error: "Cluster not found" };
    }

    // Delete related cluster members first to avoid foreign key constraints
    await db.delete(clusterMembers).where(eq(clusterMembers.cluster_id, id));

    // Delete the cluster
    await db.delete(clusters).where(eq(clusters.id, id));

    revalidatePath("/dashboard/clusters");
    return { success: true };
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return { success: false, error: "Failed to delete cluster" };
  }
}
