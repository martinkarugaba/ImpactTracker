"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { participants, organizations } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";

// Mapping function to determine organization based on subcounty
function mapSubCountyToOrgKeyword(subCountyName: string): string | null {
  const s = subCountyName.trim().toLowerCase();

  // Blessed Pillars Foundation subcounties
  const blessedPillars = ["ruteete", "kiko", "harugongo"];

  // Kazi Women Foundation subcounties
  const kaziWomen = ["bugaaki", "hakibaale", "busoro", "hakibale"]; // Added both spellings

  // Balinda Children's Foundation subcounties
  const balindaChildren = ["kyarusozi", "kyembogo"];

  // Note: Kyarusozi town council should be assigned to Balinda Children's Foundation Uganda
  // If participants from Kyarusozi are assigned to Blessed Pillars, this will correct them

  if (blessedPillars.includes(s)) return "blessed pillars";
  if (kaziWomen.includes(s)) return "kazi women";
  if (balindaChildren.includes(s)) return "balinda";
  return null; // Return null for unmapped subcounties
}

// Function to find organization ID by name keyword
async function findOrganizationIdByKeyword(
  keyword: string
): Promise<string | null> {
  const orgs = await db.query.organizations.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  const lowerKeyword = keyword.toLowerCase();
  const found = orgs.find(org => org.name.toLowerCase().includes(lowerKeyword));

  return found ? found.id : null;
}

