"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import {
  users,
  userRole,
  clusterUsers,
  organizationMembers,
  clusters,
  organizations,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  try {
    const session = await auth();
    console.log("Session in getUsers:", session); // Debug log

    if (!session?.user) {
      console.log("No authenticated session found"); // Debug log
      return { success: false, error: "Not authenticated", data: [] };
    }

    console.log("Fetching users from database..."); // Debug log
    const dbUsers = await db.query.users.findMany({
      with: {
        clusters: {
          with: {
            cluster: true,
          },
        },
        organizations: {
          with: {
            organization: true,
          },
        },
      },
    });
    console.log("Raw users data:", dbUsers); // Debug log

    if (!dbUsers || dbUsers.length === 0) {
      console.log("No users found in database"); // Debug log
      return { success: true, data: [] };
    }

    // Transform the data to match our User type
    const transformedUsers = dbUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      cluster: user.clusters[0]?.cluster || null,
      organization: user.organizations[0]?.organization || null,
    }));

    console.log("Transformed users:", transformedUsers); // Debug log
    return { success: true, data: transformedUsers };
  } catch (error) {
    console.error("Error in getUsers:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
      data: [],
    };
  }
}

export async function getUser(id: string) {
  try {
    const session = await auth();

    // Return null if user is not authenticated
    if (!session?.user) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; // Return null on error
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  role: (typeof userRole.enumValues)[number];
  password: string;
  clusterId?: string;
  organizationId?: string;
}) {
  try {
    const session = await auth();

    // Return null if user is not authenticated
    if (!session?.user) {
      return null;
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(data.password, 10);

    const userId = crypto.randomUUID();

    // Create the user first
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
        password: hashedPassword,
      })
      .returning();

    // Create cluster association if clusterId is provided
    if (data.clusterId) {
      await db.insert(clusterUsers).values({
        cluster_id: data.clusterId,
        user_id: userId,
        role: data.role,
      });
    }

    // Create organization association if organizationId is provided
    if (data.organizationId) {
      await db.insert(organizationMembers).values({
        organization_id: data.organizationId,
        user_id: userId,
        role: data.role,
      });
    }

    revalidatePath("/dashboard/users");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: (typeof userRole.enumValues)[number];
  }
) {
  try {
    const session = await auth();

    // Return null if user is not authenticated
    if (!session?.user) {
      return null;
    }

    const [user] = await db
      .update(users)
      .set({
        name: data.name,
        email: data.email,
        role: data.role,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    revalidatePath("/dashboard/users");
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth();

    // Return false if user is not authenticated
    if (!session?.user) {
      return false;
    }

    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/dashboard/users");
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false; // Return false on error
  }
}

export async function updateUserRole(
  id: string,
  role: (typeof userRole.enumValues)[number]
) {
  try {
    const session = await auth();

    // Return false if user is not authenticated
    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    await db
      .update(users)
      .set({
        role: role,
        updated_at: new Date(),
      })
      .where(eq(users.id, id));

    revalidatePath("/dashboard/users");
    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, message: "Failed to update user role" };
  }
}

export async function updateUserCluster(
  userId: string,
  clusterId: string | null
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    // Remove existing cluster associations
    await db.delete(clusterUsers).where(eq(clusterUsers.user_id, userId));

    // Add new cluster association if clusterId is provided
    if (clusterId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user) {
        await db.insert(clusterUsers).values({
          cluster_id: clusterId,
          user_id: userId,
          role: user.role,
        });
      }
    }

    revalidatePath("/dashboard/users");
    return { success: true, message: "User cluster updated successfully" };
  } catch (error) {
    console.error("Error updating user cluster:", error);
    return { success: false, message: "Failed to update user cluster" };
  }
}

export async function updateUserOrganization(
  userId: string,
  organizationId: string | null
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    // Remove existing organization associations
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.user_id, userId));

    // Add new organization association if organizationId is provided
    if (organizationId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user) {
        await db.insert(organizationMembers).values({
          organization_id: organizationId,
          user_id: userId,
          role: user.role,
        });
      }
    }

    revalidatePath("/dashboard/users");
    return {
      success: true,
      message: "User organization updated successfully",
    };
  } catch (error) {
    console.error("Error updating user organization:", error);
    return { success: false, message: "Failed to update user organization" };
  }
}

export async function getClusters() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, data: [] };
    }

    const allClusters = await db.select().from(clusters).orderBy(clusters.name);

    return { success: true, data: allClusters };
  } catch (error) {
    console.error("Error fetching clusters:", error);
    return { success: false, data: [] };
  }
}

export async function getOrganizations() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, data: [] };
    }

    const allOrganizations = await db
      .select()
      .from(organizations)
      .orderBy(organizations.name);

    return { success: true, data: allOrganizations };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return { success: false, data: [] };
  }
}
