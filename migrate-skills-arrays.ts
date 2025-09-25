"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * Migration script to ensure all skills fields are properly stored as arrays
 * This will convert any string values to arrays and clean up comma-separated values
 */
export async function migrateSkillsToArrays() {
  try {
    console.log("🔄 Starting skills array migration...");

    // First, let's check the current state of skills data
    const sampleData = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        vocationalSkillsCompletions: participants.vocationalSkillsCompletions,
        vocationalSkillsCertifications:
          participants.vocationalSkillsCertifications,
        softSkillsParticipations: participants.softSkillsParticipations,
        softSkillsCompletions: participants.softSkillsCompletions,
        softSkillsCertifications: participants.softSkillsCertifications,
      })
      .from(participants)
      .limit(5);

    console.log("📊 Sample data before migration:");
    sampleData.forEach((participant, index) => {
      console.log(
        `\n👤 Participant ${index + 1}: ${participant.firstName} ${participant.lastName}`
      );
      console.log("  Vocational Skills:");
      console.log(
        "    Participations:",
        participant.vocationalSkillsParticipations,
        "Type:",
        typeof participant.vocationalSkillsParticipations
      );
      console.log(
        "    Completions:",
        participant.vocationalSkillsCompletions,
        "Type:",
        typeof participant.vocationalSkillsCompletions
      );
      console.log(
        "    Certifications:",
        participant.vocationalSkillsCertifications,
        "Type:",
        typeof participant.vocationalSkillsCertifications
      );
      console.log("  Soft Skills:");
      console.log(
        "    Participations:",
        participant.softSkillsParticipations,
        "Type:",
        typeof participant.softSkillsParticipations
      );
      console.log(
        "    Completions:",
        participant.softSkillsCompletions,
        "Type:",
        typeof participant.softSkillsCompletions
      );
      console.log(
        "    Certifications:",
        participant.softSkillsCertifications,
        "Type:",
        typeof participant.softSkillsCertifications
      );
    });

    // Get all participants to check their skills data
    const allParticipants = await db
      .select({
        id: participants.id,
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        vocationalSkillsCompletions: participants.vocationalSkillsCompletions,
        vocationalSkillsCertifications:
          participants.vocationalSkillsCertifications,
        softSkillsParticipations: participants.softSkillsParticipations,
        softSkillsCompletions: participants.softSkillsCompletions,
        softSkillsCertifications: participants.softSkillsCertifications,
      })
      .from(participants);

    console.log(`📈 Total participants to process: ${allParticipants.length}`);

    let updatedCount = 0;
    const BATCH_SIZE = 50;

    // Helper function to convert string to array
    const convertToArray = (
      value: string[] | string | null | undefined
    ): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;

      // If it's a string, split by comma and clean up
      const str = value.toString().trim();
      if (!str) return [];

      return str
        .split(",")
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0);
    };

    // Process participants in batches
    for (let i = 0; i < allParticipants.length; i += BATCH_SIZE) {
      const batch = allParticipants.slice(i, i + BATCH_SIZE);

      for (const participant of batch) {
        let needsUpdate = false;

        // Convert each skills field to array if needed
        const vocationalSkillsParticipations = convertToArray(
          participant.vocationalSkillsParticipations
        );
        const vocationalSkillsCompletions = convertToArray(
          participant.vocationalSkillsCompletions
        );
        const vocationalSkillsCertifications = convertToArray(
          participant.vocationalSkillsCertifications
        );
        const softSkillsParticipations = convertToArray(
          participant.softSkillsParticipations
        );
        const softSkillsCompletions = convertToArray(
          participant.softSkillsCompletions
        );
        const softSkillsCertifications = convertToArray(
          participant.softSkillsCertifications
        );

        // Check if any field needs updating
        if (
          !Array.isArray(participant.vocationalSkillsParticipations) ||
          !Array.isArray(participant.vocationalSkillsCompletions) ||
          !Array.isArray(participant.vocationalSkillsCertifications) ||
          !Array.isArray(participant.softSkillsParticipations) ||
          !Array.isArray(participant.softSkillsCompletions) ||
          !Array.isArray(participant.softSkillsCertifications)
        ) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          try {
            await db
              .update(participants)
              .set({
                vocationalSkillsParticipations,
                vocationalSkillsCompletions,
                vocationalSkillsCertifications,
                softSkillsParticipations,
                softSkillsCompletions,
                softSkillsCertifications,
              })
              .where(sql`${participants.id} = ${participant.id}`);

            updatedCount++;

            if (updatedCount <= 5) {
              console.log(`✅ Updated participant ${participant.id}:`);
              console.log(
                `  Vocational Participations: ${JSON.stringify(vocationalSkillsParticipations)}`
              );
              console.log(
                `  Soft Participations: ${JSON.stringify(softSkillsParticipations)}`
              );
            }
          } catch (error) {
            console.error(
              `❌ Failed to update participant ${participant.id}:`,
              error
            );
          }
        }
      }

      // Progress indicator
      if (i % 100 === 0 || i + BATCH_SIZE >= allParticipants.length) {
        console.log(
          `🔄 Processed ${Math.min(i + BATCH_SIZE, allParticipants.length)}/${allParticipants.length} participants`
        );
      }
    }

    console.log(
      `✅ Migration completed! Updated ${updatedCount} participants.`
    );

    // Verify the migration worked
    const verificationData = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        softSkillsParticipations: participants.softSkillsParticipations,
      })
      .from(participants)
      .limit(5);

    console.log("\n📊 Sample data after migration:");
    verificationData.forEach((participant, index) => {
      console.log(`👤 Participant ${index + 1}: ${participant.firstName}`);
      console.log(
        `  Vocational Participations: ${JSON.stringify(participant.vocationalSkillsParticipations)} (${Array.isArray(participant.vocationalSkillsParticipations) ? "Array" : "Not Array"})`
      );
      console.log(
        `  Soft Participations: ${JSON.stringify(participant.softSkillsParticipations)} (${Array.isArray(participant.softSkillsParticipations) ? "Array" : "Not Array"})`
      );
    });

    return {
      success: true,
      message: `Successfully migrated ${updatedCount} participants to use array format for skills`,
      updatedCount,
      totalParticipants: allParticipants.length,
    };
  } catch (error) {
    console.error("❌ Skills migration failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
