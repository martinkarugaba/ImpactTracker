"use server";

import { db } from "@/lib/db";
import { participants, organizations } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface DuplicateGroup {
  key: string;
  type: "name" | "contact";
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    contact: string | null;
    dateOfBirth: Date | null;
    district: string | null;
    subCounty: string | null;
    organizationName: string | null;
    organization_id: string | null;
    created_at: Date | null;
  }>;
}

export interface AllDuplicatesResult {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  totalGroups: number;
}

/**
 * Find all duplicate participants in the database
 * Checks for duplicates based on:
 * 1. Name similarity (first name + last name) within the same district
 * 2. Contact number similarity with name correlation within the same district
 *
 * Geographic Rules:
 * - Participants in different districts are NOT considered duplicates
 * - Same district, same subcounty: normal duplicate detection
 * - Same district, different subcounty: light penalty applied
 * - Missing district data: high penalty with very strict thresholds
 */
export async function findAllDuplicates(): Promise<AllDuplicatesResult> {
  try {
    console.log(
      "Starting comprehensive duplicate detection across all participants"
    );

    // Get all participants with organization names
    const allParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        contact: participants.contact,
        dateOfBirth: participants.dateOfBirth,
        district: participants.district,
        subCounty: participants.subCounty,
        organizationName: organizations.name,
        organization_id: participants.organization_id,
        created_at: participants.created_at,
      })
      .from(participants)
      .leftJoin(
        organizations,
        eq(participants.organization_id, organizations.id)
      );

    console.log(
      `Found ${allParticipants.length} total participants to analyze`
    );

    const duplicateGroups: DuplicateGroup[] = [];
    const processedParticipants = new Set<string>();

    // Helper function to normalize names
    const normalizeName = (firstName: string, lastName: string): string => {
      const fullName = `${firstName || ""} ${lastName || ""}`
        .toLowerCase()
        .trim();
      return fullName.replace(/\s+/g, " ");
    };

    // Helper function to normalize phone numbers
    const normalizePhone = (phone: string | null): string => {
      if (!phone) return "";
      // Remove all non-digits and normalize Uganda phone numbers
      const digits = phone.replace(/\D/g, "");
      // Handle different formats: +256, 256, 0
      if (digits.startsWith("256")) {
        return digits.substring(3);
      } else if (digits.startsWith("0")) {
        return digits.substring(1);
      }
      return digits;
    };

    // Helper function to calculate similarity score for potential duplicates
    const calculateSimilarity = (str1: string, str2: string): number => {
      if (!str1 || !str2) return 0;
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      if (s1 === s2) return 100;

      // Simple Levenshtein distance for basic similarity
      const len1 = s1.length;
      const len2 = s2.length;
      const matrix = Array(len1 + 1)
        .fill(null)
        .map(() => Array(len2 + 1).fill(0));

      for (let i = 0; i <= len1; i++) matrix[i][0] = i;
      for (let j = 0; j <= len2; j++) matrix[0][j] = j;

      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }

      const distance = matrix[len1][len2];
      const maxLength = Math.max(len1, len2);
      return Math.round(((maxLength - distance) / maxLength) * 100);
    };

    // Helper function to assess geographic compatibility
    const assessGeographicCompatibility = (
      p1: (typeof allParticipants)[0],
      p2: (typeof allParticipants)[0],
      isDuplicateType: "name" | "contact"
    ): {
      compatible: boolean;
      penalty: number;
      reason: string;
    } => {
      const district1 = p1.district?.toLowerCase().trim() || "";
      const district2 = p2.district?.toLowerCase().trim() || "";
      const subcounty1 = p1.subCounty?.toLowerCase().trim() || "";
      const subcounty2 = p2.subCounty?.toLowerCase().trim() || "";

      // Different districts - NOT compatible (too unlikely to be same person)
      if (district1 && district2 && district1 !== district2) {
        return {
          compatible: false,
          penalty: 100,
          reason: "Different districts - considered separate individuals",
        };
      }

      // For name-based duplicates: if participants have same name but are in different subcounties,
      // they should NOT be considered duplicates
      if (
        isDuplicateType === "name" &&
        district1 === district2 &&
        subcounty1 &&
        subcounty2 &&
        subcounty1 !== subcounty2
      ) {
        return {
          compatible: false,
          penalty: 100,
          reason:
            "Same name but different subcounties - considered separate individuals",
        };
      }

      // Missing district data for one or both - proceed with extreme caution
      if (!district1 || !district2) {
        return {
          compatible: true,
          penalty: 30,
          reason: "Missing district data - requires very high similarity",
        };
      }

      // Same district, same subcounty - normal detection
      if (district1 === district2 && subcounty1 === subcounty2) {
        return { compatible: true, penalty: 0, reason: "Same location" };
      }

      // Same district, different subcounty - for contact-based duplicates only
      if (district1 === district2 && isDuplicateType === "contact") {
        return {
          compatible: true,
          penalty: 5,
          reason: "Same district, different subcounty (contact match)",
        };
      }

      // Same district, missing subcounty data - moderate penalty
      return {
        compatible: true,
        penalty: 15,
        reason: "Same district, missing subcounty data",
      };
    };

    // Group by normalized names (without strict subcounty separation)
    const nameGroups: Record<string, typeof allParticipants> = {};
    for (const participant of allParticipants) {
      if (participant.firstName || participant.lastName) {
        const normalizedName = normalizeName(
          participant.firstName,
          participant.lastName
        );

        if (normalizedName && normalizedName !== " ") {
          if (!nameGroups[normalizedName]) {
            nameGroups[normalizedName] = [];
          }
          nameGroups[normalizedName].push(participant);
        }
      }
    }

    // Find name-based duplicates with geographic assessment
    for (const [normalizedName, group] of Object.entries(nameGroups)) {
      if (group.length > 1) {
        // For each group, find pairs that might be duplicates considering geography
        const validDuplicates: typeof group = [];

        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const p1 = group[i];
            const p2 = group[j];

            const geoAssessment = assessGeographicCompatibility(p1, p2, "name");

            if (geoAssessment.compatible) {
              // Calculate overall name similarity
              const nameSim1 = calculateSimilarity(p1.firstName, p2.firstName);
              const nameSim2 = calculateSimilarity(p1.lastName, p2.lastName);
              const avgNameSim = (nameSim1 + nameSim2) / 2;

              // Apply geographic penalty and check threshold
              const adjustedSimilarity = Math.max(
                0,
                avgNameSim - geoAssessment.penalty
              );
              const requiredThreshold = geoAssessment.penalty > 15 ? 90 : 75; // Higher threshold for missing data

              if (adjustedSimilarity >= requiredThreshold) {
                if (!validDuplicates.find(p => p.id === p1.id))
                  validDuplicates.push(p1);
                if (!validDuplicates.find(p => p.id === p2.id))
                  validDuplicates.push(p2);
              }
            }
          }
        }

        if (validDuplicates.length > 1) {
          duplicateGroups.push({
            key: `name:${normalizedName}`,
            type: "name",
            participants: validDuplicates.map(p => ({
              id: p.id,
              firstName: p.firstName,
              lastName: p.lastName,
              contact: p.contact,
              dateOfBirth: p.dateOfBirth,
              district: p.district,
              subCounty: p.subCounty,
              organizationName: p.organizationName,
              organization_id: p.organization_id,
              created_at: p.created_at,
            })),
          });

          // Mark these participants as processed
          validDuplicates.forEach(p => processedParticipants.add(p.id));
        }
      }
    }

    // Group by normalized phone numbers (without strict subcounty separation)
    const phoneGroups: Record<string, typeof allParticipants> = {};
    for (const participant of allParticipants) {
      if (!processedParticipants.has(participant.id) && participant.contact) {
        const normalizedPhone = normalizePhone(participant.contact);

        if (normalizedPhone && normalizedPhone.length >= 9) {
          if (!phoneGroups[normalizedPhone]) {
            phoneGroups[normalizedPhone] = [];
          }
          phoneGroups[normalizedPhone].push(participant);
        }
      }
    }

    // Find contact-based duplicates with geographic assessment and name similarity requirement
    for (const [normalizedPhone, group] of Object.entries(phoneGroups)) {
      if (group.length > 1) {
        // For each group, find pairs that might be duplicates considering geography and names
        const validDuplicates: typeof group = [];

        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const p1 = group[i];
            const p2 = group[j];

            const geoAssessment = assessGeographicCompatibility(
              p1,
              p2,
              "contact"
            );

            if (geoAssessment.compatible) {
              // Calculate name similarity between the two participants
              const firstNameSim = calculateSimilarity(
                p1.firstName,
                p2.firstName
              );
              const lastNameSim = calculateSimilarity(p1.lastName, p2.lastName);
              const avgNameSim = (firstNameSim + lastNameSim) / 2;

              // Require meaningful name similarity for contact-based duplicates
              const requiredNameSimilarity =
                geoAssessment.penalty > 15 ? 80 : 60; // Higher name similarity required for missing data

              if (avgNameSim >= requiredNameSimilarity) {
                // Phone numbers match exactly, so base score is 100
                const adjustedSimilarity = Math.max(
                  0,
                  100 - geoAssessment.penalty
                );

                const requiredThreshold = geoAssessment.penalty > 15 ? 95 : 80;

                if (adjustedSimilarity >= requiredThreshold) {
                  if (!validDuplicates.find(p => p.id === p1.id))
                    validDuplicates.push(p1);
                  if (!validDuplicates.find(p => p.id === p2.id))
                    validDuplicates.push(p2);
                }
              }
              // If names are too different, we don't consider them duplicates even with same phone
            }
          }
        }

        if (validDuplicates.length > 1) {
          duplicateGroups.push({
            key: `contact:${normalizedPhone}`,
            type: "contact",
            participants: validDuplicates.map(p => ({
              id: p.id,
              firstName: p.firstName,
              lastName: p.lastName,
              contact: p.contact,
              dateOfBirth: p.dateOfBirth,
              district: p.district,
              subCounty: p.subCounty,
              organizationName: p.organizationName,
              organization_id: p.organization_id,
              created_at: p.created_at,
            })),
          });
        }
      }
    }

    const totalDuplicates = duplicateGroups.reduce(
      (sum, group) => sum + group.participants.length,
      0
    );

    console.log(
      `Found ${duplicateGroups.length} duplicate groups with ${totalDuplicates} total duplicate participants`
    );

    return {
      duplicateGroups,
      totalDuplicates,
      totalGroups: duplicateGroups.length,
    };
  } catch (error) {
    console.error("Error finding all duplicates:", error);
    return {
      duplicateGroups: [],
      totalDuplicates: 0,
      totalGroups: 0,
    };
  }
}

/**
 * Delete multiple participants by their IDs
 */
export async function deleteParticipants(
  participantIds: string[]
): Promise<void> {
  try {
    console.log(
      `Deleting ${participantIds.length} participants:`,
      participantIds
    );

    // Use inArray for better compatibility with different databases
    await db
      .delete(participants)
      .where(inArray(participants.id, participantIds));

    console.log(`Successfully deleted ${participantIds.length} participants`);
  } catch (error) {
    console.error("Error deleting participants:", error);
    throw new Error("Failed to delete participants");
  }
}
