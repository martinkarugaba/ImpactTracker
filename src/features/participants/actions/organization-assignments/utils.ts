"use server";

import { db } from "@/lib/db";

/**
 * Mapping function to determine organization based on subcounty
 */
export async function mapSubCountyToOrgKeyword(
  subCountyName: string
): Promise<string | null> {
  const s = subCountyName.trim().toLowerCase();

  // Blessed Pillars Foundation subcounties
  const blessedPillars = ["ruteete", "kiko", "harugongo"];

  // Kazi Women Foundation subcounties
  const kaziWomen = ["bugaaki", "hakibaale", "busoro", "hakibale"]; // Added both spellings

  // Balinda Children's Foundation subcounties
  const balindaChildren = ["kyarusozi", "kyembogo", "kyarusozi town council"];

  // Note: Kyarusozi town council should be assigned to Balinda Children's Foundation Uganda
  // If participants from Kyarusozi are assigned to Blessed Pillars, this will correct them

  if (blessedPillars.includes(s)) return "blessed pillars";
  if (kaziWomen.includes(s)) return "kazi women";
  if (balindaChildren.includes(s)) return "balinda";
  return null; // Return null for unmapped subcounties
}

/**
 * Function to find organization ID by name keyword
 */
export async function findOrganizationIdByKeyword(
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

/**
 * Get organization details by ID
 */
export async function getOrganizationById(organizationId: string) {
  return await db.query.organizations.findFirst({
    where: (orgs, { eq }) => eq(orgs.id, organizationId),
    columns: {
      id: true,
      name: true,
    },
  });
}
