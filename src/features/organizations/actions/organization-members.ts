"use server";

import { db } from "@/lib/db";
import type { userRole } from "@/lib/db/schema";
import { organizationMembers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/features/auth/auth";

export async function getOrganizationMembers(organizationId: string) {
  try {
    console.log("Fetching members for organization:", organizationId);

    const members = await db.query.organizationMembers.findMany({
      where: eq(organizationMembers.organization_id, organizationId),
    });

    console.log("Raw members data:", members);

    if (!members || members.length === 0) {
      console.log("No members found for organization");
      return { success: true, data: [] };
    }

    // Get user details for each member
    const membersWithUserDetails = await Promise.all(
      members.map(async member => {
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.id, member.user_id),
          });

          if (!user) {
            console.error(`User not found for member ${member.user_id}`);
            return null;
          }

          return {
            id: member.user_id,
            name: user.name || "Unknown User",
            email: user.email,
            role: member.role,
            created_at:
              member.created_at?.toISOString() || new Date().toISOString(),
            updated_at:
              member.updated_at?.toISOString() || new Date().toISOString(),
          };
        } catch (error) {
          console.error(
            `Error fetching user details for member ${member.user_id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out any null values from failed user lookups
    const validMembers = membersWithUserDetails.filter(
      (member): member is NonNullable<typeof member> => member !== null
    );

    console.log("Members with user details:", validMembers);
    return { success: true, data: validMembers };
  } catch (error) {
    console.error("Error in getOrganizationMembers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch members",
      data: [],
    };
  }
}

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: (typeof userRole.enumValues)[number] = "organization_member"
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is already a member
    const existingMember = await db.query.organizationMembers.findFirst({
      where:
        eq(organizationMembers.organization_id, organizationId) &&
        eq(organizationMembers.user_id, userId),
    });

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this organization",
      };
    }

    // Add the member
    await db.insert(organizationMembers).values({
      organization_id: organizationId,
      user_id: userId,
      role: role,
    });

    revalidatePath("/dashboard/organizations/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error adding organization member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add member",
    };
  }
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: (typeof userRole.enumValues)[number]
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .update(organizationMembers)
      .set({ role: role })
      .where(
        eq(organizationMembers.organization_id, organizationId) &&
          eq(organizationMembers.user_id, userId)
      );

    revalidatePath("/dashboard/organizations/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error updating organization member role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .delete(organizationMembers)
      .where(
        eq(organizationMembers.organization_id, organizationId) &&
          eq(organizationMembers.user_id, userId)
      );

    revalidatePath("/dashboard/organizations/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error removing organization member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

export async function getAllUsers() {
  try {
    console.log("Fetching all users from database");
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });
    console.log("Users fetched:", allUsers);

    return { success: true, data: allUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
