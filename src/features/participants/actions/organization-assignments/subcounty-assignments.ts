"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getOrganizationById } from "./utils";
import type { AssignmentResult } from "./types";

/**
 * Function to assign participants from a specific subcounty to a specific organization
 */
export async function assignParticipantsBySubCounty(
  subCountyName: string,
  organizationId: string
): Promise<AssignmentResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to assign participants by subcounty (super_admin or cluster_manager only)
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can assign participants by subcounty.",
      };
    }

    console.log(
      `Assigning participants from subcounty ${subCountyName} to organization ${organizationId}...`
    );

    // Get organization details for logging
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Find all participants from the specified subcounty
    const participantsToUpdate = await db.query.participants.findMany({
      where: eq(participants.subCounty, subCountyName),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        subCounty: true,
        organization_id: true,
      },
    });

    console.log(
      `Found ${participantsToUpdate.length} participants from ${subCountyName}`
    );

    if (participantsToUpdate.length === 0) {
      return {
        success: false,
        error: `No participants found from subcounty: ${subCountyName}`,
      };
    }

    // Filter participants that actually need updating
    const participantsNeedingUpdate = participantsToUpdate.filter(
      p => p.organization_id !== organizationId
    );

    console.log(
      `${participantsNeedingUpdate.length} participants from ${subCountyName} need organization update`
    );

    if (participantsNeedingUpdate.length === 0) {
      return {
        success: true,
        message: `All participants from ${subCountyName} are already assigned to ${organization.name}`,
        details: {
          organizationName: organization.name,
          assignmentMethod: "subcounty",
          totalSubCounties: 1,
          totalParticipantsFound: participantsToUpdate.length,
          totalParticipantsUpdated: 0,
          results: [
            {
              subCounty: subCountyName,
              participantsFound: participantsToUpdate.length,
              participantsUpdated: 0,
            },
          ],
        },
      };
    }

    // Extract IDs for batch update
    const participantIds = participantsNeedingUpdate.map(p => p.id);

    // Perform batch update
    await db
      .update(participants)
      .set({
        organization_id: organizationId,
        updated_at: new Date(),
      })
      .where(inArray(participants.id, participantIds));

    console.log(
      `Updated ${participantsNeedingUpdate.length} participants from ${subCountyName} to organization ${organization.name}`
    );

    return {
      success: true,
      message: `Successfully updated ${participantsNeedingUpdate.length} participants from ${subCountyName} to ${organization.name}`,
      details: {
        organizationName: organization.name,
        assignmentMethod: "subcounty",
        totalSubCounties: 1,
        totalParticipantsFound: participantsToUpdate.length,
        totalParticipantsUpdated: participantsNeedingUpdate.length,
        results: [
          {
            subCounty: subCountyName,
            participantsFound: participantsToUpdate.length,
            participantsUpdated: participantsNeedingUpdate.length,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error assigning participants by subcounty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to assign participants from multiple subcounties to a specific organization
 */
export async function assignParticipantsByMultipleSubCounties(
  subCounties: string[],
  organizationId: string
): Promise<AssignmentResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to assign participants by subcounty (super_admin or cluster_manager only)
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can assign participants by subcounty.",
      };
    }

    console.log(
      `Assigning participants from ${subCounties.length} subcounties to organization ${organizationId}...`
    );
    console.log(`Subcounties to process:`, subCounties);

    // First, let's check what subcounty data actually exists in the database
    const allParticipantsSubCounties = await db.query.participants.findMany({
      columns: {
        id: true,
        subCounty: true,
      },
      orderBy: [participants.subCounty],
    });

    const uniqueSubCounties = [
      ...new Set(allParticipantsSubCounties.map(p => p.subCounty)),
    ].sort();

    console.log(
      `Available subcounties in database (${uniqueSubCounties.length}):`,
      uniqueSubCounties.slice(0, 20) // Show first 20 for debugging
    );

    // Get organization details for logging
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    let totalParticipantsFound = 0;
    let totalParticipantsUpdated = 0;
    const results: Array<{
      subCounty: string;
      participantsFound: number;
      participantsUpdated: number;
    }> = [];

    // Process each subcounty
    for (const subCounty of subCounties) {
      console.log(`Processing subcounty: "${subCounty}"`);

      // Find all participants from the specified subcounty
      const participantsToUpdate = await db.query.participants.findMany({
        where: eq(participants.subCounty, subCounty),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          subCounty: true,
          organization_id: true,
        },
      });

      console.log(
        `Found ${participantsToUpdate.length} participants from subcounty "${subCounty}"`
      );

      // Log some participant details for debugging
      if (participantsToUpdate.length > 0) {
        console.log(
          `Sample participants:`,
          participantsToUpdate.slice(0, 3).map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            subCounty: p.subCounty,
            currentOrgId: p.organization_id,
          }))
        );
      }

      totalParticipantsFound += participantsToUpdate.length;

      if (participantsToUpdate.length === 0) {
        results.push({
          subCounty,
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
        `${participantsNeedingUpdate.length} participants from ${subCounty} need organization update`
      );

      if (participantsNeedingUpdate.length > 0) {
        // Extract IDs for batch update
        const participantIds = participantsNeedingUpdate.map(p => p.id);

        console.log(
          `Updating ${participantIds.length} participants:`,
          participantIds
        );

        // Perform batch update using inArray for better compatibility
        const updateResult = await db
          .update(participants)
          .set({
            organization_id: organizationId,
            updated_at: new Date(),
          })
          .where(inArray(participants.id, participantIds))
          .returning({
            id: participants.id,
            organization_id: participants.organization_id,
          });

        console.log(`Database update completed. Result:`, updateResult);

        console.log(
          `Updated ${participantsNeedingUpdate.length} participants from ${subCounty} to organization ${organization.name}`
        );

        totalParticipantsUpdated += participantsNeedingUpdate.length;
      }

      results.push({
        subCounty,
        participantsFound: participantsToUpdate.length,
        participantsUpdated: participantsNeedingUpdate.length,
      });
    }

    return {
      success: true,
      message: `Successfully processed ${subCounties.length} subcounties. Updated ${totalParticipantsUpdated} participants to ${organization.name}`,
      details: {
        organizationName: organization.name,
        assignmentMethod: "subcounty",
        totalSubCounties: subCounties.length,
        totalParticipantsFound,
        totalParticipantsUpdated,
        results,
      },
    };
  } catch (error) {
    console.error(
      "Error assigning participants by multiple subcounties:",
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
