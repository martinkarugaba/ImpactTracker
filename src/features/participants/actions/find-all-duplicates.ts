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
    district: string;
    subCounty: string;
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
 * 1. Name similarity (first name + last name)
 * 2. Contact number similarity
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

    // Group by normalized names
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

    // Find name-based duplicates
    for (const [normalizedName, group] of Object.entries(nameGroups)) {
      if (group.length > 1) {
        duplicateGroups.push({
          key: `name:${normalizedName}`,
          type: "name",
          participants: group.map(p => ({
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
            contact: p.contact,
            district: p.district,
            subCounty: p.subCounty,
            organizationName: p.organizationName,
            organization_id: p.organization_id,
            created_at: p.created_at,
          })),
        });

        // Mark these participants as processed to avoid double-counting in contact duplicates
        group.forEach(p => processedParticipants.add(p.id));
      }
    }

    // Group by normalized phone numbers (only for participants not already flagged for name duplicates)
    const phoneGroups: Record<string, typeof allParticipants> = {};
    for (const participant of allParticipants) {
      if (!processedParticipants.has(participant.id) && participant.contact) {
        const normalizedPhone = normalizePhone(participant.contact);
        if (normalizedPhone && normalizedPhone.length >= 9) {
          // Valid phone number length
          if (!phoneGroups[normalizedPhone]) {
            phoneGroups[normalizedPhone] = [];
          }
          phoneGroups[normalizedPhone].push(participant);
        }
      }
    }

    // Find contact-based duplicates
    for (const [normalizedPhone, group] of Object.entries(phoneGroups)) {
      if (group.length > 1) {
        duplicateGroups.push({
          key: `contact:${normalizedPhone}`,
          type: "contact",
          participants: group.map(p => ({
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
            contact: p.contact,
            district: p.district,
            subCounty: p.subCounty,
            organizationName: p.organizationName,
            organization_id: p.organization_id,
            created_at: p.created_at,
          })),
        });
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
