import { db } from "./src/lib/db";
import { participants } from "./src/lib/db/schema";
import { sql } from "drizzle-orm";
import { getUniqueSkills } from "./src/features/participants/actions/get-unique-skills";

/**
 * Diagnostic script to find why some skills return zero participants
 */
async function diagnoseMissingSkills() {
  try {
    console.log("🔍 Diagnosing skills filtering discrepancies...");

    // Get unique skills using our extraction function
    const skillsOptions = await getUniqueSkills();
    console.log(
      `📊 Found ${skillsOptions.vocationalSkills.length} unique vocational skills`
    );

    // Test a few skills to see if they return participants
    const testSkills = skillsOptions.vocationalSkills.slice(0, 10);
    console.log("\n🧪 Testing first 10 vocational skills:");

    for (const skill of testSkills) {
      console.log(`\n🎯 Testing skill: "${skill}"`);

      // Test with exact match
      const exactResults = await db
        .select({
          id: participants.id,
          firstName: participants.firstName,
          vocationalSkillsParticipations:
            participants.vocationalSkillsParticipations,
        })
        .from(participants)
        .where(
          sql`(
            EXISTS (
              SELECT 1 FROM unnest(${participants.vocationalSkillsParticipations}) AS skill_item
              WHERE LOWER(skill_item) = LOWER(${skill})
            ) OR
            EXISTS (
              SELECT 1 FROM unnest(${participants.vocationalSkillsCompletions}) AS skill_item
              WHERE LOWER(skill_item) = LOWER(${skill})
            ) OR
            EXISTS (
              SELECT 1 FROM unnest(${participants.vocationalSkillsCertifications}) AS skill_item
              WHERE LOWER(skill_item) = LOWER(${skill})
            )
          )`
        )
        .limit(5);

      console.log(
        `   📈 Found ${exactResults.length} participants with exact match`
      );

      if (exactResults.length === 0) {
        console.log(`   ⚠️  ZERO RESULTS for "${skill}" - investigating...`);

        // Check if skill exists in raw data
        const rawDataCheck = await db
          .select({
            id: participants.id,
            firstName: participants.firstName,
            vocationalSkillsParticipations:
              participants.vocationalSkillsParticipations,
          })
          .from(participants)
          .where(
            sql`(
              ${participants.vocationalSkillsParticipations} IS NOT NULL AND
              array_length(${participants.vocationalSkillsParticipations}, 1) > 0
            )`
          )
          .limit(5);

        console.log(
          `   🔍 Sample raw data (first 5 participants with skills):`
        );
        rawDataCheck.forEach((participant, index) => {
          console.log(
            `     ${index + 1}. ${participant.firstName}: ${JSON.stringify(participant.vocationalSkillsParticipations)}`
          );

          // Check if any skills contain our target skill
          const skillsContainTarget =
            participant.vocationalSkillsParticipations?.some(skillItem =>
              skillItem?.toLowerCase().includes(skill.toLowerCase())
            );
          console.log(`        Contains "${skill}": ${skillsContainTarget}`);
        });
      } else {
        console.log(
          `   ✅ Found participants:`,
          exactResults.map(p => p.firstName)
        );
        console.log(
          `   📋 Sample skills:`,
          exactResults[0]?.vocationalSkillsParticipations
        );
      }
    }

    // Check for potential data format issues
    console.log("\n🔍 Checking for data format issues...");
    const sampleData = await db
      .select({
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        softSkillsParticipations: participants.softSkillsParticipations,
      })
      .from(participants)
      .where(
        sql`(
          ${participants.vocationalSkillsParticipations} IS NOT NULL OR
          ${participants.softSkillsParticipations} IS NOT NULL
        )`
      )
      .limit(10);

    console.log("📊 Sample skills data formats:");
    sampleData.forEach((participant, index) => {
      console.log(
        `${index + 1}. Vocational: ${JSON.stringify(participant.vocationalSkillsParticipations)} (Type: ${Array.isArray(participant.vocationalSkillsParticipations) ? "Array" : typeof participant.vocationalSkillsParticipations})`
      );
      console.log(
        `   Soft: ${JSON.stringify(participant.softSkillsParticipations)} (Type: ${Array.isArray(participant.softSkillsParticipations) ? "Array" : typeof participant.softSkillsParticipations})`
      );
    });

    return {
      success: true,
      totalSkills: skillsOptions.vocationalSkills.length,
      testedSkills: testSkills.length,
    };
  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Run the diagnosis
if (process.env.DATABASE_URL) {
  diagnoseMissingSkills()
    .then(result => {
      console.log("\n✅ Diagnosis completed:", result);
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Diagnosis failed:", error);
      process.exit(1);
    });
} else {
  console.log("⚠️  DATABASE_URL not set, skipping diagnosis");
}
