"use server";

import { auth } from "./auth";
import { db } from "@/lib/db";
import {
  organizationMembers,
  users,
  organizations,
  clusterUsers,
  clusterMembers,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserClusterId() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    // Get the user to check their role
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return null;
    }

    // Super admins can access any cluster - for now, let's get the first available cluster
    // In a multi-cluster setup, you might want to add cluster selection logic
    if (user.role === "super_admin") {
      const firstCluster = await db.query.clusters.findFirst({
        columns: { id: true },
      });
      return firstCluster?.id || null;
    }

    // Check if user is directly assigned to any cluster via clusterUsers table
    // This covers cluster_managers and other users directly assigned to clusters
    const userCluster = await db.query.clusterUsers.findFirst({
      where: eq(clusterUsers.user_id, session.user.id),
      columns: { cluster_id: true },
    });

    if (userCluster?.cluster_id) {
      return userCluster.cluster_id;
    }

    // For users not directly assigned to a cluster, get cluster through organization membership
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      console.log(
        "getUserClusterId: No organization membership found for user"
      );
      return null;
    }

    // Get the cluster ID for that organization
    const [org] = await db
      .select({ cluster_id: organizations.cluster_id })
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (org?.cluster_id) {
      return org.cluster_id;
    }

    // Fallback: resolve cluster via clusterMembers mapping if organization has no cluster_id set
    console.log(
      "getUserClusterId: Organization has no cluster_id. Checking clusterMembers mapping..."
    );
    const orgCluster = await db.query.clusterMembers.findFirst({
      where: eq(clusterMembers.organization_id, organizationId),
      columns: { cluster_id: true },
    });

    if (orgCluster?.cluster_id) {
      return orgCluster.cluster_id;
    }

    console.log(
      "getUserClusterId: No cluster found via direct assignment or organization mapping"
    );
    return null;
  } catch (error) {
    console.error("Error getting cluster ID:", error);
    return null;
  }
}

export async function getOrganizationId() {
  try {
    console.log("Getting organization ID - Starting auth check...");
    const session = await auth();
    if (!session?.user?.id) {
      console.log("No authenticated user session found");
      return null;
    }
    console.log("Found user session for user:", session.user.id);

    // Check if user exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    // If user doesn't exist, return null
    if (!user) {
      console.log(`User ${session.user.id} not found in database`);
      return null;
    }
    console.log("Found user in database:", user.id);

    console.log("Looking up organization membership...");
    const [member] = await db
      .select({ organization_id: organizationMembers.organization_id })
      .from(organizationMembers)
      .where(eq(organizationMembers.user_id, session.user.id));

    if (!member) {
      console.log("No organization membership found for user");
      return null;
    }

    console.log("Found organization membership:", member.organization_id);
    return member.organization_id;
  } catch (error) {
    console.error("Error getting organization ID:", error);
    return null;
  }
}
