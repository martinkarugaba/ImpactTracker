"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Mapping function to determine organization based on subcounty
function mapSubCountyToOrgKeyword(subCountyName: string): string | null {
  const s = subCountyName.trim().toLowerCase();

  // Blessed Pillars Foundation subcounties
  const blessedPillars = ["ruteete", "kiko", "harugongo"];

  // Kazi Women Foundation subcounties
  const kaziWomen = ["bugaaki", "hakibaale", "busoro", "hakibale"]; // Added both spellings

  // Balinda Children's Foundation subcounties
  const balindaChildren = ["kyarusozi", "kyembogo"];

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