export async function fixOrganizationAssignments(clusterId?: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to fix organizations (super_admin or cluster_manager only)
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

    // Get all participants (optionally filter by cluster)
    const allParticipants = clusterId
      ? await db.query.participants.findMany({
          where: eq(participants.cluster_id, clusterId),
          columns: {
            id: true,
            subCounty: true,
            organization_id: true,
          },
        })
      : await db.query.participants.findMany({
          columns: {
            id: true,
            subCounty: true,
            organization_id: true,
          },
        });

    console.log(`Found ${allParticipants.length} participants to check`);

    // Get organization mappings
    const organizationMappings = new Map<string, string>();
    const uniqueOrgKeywords = ["blessed pillars", "kazi women", "balinda"];

    for (const keyword of uniqueOrgKeywords) {
      const orgId = await findOrganizationIdByKeyword(keyword);
      if (orgId) {
        organizationMappings.set(keyword, orgId);
        console.log(`Mapped "${keyword}" to organization ID: ${orgId}`);
      }
    }

    let updatedCount = 0;
    let skippedCount = 0;
    const updatePromises: Promise<unknown>[] = [];

    for (const participant of allParticipants) {
      if (!participant.subCounty) {
        skippedCount++;
        continue;
      }

      // Determine the correct organization for this participant's subcounty
      const orgKeyword = mapSubCountyToOrgKeyword(participant.subCounty);
      if (!orgKeyword) {
        console.log(`No mapping found for subcounty: ${participant.subCounty}`);
        skippedCount++;
        continue;
      }

      const correctOrgId = organizationMappings.get(orgKeyword);
      if (!correctOrgId) {
        console.log(`No organization found for keyword: ${orgKeyword}`);
        skippedCount++;
        continue;
      }

      // Check if update is needed
      if (participant.organization_id !== correctOrgId) {
        console.log(
          `Updating participant ${participant.id}: ${participant.subCounty} -> ${orgKeyword} (${correctOrgId})`
        );

        const updatePromise = db
          .update(participants)
          .set({ organization_id: correctOrgId })
          .where(eq(participants.id, participant.id));

        updatePromises.push(updatePromise);
        updatedCount++;
      } else {
        console.log(
          `Participant ${participant.id} already has correct organization`
        );
      }
    }

    // Execute all updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Successfully updated ${updatedCount} participants`);
    }

    return {
      success: true,
      message: `Updated ${updatedCount} participants, skipped ${skippedCount}`,
      details: {
        total: allParticipants.length,
        updated: updatedCount,
        skipped: skippedCount,
        organizationMappings: Object.fromEntries(organizationMappings),
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

// Function to preview what changes would be made without actually updating
export async function previewOrganizationAssignmentFix(clusterId?: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to preview organization fixes (super_admin or cluster_manager only)
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "cluster_manager"
    ) {
      return {
        success: false,
        error:
          "Access denied. Only super administrators and cluster managers can preview organization assignments.",
      };
    }

    // Get all participants (optionally filter by cluster)
    const allParticipants = clusterId
      ? await db.query.participants.findMany({
          where: eq(participants.cluster_id, clusterId),
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            subCounty: true,
            organization_id: true,
          },
        })
      : await db.query.participants.findMany({
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            subCounty: true,
            organization_id: true,
          },
        });

    // Get organization mappings
    const organizationMappings = new Map<string, string>();
    const organizationNames = new Map<string, string>();
    const uniqueOrgKeywords = ["blessed pillars", "kazi women", "balinda"];

    for (const keyword of uniqueOrgKeywords) {
      const orgs = await db.query.organizations.findMany({
        columns: {
          id: true,
          name: true,
        },
      });

      const found = orgs.find(org =>
        org.name.toLowerCase().includes(keyword.toLowerCase())
      );

      if (found) {
        organizationMappings.set(keyword, found.id);
        organizationNames.set(found.id, found.name);
      }
    }

    // Get current organization names for comparison
    const currentOrgIds = [
      ...new Set(allParticipants.map(p => p.organization_id)),
    ];
    for (const orgId of currentOrgIds) {
      if (!organizationNames.has(orgId)) {
        const orgs = await db.query.organizations.findMany({
          columns: {
            id: true,
            name: true,
          },
        });
        const org = orgs.find(o => o.id === orgId);
        if (org) {
          organizationNames.set(org.id, org.name);
        }
      }
    }

    const changes: Array<{
      participantId: string;
      participantName: string;
      subCounty: string;
      currentOrg: string;
      newOrg: string;
      needsUpdate: boolean;
    }> = [];

    for (const participant of allParticipants) {
      const orgKeyword = mapSubCountyToOrgKeyword(participant.subCounty || "");
      const correctOrgId = orgKeyword
        ? organizationMappings.get(orgKeyword)
        : null;

      changes.push({
        participantId: participant.id,
        participantName: `${participant.firstName} ${participant.lastName}`,
        subCounty: participant.subCounty || "Unknown",
        currentOrg:
          organizationNames.get(participant.organization_id) || "Unknown",
        newOrg: correctOrgId
          ? organizationNames.get(correctOrgId) || "Unknown"
          : "No mapping",
        needsUpdate: correctOrgId
          ? participant.organization_id !== correctOrgId
          : false,
      });
    }

    const needsUpdate = changes.filter(c => c.needsUpdate);

    return {
      success: true,
      data: {
        totalParticipants: allParticipants.length,
        needsUpdateCount: needsUpdate.length,
        changes: changes,
        organizationMappings: Object.fromEntries(
          Array.from(organizationMappings.entries()).map(([keyword, id]) => [
            keyword,
            organizationNames.get(id) || id,
          ])
        ),
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

// Specific function to check and fix Kyarusozi town council assignments
export async function fixKyarusoziAssignments() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has permission to fix Kyarusozi assignments (super_admin or cluster_manager only)
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

    console.log("Checking Kyarusozi town council assignments...");

    // Find all participants from Kyarusozi
    const kyarusoziParticipants = await db.query.participants.findMany({
      where: eq(participants.subCounty, "Kyarusozi"),
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

    // Get organization IDs
    const organizations = await db.query.organizations.findMany({
      columns: {
        id: true,
        name: true,
      },
    });

    const blessedPillarsOrg = organizations.find(org =>
      org.name.toLowerCase().includes("blessed pillars")
    );
    const balindaOrg = organizations.find(org =>
      org.name.toLowerCase().includes("balinda")
    );

    if (!balindaOrg) {
      return {
        success: false,
        error: "Balinda Children's Foundation not found",
      };
    }

    // Find participants incorrectly assigned to Blessed Pillars
    const incorrectAssignments = kyarusoziParticipants.filter(
      p => p.organization_id === blessedPillarsOrg?.id
    );

    console.log(
      `Found ${incorrectAssignments.length} participants incorrectly assigned to Blessed Pillars`
    );

    if (incorrectAssignments.length === 0) {
      return {
        success: true,
        message: "No incorrect assignments found for Kyarusozi participants",
        details: {
          totalKyarusoziParticipants: kyarusoziParticipants.length,
          incorrectAssignments: 0,
          correctOrganization: balindaOrg.name,
        },
      };
    }

    // Update the incorrect assignments
    const updatePromises = incorrectAssignments.map(participant =>
      db
        .update(participants)
        .set({ organization_id: balindaOrg.id })
        .where(eq(participants.id, participant.id))
    );

    await Promise.all(updatePromises);

    console.log(
      `Successfully corrected ${incorrectAssignments.length} assignments`
    );

    return {
      success: true,
      message: `Corrected ${incorrectAssignments.length} Kyarusozi participants from Blessed Pillars to Balinda Children's Foundation`,
      details: {
        totalKyarusoziParticipants: kyarusoziParticipants.length,
        correctedAssignments: incorrectAssignments.length,
        incorrectlyAssignedParticipants: incorrectAssignments.map(p => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
        })),
        fromOrganization: blessedPillarsOrg?.name || "Unknown",
        toOrganization: balindaOrg.name,
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

// Generic function to assign participants from a subcounty to a specific organization
export async function assignParticipantsBySubCounty(
  subCounty: string,
  organizationId: string
) {
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
      `Assigning participants from ${subCounty} to organization ${organizationId}...`
    );

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
      `Found ${participantsToUpdate.length} participants from ${subCounty}`
    );

    if (participantsToUpdate.length === 0) {
      return {
        success: true,
        message: `No participants found from ${subCounty}`,
        details: {
          subCounty,
          participantsFound: 0,
          participantsUpdated: 0,
        },
      };
    }

    // Get organization details for logging
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Filter participants that actually need updating
    const participantsNeedingUpdate = participantsToUpdate.filter(
      p => p.organization_id !== organizationId
    );

    console.log(
      `${participantsNeedingUpdate.length} participants need organization update`
    );

    if (participantsNeedingUpdate.length === 0) {
      return {
        success: true,
        message: `All participants from ${subCounty} are already assigned to ${organization.name}`,
        details: {
          subCounty,
          organizationName: organization.name,
          participantsFound: participantsToUpdate.length,
          participantsUpdated: 0,
        },
      };
    }

    // Update the participants
    const updatePromises = participantsNeedingUpdate.map(participant =>
      db
        .update(participants)
        .set({ organization_id: organizationId })
        .where(eq(participants.id, participant.id))
    );

    await Promise.all(updatePromises);

    console.log(
      `Successfully updated ${participantsNeedingUpdate.length} participants`
    );

    return {
      success: true,
      message: `Successfully assigned ${participantsNeedingUpdate.length} participants from ${subCounty} to ${organization.name}`,
      details: {
        subCounty,
        organizationName: organization.name,
        participantsFound: participantsToUpdate.length,
        participantsUpdated: participantsNeedingUpdate.length,
        updatedParticipants: participantsNeedingUpdate.map(p => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
        })),
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

// Function to assign participants from multiple subcounties to a specific organization
export async function assignParticipantsByMultipleSubCounties(
  subCounties: string[],
  organizationId: string
) {
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

    // Get organization details for logging
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        id: true,
        name: true,
      },
    });

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
      console.log(`Processing subcounty: ${subCounty}`);

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
        `Found ${participantsToUpdate.length} participants from ${subCounty}`
      );

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

        // Perform batch update
        await db
          .update(participants)
          .set({
            organization_id: organizationId,
            updated_at: new Date(),
          })
          .where(sql`${participants.id} = ANY(${participantIds})`);

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

