"use server";

import { db } from "@/lib/db";
import { vslaMembers, participants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { VSLA } from "../types";

interface VSLAMemberImportData {
  participant_name: string;
  participant_phone: string;
  participant_email?: string;
  vsla_name: string;
  role: string;
  joined_date: string;
  total_savings: number;
  total_loans: number;
  notes?: string;
  // Additional participant fields from Excel
  parish?: string;
  village?: string;
  age?: number;
  sex?: string;
  pwd?: string;
  mother?: string;
  refugee?: string;
  enterprise?: string;
  title?: string;
}

/**
 * Import VSLA members from Excel data
 * - Links to existing participants by name + phone
 * - Creates new participants if not found
 * - Creates VSLA member records with participant_id link
 */
export async function importVSLAMembers(
  data: VSLAMemberImportData[],
  vslas: VSLA[]
) {
  console.log("=== Starting VSLA Members Import ===");
  console.log("Data to import:", data.length, "members");
  console.log("Available VSLAs:", vslas.length);

  if (data.length > 0) {
    console.log("Sample data (first row):", JSON.stringify(data[0], null, 2));
  }

  try {
    let imported = 0;
    let participantsCreated = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        console.log(`\n--- Processing member: ${row.participant_name} ---`);

        // 1. Find VSLA by name (case-insensitive)
        const vsla = vslas.find(
          v => v.name.toLowerCase() === row.vsla_name.toLowerCase()
        );

        if (!vsla) {
          errors.push(
            `VSLA "${row.vsla_name}" not found for member "${row.participant_name}"`
          );
          console.log(`❌ VSLA not found: ${row.vsla_name}`);
          continue;
        }

        console.log(`✓ Found VSLA: ${vsla.name}`);

        // 2. Parse participant name into first and last name
        const nameParts = row.participant_name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];

        console.log(
          `Searching for participant: ${firstName} ${lastName} (${row.participant_phone})`
        );

        // 3. Find existing participant by name AND phone (case-insensitive)
        let participant = await db.query.participants.findFirst({
          where: and(
            sql`LOWER(${participants.firstName}) = LOWER(${firstName})`,
            sql`LOWER(${participants.lastName}) = LOWER(${lastName})`,
            eq(participants.contact, row.participant_phone)
          ),
        });

        // 4. If participant not found, create a new one
        if (!participant) {
          console.log(`Participant not found, creating new participant...`);

          // Map sex from Excel data
          let sexValue: "male" | "female" | "prefer_not_to_say" =
            "prefer_not_to_say";
          if (row.sex) {
            const sexLower = row.sex.toLowerCase();
            if (sexLower === "male" || sexLower === "m") sexValue = "male";
            else if (sexLower === "female" || sexLower === "f")
              sexValue = "female";
          }

          // Map yes/no fields from Excel
          const isPWD = row.pwd?.toLowerCase().includes("yes") ? "yes" : "no";
          const isMother = row.mother?.toLowerCase().includes("yes")
            ? "yes"
            : "no";
          const isRefugee = row.refugee?.toLowerCase().includes("yes")
            ? "yes"
            : "no";

          const [newParticipant] = await db
            .insert(participants)
            .values({
              firstName,
              lastName,
              contact: row.participant_phone,
              // Use VSLA's organization, cluster, and project IDs
              organization_id: vsla.organization_id,
              cluster_id: vsla.cluster_id,
              project_id: vsla.project_id,
              // Use location from Excel if available, otherwise from VSLA
              country: vsla.country || "Uganda",
              district: vsla.district || "Not Specified",
              subCounty: vsla.sub_county || "Not Specified",
              parish: row.parish || vsla.parish || "Not Specified",
              village: row.village || vsla.village || "Not Specified",
              // Use Excel data fields
              sex: sexValue,
              age: row.age || undefined,
              designation: row.title || "VSLA Member",
              enterprise: row.enterprise || "VSLA Participation",
              isPWD,
              isMother,
              isRefugee,
              isPermanentResident: "yes",
              areParentsAlive: "unknown",
              numberOfChildren: 0,
              employmentStatus: "unemployed",
              monthlyIncome: 0,
              accessedLoans: "no",
              individualSaving: "no",
              groupSaving: "yes",
              nationality: "Ugandan",
              isActiveStudent: "no",
              isSubscribedToVSLA: "yes",
              vslaName: vsla.name,
              isTeenMother: "no",
              ownsEnterprise: "no",
              hasVocationalSkills: "no",
              vocationalSkillsParticipations: [],
              vocationalSkillsCompletions: [],
              vocationalSkillsCertifications: [],
              hasSoftSkills: "no",
              softSkillsParticipations: [],
              softSkillsCompletions: [],
              softSkillsCertifications: [],
              hasBusinessSkills: "no",
              isWillingToParticipate: "yes",
            })
            .returning();

          participant = newParticipant;
          participantsCreated++;
          console.log(
            `✓ Created new participant: ${participant.firstName} ${participant.lastName} (ID: ${participant.id})`
          );
        } else {
          console.log(
            `✓ Found existing participant: ${participant.firstName} ${participant.lastName} (ID: ${participant.id})`
          );
        }

        // 5. Check if member already exists in this VSLA
        const existingMember = await db.query.vslaMembers.findFirst({
          where: and(
            eq(vslaMembers.participant_id, participant.id),
            eq(vslaMembers.vsla_id, vsla.id)
          ),
        });

        if (existingMember) {
          console.log(`⚠️ Member already exists in this VSLA, skipping...`);
          errors.push(
            `Member "${row.participant_name}" is already part of VSLA "${vsla.name}"`
          );
          continue;
        }

        // 6. Parse joined date
        let joinedDate: Date;
        try {
          joinedDate = new Date(row.joined_date);
          if (isNaN(joinedDate.getTime())) {
            // Use current date as fallback
            joinedDate = new Date();
            console.log(`⚠️ Invalid joined date, using current date`);
          }
        } catch {
          joinedDate = new Date();
          console.log(`⚠️ Error parsing joined date, using current date`);
        }

        // 7. Create VSLA member record with participant link
        await db.insert(vslaMembers).values({
          participant_id: participant.id, // KEY: Link to participant
          vsla_id: vsla.id,
          // Keep legacy fields for backwards compatibility
          first_name: participant.firstName,
          last_name: participant.lastName,
          phone: participant.contact,
          email: row.participant_email || null,
          role: row.role.toLowerCase(),
          joined_date: joinedDate,
          total_savings: row.total_savings || 0,
          total_loans: row.total_loans || 0,
          status: "active",
        });

        imported++;
        console.log(
          `✓ Successfully added ${participant.firstName} ${participant.lastName} to ${vsla.name} as ${row.role}`
        );
      } catch (error) {
        console.error(
          `Error importing member "${row.participant_name}":`,
          error
        );
        errors.push(
          `Failed to import member "${row.participant_name}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    console.log("\n=== VSLA Members Import Complete ===");
    console.log(`Successfully imported: ${imported} members`);
    console.log(`New participants created: ${participantsCreated}`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Error details:", errors);
    }

    return {
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
      message:
        participantsCreated > 0
          ? `Imported ${imported} members (${participantsCreated} new participants created)`
          : undefined,
    };
  } catch (error) {
    console.error("Error importing VSLA members:", error);
    return {
      success: false,
      error: "Failed to import VSLA members",
      imported: 0,
    };
  }
}
