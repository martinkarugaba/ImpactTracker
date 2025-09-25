"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function debugSkillsData() {
  try {
    console.log("🔍 Starting skills data debug...");

    // Get some sample participants with their skills data
    const sampleParticipants = await db
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
      .limit(10);

    console.log("📊 Sample participants skills data:");
    sampleParticipants.forEach((participant, index) => {
      console.log(
        `\n👤 Participant ${index + 1}: ${participant.firstName} ${participant.lastName}`
      );
      console.log("  Vocational Skills:");
      console.log(
        "    Participations:",
        participant.vocationalSkillsParticipations
      );
      console.log("    Completions:", participant.vocationalSkillsCompletions);
      console.log(
        "    Certifications:",
        participant.vocationalSkillsCertifications
      );
      console.log("  Soft Skills:");
      console.log("    Participations:", participant.softSkillsParticipations);
      console.log("    Completions:", participant.softSkillsCompletions);
      console.log("    Certifications:", participant.softSkillsCertifications);
    });

    // Test a specific skill filter
    const testSkill = "book making";
    console.log(`\n🎯 Testing filter for skill: "${testSkill}"`);

    const filteredParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
      })
      .from(participants)
      .where(
        sql`(
          ${testSkill} = ANY(${participants.vocationalSkillsParticipations}) OR
          ${testSkill} = ANY(${participants.vocationalSkillsCompletions}) OR
          ${testSkill} = ANY(${participants.vocationalSkillsCertifications})
        )`
      )
      .limit(5);

    console.log(
      `🎯 Found ${filteredParticipants.length} participants with "${testSkill}"`
    );
    filteredParticipants.forEach((participant, index) => {
      console.log(
        `  ${index + 1}. ${participant.firstName} ${participant.lastName}`
      );
      console.log(`     Skills: ${participant.vocationalSkillsParticipations}`);
    });

    return {
      success: true,
      data: {
        sampleCount: sampleParticipants.length,
        filteredCount: filteredParticipants.length,
        sampleParticipants,
        filteredParticipants,
      },
    };
  } catch (error) {
    console.error("❌ Error in skills debug:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