// Function to assign participants from a specific parish to a specific organization
export async function assignParticipantsByParish(
  parishName: string,
  organizationId: string
) {
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
        success: true,
        message: `No participants found in parish ${parishName}`,
        details: {
          parish: parishName,
          participantsFound: 0,
          participantsUpdated: 0,
        },
      };
    }

    // Get organization details for logging
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Filter participants that actually need updating
    const participantsNeedingUpdate = participantsToUpdate.filter(
      p => p.organization_id !== organizationId
    );

    console.log(
      `${participantsNeedingUpdate.length} participants need organization update`
    );

    if (participantsNeedingUpdate.length === 0) {
      return {
        success: true,
        message: `All participants from parish ${parishName} are already assigned to ${organization.name}`,
        details: {
          parish: parishName,
          organizationName: organization.name,
          participantsFound: participantsToUpdate.length,
          participantsUpdated: 0,
        },
      };
    }

    // Update the participants
    const updatePromises = participantsNeedingUpdate.map(participant =>
      db
        .update(participants)
        .set({ organization_id: organizationId })
        .where(eq(participants.id, participant.id))
    );

    await Promise.all(updatePromises);

    console.log(
      `Successfully updated ${participantsNeedingUpdate.length} participants`
    );

    return {
      success: true,
      message: `Successfully assigned ${participantsNeedingUpdate.length} participants from parish ${parishName} to ${organization.name}`,
      details: {
        parish: parishName,
        organizationName: organization.name,
        participantsFound: participantsToUpdate.length,
        participantsUpdated: participantsNeedingUpdate.length,
        updatedParticipants: participantsNeedingUpdate.map(p => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
        })),
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

// Function to assign participants from multiple parishes to a specific organization
export async function assignParticipantsByMultipleParishes(
  parishes: string[],
  organizationId: string
) {
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
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        id: true,
        name: true,
      },
    });

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
