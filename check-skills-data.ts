import { db } from "./src/lib/db";
import { participants } from "./src/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * Simple migration script to ensure skills fields are arrays
 */
async function migrateSkillsToArrays() {
  try {
    console.log("🔄 Starting skills array migration...");

    // Get a sample to check current data format
    const sampleData = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        softSkillsParticipations: participants.softSkillsParticipations,
      })
      .from(participants)
      .limit(5);

    console.log("📊 Sample data:");
    sampleData.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.firstName}`);
      console.log(
        `   Vocational: ${JSON.stringify(participant.vocationalSkillsParticipations)} (${Array.isArray(participant.vocationalSkillsParticipations) ? "Array" : "Not Array"})`
      );
      console.log(
        `   Soft: ${JSON.stringify(participant.softSkillsParticipations)} (${Array.isArray(participant.softSkillsParticipations) ? "Array" : "Not Array"})`
      );
    });

    // Test filtering with a common skill
    const testSkill = "book making";
    console.log(`\n🎯 Testing filter for "${testSkill}"`);

    const filteredResults = await db
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
      .limit(10);

    console.log(
      `Found ${filteredResults.length} participants with "${testSkill}"`
    );
    filteredResults.forEach((participant, index) => {
      console.log(
        `${index + 1}. ${participant.firstName} ${participant.lastName}`
      );
      console.log(
        `   Skills: ${JSON.stringify(participant.vocationalSkillsParticipations)}`
      );
    });

    // Show all unique skills to help debug
    const uniqueSkillsQuery = await db
      .select({
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        softSkillsParticipations: participants.softSkillsParticipations,
      })
      .from(participants)
      .limit(50);

    const allVocationalSkills = new Set<string>();
    const allSoftSkills = new Set<string>();

    uniqueSkillsQuery.forEach(participant => {
      if (participant.vocationalSkillsParticipations) {
        participant.vocationalSkillsParticipations.forEach(skill => {
          if (skill && skill.trim()) {
            allVocationalSkills.add(skill.trim());
          }
        });
      }

      if (participant.softSkillsParticipations) {
        participant.softSkillsParticipations.forEach(skill => {
          if (skill && skill.trim()) {
            allSoftSkills.add(skill.trim());
          }
        });
      }
    });

    console.log(
      `\n📈 Found ${allVocationalSkills.size} unique vocational skills:`
    );
    Array.from(allVocationalSkills)
      .sort()
      .slice(0, 10)
      .forEach(skill => console.log(`  - ${skill}`));

    console.log(`\n📈 Found ${allSoftSkills.size} unique soft skills:`);
    Array.from(allSoftSkills)
      .sort()
      .slice(0, 10)
      .forEach(skill => console.log(`  - ${skill}`));

    return {
      success: true,
      vocationalSkillsCount: allVocationalSkills.size,
      softSkillsCount: allSoftSkills.size,
      sampleDataIsArrayFormat: sampleData.every(
        p =>
          Array.isArray(p.vocationalSkillsParticipations) &&
          Array.isArray(p.softSkillsParticipations)
      ),
    };
  } catch (error) {
    console.error("❌ Migration check failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Run the migration check
migrateSkillsToArrays()
  .then(result => {
    console.log("\n✅ Migration check completed:", result);
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ Migration check failed:", error);
    process.exit(1);
  });
