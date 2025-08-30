"use server";

import { db } from "@/lib/db";
import { auth } from "@/features/auth/auth";

export async function debugParticipantImport() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    console.log("=== DEBUG IMPORT ===");
    console.log("User ID:", session.user.id);

    // Check existing participants count
    const existingParticipants = await db.query.participants.findMany({
      limit: 5,
      orderBy: (participants, { desc }) => [desc(participants.created_at)],
    });
    console.log("Existing participants count:", existingParticipants.length);

    // Check clusters
    const clusters = await db.query.clusters.findMany({ limit: 3 });
    console.log(
      "Available clusters:",
      clusters.map(c => ({ id: c.id, name: c.name }))
    );

    // Check projects
    const projects = await db.query.projects.findMany({ limit: 3 });
    console.log(
      "Available projects:",
      projects.map(p => ({ id: p.id, name: p.name }))
    );

    // Check organizations
    const organizations = await db.query.organizations.findMany({ limit: 3 });
    console.log(
      "Available organizations:",
      organizations.map(o => ({ id: o.id, name: o.name }))
    );

    // Check user memberships
    const memberships = await db.query.organizationMembers.findMany({
      where: (members, { eq }) => eq(members.user_id, session.user.id),
      with: {
        organization: true,
      },
    });
    console.log(
      "User memberships:",
      memberships.map(m => ({
        orgId: m.organization_id,
        orgName: m.organization?.name,
        role: m.role,
      }))
    );

    return {
      success: true,
      data: {
        userId: session.user.id,
        existingParticipantsCount: existingParticipants.length,
        clusters: clusters.map(c => ({ id: c.id, name: c.name })),
        projects: projects.map(p => ({ id: p.id, name: p.name })),
        organizations: organizations.map(o => ({ id: o.id, name: o.name })),
        memberships: memberships.map(m => ({
          orgId: m.organization_id,
          orgName: m.organization?.name,
          role: m.role,
        })),
      },
    };
  } catch (error) {
    console.error("Debug failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
