"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getOrganizationById } from "./utils";
import type { AssignmentResult } from "./types";

/**
 * Function to assign participants from a specific parish to a specific organization
 */
export async function assignParticipantsByParish(
  parishName: string,
  organizationId: string
): Promise<AssignmentResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to assign participants by parish (super_admin or cluster_manager only)
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can assign participants by parish.",
      };
    }

    console.log(
      `Assigning participants from parish ${parishName} to organization ${organizationId}...`
    );

    // Get organization details for logging
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Find all participants from the specified parish
    const participantsToUpdate = await db.query.participants.findMany({
      where: eq(participants.parish, parishName),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        parish: true,
        organization_id: true,
      },
    });

    console.log(
      `Found ${participantsToUpdate.length} participants from parish ${parishName}`
    );

    if (participantsToUpdate.length === 0) {
      return {
        success: false,
        error: `No participants found from parish: ${parishName}`,
      };
    }

    // Filter participants that actually need updating
    const participantsNeedingUpdate = participantsToUpdate.filter(
      p => p.organization_id !== organizationId
    );

    console.log(
      `${participantsNeedingUpdate.length} participants from parish ${parishName} need organization update`
    );

    if (participantsNeedingUpdate.length === 0) {
      return {
        success: true,
        message: `All participants from ${parishName} are already assigned to ${organization.name}`,
        details: {
          organizationName: organization.name,
          totalParticipantsFound: participantsToUpdate.length,
          totalParticipantsUpdated: 0,
          results: [
            {
              parish: parishName,
              participantsFound: participantsToUpdate.length,
              participantsUpdated: 0,
            },
          ],
        },
      };
    }

    // Extract IDs for batch update
    const participantIds = participantsNeedingUpdate.map(p => p.id);

    // Perform batch update using inArray
    await db
      .update(participants)
      .set({
        organization_id: organizationId,
        updated_at: new Date(),
      })
      .where(inArray(participants.id, participantIds));

    console.log(
      `Updated ${participantsNeedingUpdate.length} participants from parish ${parishName} to organization ${organization.name}`
    );

    return {
      success: true,
      message: `Successfully updated ${participantsNeedingUpdate.length} participants from ${parishName} to ${organization.name}`,
      details: {
        organizationName: organization.name,
        totalParticipantsFound: participantsToUpdate.length,
        totalParticipantsUpdated: participantsNeedingUpdate.length,
        results: [
          {
            parish: parishName,
            participantsFound: participantsToUpdate.length,
            participantsUpdated: participantsNeedingUpdate.length,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error assigning participants by parish:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to assign participants from multiple parishes to a specific organization
 */
export async function assignParticipantsByMultipleParishes(
  parishes: string[],
  organizationId: string
): Promise<AssignmentResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to assign participants by parish (super_admin or cluster_manager only)
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can assign participants by parish.",
      };
    }

    console.log(
      `Assigning participants from ${parishes.length} parishes to organization ${organizationId}...`
    );

    // Get organization details for logging
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    let totalParticipantsFound = 0;
    let totalParticipantsUpdated = 0;
    const results: Array<{
      parish: string;
      participantsFound: number;
      participantsUpdated: number;
    }> = [];

    // Process each parish
    for (const parish of parishes) {
      console.log(`Processing parish: ${parish}`);

      // Find all participants from the specified parish
      const participantsToUpdate = await db.query.participants.findMany({
        where: eq(participants.parish, parish),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          parish: true,
          organization_id: true,
        },
      });

      console.log(
        `Found ${participantsToUpdate.length} participants from parish ${parish}`
      );

      totalParticipantsFound += participantsToUpdate.length;

      if (participantsToUpdate.length === 0) {
        results.push({
          parish,
          participantsFound: 0,
          participantsUpdated: 0,
        });
        continue;
      }

      // Filter participants that actually need updating
      const participantsNeedingUpdate = participantsToUpdate.filter(
        p => p.organization_id !== organizationId
      );

      console.log(
        `${participantsNeedingUpdate.length} participants from parish ${parish} need organization update`
      );

      if (participantsNeedingUpdate.length > 0) {
        // Extract IDs for batch update
        const participantIds = participantsNeedingUpdate.map(p => p.id);

        // Perform batch update using inArray
        await db
          .update(participants)
          .set({
            organization_id: organizationId,
            updated_at: new Date(),
          })
          .where(inArray(participants.id, participantIds));

        console.log(
          `Updated ${participantsNeedingUpdate.length} participants from parish ${parish} to organization ${organization.name}`
        );

        totalParticipantsUpdated += participantsNeedingUpdate.length;
      }

      results.push({
        parish,
        participantsFound: participantsToUpdate.length,
        participantsUpdated: participantsNeedingUpdate.length,
      });
    }

    return {
      success: true,
      message: `Successfully processed ${parishes.length} parishes. Updated ${totalParticipantsUpdated} participants to ${organization.name}`,
      details: {
        organizationName: organization.name,
        totalParishes: parishes.length,
        totalParticipantsFound,
        totalParticipantsUpdated,
        results,
      },
    };
  } catch (error) {
    console.error("Error assigning participants by multiple parishes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
