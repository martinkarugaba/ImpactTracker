"use server";

import { db } from "@/lib/db";
import { clusters, clusterMembers, organizations } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get all clusters
export async function getClusters() {
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
export async function getClusterById(id: string) {
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
export async function getClusterMembers(clusterId: string) {
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
export async function addClusterMember(
  clusterId: string,
  organizationId: string
) {
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
export async function removeClusterMember(
  membershipId: string,
  clusterId: string
) {
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
export async function getNonMemberOrganizations(clusterId: string) {
  try {
    // Get organizations that are not in the clusterMembers table for this cluster
    const nonMembers = await db.execute(sql`
      SELECT o.* FROM organizations o
      WHERE NOT EXISTS (
        SELECT 1 FROM cluster_members cm
        WHERE cm.organization_id = o.id
        AND cm.cluster_id = ${clusterId}
      )
    `);

    return { success: true, data: nonMembers.rows };
  } catch (error) {
    console.error("Error fetching non-member organizations:", error);
    return { success: false, error: "Failed to fetch available organizations" };
  }
}

// Create a new cluster
export async function createCluster(data: {
  name: string;
  about?: string | null;
  country: string;
  districts: string[];
}) {
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
export async function updateCluster(data: {
  id: string;
  name: string;
  about?: string | null;
  country: string;
  districts: string[];
}) {
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
