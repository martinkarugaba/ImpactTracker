"use server";

import { db } from "@/lib/db";
import {
  clusterUsers,
  users,
  clusters,
  clusterMembers,
  organizations,
  organizationMembers,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/features/auth/auth";

// Get clusters a user belongs to
export async function getUserClusters(userId: string) {
  try {
    const clusterMemberships = await db
      .select({
        cluster: {
          id: clusters.id,
          name: clusters.name,
          about: clusters.about,
          country: clusters.country,
        },
        membership: {
          id: clusterUsers.id,
          role: clusterUsers.role,
          created_at: clusterUsers.created_at,
        },
      })
      .from(clusterUsers)
      .innerJoin(clusters, eq(clusterUsers.cluster_id, clusters.id))
      .where(eq(clusterUsers.user_id, userId));

    const formattedClusters = clusterMemberships.map(item => ({
      ...item.cluster,
      role: item.membership.role,
    }));

    return { success: true, data: formattedClusters };
  } catch (error) {
    console.error("Error fetching user clusters:", error);
    return { success: false, error: "Failed to fetch user clusters" };
  }
}

// Get organizations available to a user based on their cluster memberships
export async function getUserClusterOrganizations(userId: string) {
  try {
    // First get the clusters the user belongs to
    const userClustersResult = await getUserClusters(userId);

    if (
      !userClustersResult.success ||
      !userClustersResult.data ||
      userClustersResult.data.length === 0
    ) {
      return { success: true, data: [] };
    }

    const clusterIds = userClustersResult.data.map(cluster => cluster.id);

    // Now get all organizations that are members of those clusters
    const members = await db
      .select({
        organization: {
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
        },
        cluster: {
          id: clusters.id,
          name: clusters.name,
        },
      })
      .from(clusterMembers)
      .innerJoin(
        organizations,
        eq(clusterMembers.organization_id, organizations.id)
      )
      .innerJoin(clusters, eq(clusterMembers.cluster_id, clusters.id))
      .where(
        eq(clusterMembers.cluster_id, clusterIds[0]) // Start with first cluster
      );

    // Format the response
    const formattedOrgs = members.map(member => ({
      ...member.organization,
      cluster: member.cluster,
    }));

    return { success: true, data: formattedOrgs };
  } catch (error) {
    console.error("Error fetching user cluster organizations:", error);
    return {
      success: false,
      error: "Failed to fetch user cluster organizations",
    };
  }
}

// Get the current user's cluster organizations
export async function getCurrentUserClusterOrganizations() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    return await getUserClusterOrganizations(session.user.id);
  } catch (error) {
    console.error(
      "Error fetching current user's cluster organizations:",
      error
    );
    return { success: false, error: "Failed to fetch cluster organizations" };
  }
}

// Add a user to a cluster
export async function addUserToCluster(
  userId: string,
  clusterId: string,
  role:
    | "super_admin"
    | "cluster_manager"
    | "organization_admin"
    | "organization_member"
    | "user" = "cluster_manager"
) {
  try {
    // Check if already a member
    const existingMember = await db.query.clusterUsers.findFirst({
      where: and(
        eq(clusterUsers.user_id, userId),
        eq(clusterUsers.cluster_id, clusterId)
      ),
    });

    if (existingMember) {
      return { success: true, data: existingMember };
    }

    // Add to cluster
    const [newMember] = await db
      .insert(clusterUsers)
      .values({
        user_id: userId,
        cluster_id: clusterId,
        role: role,
      })
      .returning();

    return { success: true, data: newMember };
  } catch (error) {
    console.error("Error adding user to cluster:", error);
    return { success: false, error: "Failed to add user to cluster" };
  }
}

// Remove a user from a cluster
export async function removeUserFromCluster(userId: string, clusterId: string) {
  try {
    await db
      .delete(clusterUsers)
      .where(
        and(
          eq(clusterUsers.user_id, userId),
          eq(clusterUsers.cluster_id, clusterId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error removing user from cluster:", error);
    return { success: false, error: "Failed to remove user from cluster" };
  }
}

// Get users that belong to a specific cluster
export async function getClusterUsers(clusterId: string) {
  try {
    const clusterMemberships = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        membership: {
          id: clusterUsers.id,
          role: clusterUsers.role,
          created_at: clusterUsers.created_at,
          updated_at: clusterUsers.updated_at,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
        },
      })
      .from(clusterUsers)
      .innerJoin(users, eq(clusterUsers.user_id, users.id))
      .leftJoin(organizationMembers, eq(users.id, organizationMembers.user_id))
      .leftJoin(
        organizations,
        eq(organizationMembers.organization_id, organizations.id)
      )
      .where(eq(clusterUsers.cluster_id, clusterId));

    const formattedUsers = clusterMemberships.map(item => ({
      id: item.user.id,
      name: item.user.name || "Unknown User",
      email: item.user.email,
      role: item.membership.role,
      organization_id: item.organization?.id || null,
      organization_name: item.organization?.name || null,
      created_at: item.membership.created_at,
      updated_at: item.membership.updated_at,
    }));

    return { success: true, data: formattedUsers };
  } catch (error) {
    console.error("Error fetching cluster users:", error);
    return { success: false, error: "Failed to fetch cluster users" };
  }
}
