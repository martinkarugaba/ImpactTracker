"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { participants, organizations } from "@/lib/db/schema";
import { eq, inArray, not, isNull, and } from "drizzle-orm";
import { mapSubCountyToOrgKeyword, findOrganizationIdByKeyword } from "./utils";
import type { PreviewResult, AssignmentResult } from "./types";

/**
 * Function to preview organization assignment fixes
 */
export async function previewOrganizationAssignmentFix(
  clusterId?: string
): Promise<PreviewResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check user permissions
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can preview organization assignment fixes.",
      };
    }

    console.log("Starting organization assignment preview...");

    // Build query conditions
    const whereConditions = [not(isNull(participants.subCounty))];
    if (clusterId) {
      whereConditions.push(eq(participants.cluster_id, clusterId));
    }

    // Get all participants without organization assignments
    const participantsToCheck = await db.query.participants.findMany({
      where:
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        subCounty: true,
        organization_id: true,
      },
    });

    console.log(
      `Found ${participantsToCheck.length} participants to check for organization assignment`
    );

    const participantsToUpdate = [];
    const organizationChanges: Record<string, number> = {};

    // Process each participant
    for (const participant of participantsToCheck) {
      const orgKeyword = await mapSubCountyToOrgKeyword(participant.subCounty);

      if (orgKeyword) {
        const suggestedOrgId = await findOrganizationIdByKeyword(orgKeyword);

        if (suggestedOrgId && participant.organization_id !== suggestedOrgId) {
          const suggestedOrg = await db.query.organizations.findFirst({
            where: eq(organizations.id, suggestedOrgId),
            columns: { name: true },
          });

          // Get current organization name if participant has one
          let currentOrgName = null;
          if (participant.organization_id) {
            const currentOrg = await db.query.organizations.findFirst({
              where: eq(organizations.id, participant.organization_id),
              columns: { name: true },
            });
            currentOrgName = currentOrg?.name || null;
          }

          if (suggestedOrg) {
            participantsToUpdate.push({
              id: participant.id,
              firstName: participant.firstName,
              lastName: participant.lastName,
              subCounty: participant.subCounty,
              currentOrganization: currentOrgName,
              suggestedOrganization: suggestedOrg.name,
            });

            organizationChanges[suggestedOrg.name] =
              (organizationChanges[suggestedOrg.name] || 0) + 1;
          }
        }
      }
    }

    console.log(
      `Preview complete: ${participantsToUpdate.length} participants need organization updates`
    );

    return {
      success: true,
      data: {
        participantsToUpdate,
        summary: {
          totalParticipants: participantsToCheck.length,
          totalToUpdate: participantsToUpdate.length,
          organizationChanges,
        },
      },
    };
  } catch (error) {
    console.error("Error previewing organization assignment fix:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to automatically fix organization assignments based on subcounty mapping
 */
export async function fixOrganizationAssignments(
  clusterId?: string
): Promise<AssignmentResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check user permissions
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can fix organization assignments.",
      };
    }

    console.log("Starting organization assignment fix...");

    // First, get a preview to see what would be changed
    const preview = await previewOrganizationAssignmentFix(clusterId);

    if (!preview.success || !preview.data) {
      return {
        success: false,
        error: preview.error || "Failed to preview changes",
      };
    }

    const { participantsToUpdate } = preview.data;

    if (participantsToUpdate.length === 0) {
      return {
        success: true,
        message: "No organization assignments need to be fixed",
        details: {
          organizationName: "Multiple",
          totalParticipantsFound: preview.data.summary.totalParticipants,
          totalParticipantsUpdated: 0,
          results: [],
        },
      };
    }

    // Group participants by suggested organization
    const participantsByOrg: Record<string, string[]> = {};
    for (const participant of participantsToUpdate) {
      const orgName = participant.suggestedOrganization;
      if (!participantsByOrg[orgName]) {
        participantsByOrg[orgName] = [];
      }
      participantsByOrg[orgName].push(participant.id);
    }

    // Update participants for each organization
    let totalUpdated = 0;
    const results = [];

    for (const [orgName, participantIds] of Object.entries(participantsByOrg)) {
      const orgId = await findOrganizationIdByKeyword(
        orgName.toLowerCase().includes("blessed")
          ? "blessed pillars"
          : orgName.toLowerCase().includes("kazi")
            ? "kazi women"
            : orgName.toLowerCase().includes("balinda")
              ? "balinda"
              : orgName
      );

      if (orgId) {
        await db
          .update(participants)
          .set({
            organization_id: orgId,
            updated_at: new Date(),
          })
          .where(inArray(participants.id, participantIds));

        totalUpdated += participantIds.length;
        results.push({
          subCounty: `Multiple for ${orgName}`,
          participantsFound: participantIds.length,
          participantsUpdated: participantIds.length,
        });

        console.log(
          `Updated ${participantIds.length} participants to organization: ${orgName}`
        );
      }
    }

    console.log(
      `Organization assignment fix complete: ${totalUpdated} participants updated`
    );

    return {
      success: true,
      message: `Successfully updated ${totalUpdated} participants across ${Object.keys(participantsByOrg).length} organizations`,
      details: {
        organizationName: "Multiple",
        totalParticipantsFound: preview.data.summary.totalParticipants,
        totalParticipantsUpdated: totalUpdated,
        results,
      },
    };
  } catch (error) {
    console.error("Error fixing organization assignments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to specifically fix Kyarusozi assignments
 */
export async function fixKyarusoziAssignments(): Promise<AssignmentResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check user permissions
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can fix Kyarusozi assignments.",
      };
    }

    console.log("Starting Kyarusozi assignment fix...");

    // Find Balinda Children's Foundation organization
    const balindaOrgId = await findOrganizationIdByKeyword("balinda");

    if (!balindaOrgId) {
      return {
        success: false,
        error: "Balinda Children's Foundation organization not found",
      };
    }

    // Find all participants from Kyarusozi subcounty
    const kyarusoziParticipants = await db.query.participants.findMany({
      where: eq(participants.subCounty, "kyarusozi"),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        subCounty: true,
        organization_id: true,
      },
    });

    console.log(
      `Found ${kyarusoziParticipants.length} participants from Kyarusozi`
    );

    if (kyarusoziParticipants.length === 0) {
      return {
        success: false,
        error: "No participants found from Kyarusozi subcounty",
      };
    }

    // Filter participants that need updating (not already assigned to Balinda)
    const participantsToUpdate = kyarusoziParticipants.filter(
      p => p.organization_id !== balindaOrgId
    );

    console.log(
      `${participantsToUpdate.length} participants from Kyarusozi need to be reassigned to Balinda Children's Foundation`
    );

    if (participantsToUpdate.length === 0) {
      return {
        success: true,
        message:
          "All Kyarusozi participants are already assigned to Balinda Children's Foundation",
        details: {
          organizationName: "Balinda Children's Foundation",
          totalParticipantsFound: kyarusoziParticipants.length,
          totalParticipantsUpdated: 0,
          results: [
            {
              subCounty: "kyarusozi",
              participantsFound: kyarusoziParticipants.length,
              participantsUpdated: 0,
            },
          ],
        },
      };
    }

    // Extract IDs for batch update
    const participantIds = participantsToUpdate.map(p => p.id);

    // Perform batch update
    await db
      .update(participants)
      .set({
        organization_id: balindaOrgId,
        updated_at: new Date(),
      })
      .where(inArray(participants.id, participantIds));

    console.log(
      `Successfully reassigned ${participantsToUpdate.length} Kyarusozi participants to Balinda Children's Foundation`
    );

    return {
      success: true,
      message: `Successfully reassigned ${participantsToUpdate.length} Kyarusozi participants to Balinda Children's Foundation`,
      details: {
        organizationName: "Balinda Children's Foundation",
        totalParticipantsFound: kyarusoziParticipants.length,
        totalParticipantsUpdated: participantsToUpdate.length,
        results: [
          {
            subCounty: "kyarusozi",
            participantsFound: kyarusoziParticipants.length,
            participantsUpdated: participantsToUpdate.length,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error fixing Kyarusozi assignments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
