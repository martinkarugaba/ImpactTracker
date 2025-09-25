import { db } from "./src/lib/db";
import { participants } from "./src/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * Test script to verify skills filtering works correctly
 */
async function testSkillsFiltering() {
  try {
    console.log("🧪 Testing skills filtering...");

    // First, let's see what skills data we have
    const sampleParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        softSkillsParticipations: participants.softSkillsParticipations,
      })
      .from(participants)
      .limit(10);

    console.log("\n📊 Sample participants and their skills:");
    sampleParticipants.forEach((participant, index) => {
      console.log(
        `${index + 1}. ${participant.firstName} ${participant.lastName}`
      );
      console.log(
        `   Vocational: ${JSON.stringify(participant.vocationalSkillsParticipations)}`
      );
      console.log(
        `   Soft: ${JSON.stringify(participant.softSkillsParticipations)}`
      );
    });

    // Get all unique skills to see what we can test with
    const allVocationalSkills = new Set<string>();
    sampleParticipants.forEach(participant => {
      if (participant.vocationalSkillsParticipations) {
        participant.vocationalSkillsParticipations.forEach(skill => {
          if (skill && skill.trim()) {
            allVocationalSkills.add(skill.trim().toLowerCase());
          }
        });
      }
    });

    const uniqueSkills = Array.from(allVocationalSkills);
    console.log(`\n🎯 Found ${uniqueSkills.length} unique vocational skills:`);
    uniqueSkills.slice(0, 10).forEach((skill, index) => {
      console.log(`  ${index + 1}. "${skill}"`);
    });

    // Test filtering with the first skill if available
    if (uniqueSkills.length > 0) {
      const testSkill = uniqueSkills[0];
      console.log(`\n🔍 Testing filter for skill: "${testSkill}"`);

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
            EXISTS (
              SELECT 1 FROM unnest(${participants.vocationalSkillsParticipations}) AS skill
              WHERE LOWER(skill) = LOWER(${testSkill})
            )
          )`
        )
        .limit(10);

      console.log(
        `✅ Found ${filteredResults.length} participants with "${testSkill}"`
      );
      filteredResults.forEach((participant, index) => {
        console.log(
          `  ${index + 1}. ${participant.firstName} ${participant.lastName}`
        );
        console.log(
          `     Skills: ${JSON.stringify(participant.vocationalSkillsParticipations)}`
        );
        const hasSkill = participant.vocationalSkillsParticipations?.some(
          skill => skill?.toLowerCase() === testSkill.toLowerCase()
        );
        console.log(`     Contains "${testSkill}": ${hasSkill}`);
      });

      // Test with a common skill name if we know one
      const commonSkills = [
        "book making",
        "tailoring",
        "entrepreneurship",
        "business skills",
        "computer skills",
      ];

      for (const commonSkill of commonSkills) {
        const testResults = await db
          .select({
            id: participants.id,
            firstName: participants.firstName,
          })
          .from(participants)
          .where(
            sql`(
              EXISTS (
                SELECT 1 FROM unnest(${participants.vocationalSkillsParticipations}) AS skill
                WHERE LOWER(skill) = LOWER(${commonSkill})
              )
            )`
          )
          .limit(5);

        if (testResults.length > 0) {
          console.log(
            `\n🎯 Found ${testResults.length} participants with "${commonSkill}"`
          );
          testResults.forEach((participant, index) => {
            console.log(`  ${index + 1}. ${participant.firstName}`);
          });
          break; // Stop after finding one that works
        }
      }
    }

    return {
      success: true,
      totalSampleParticipants: sampleParticipants.length,
      uniqueSkillsCount: uniqueSkills.length,
      skillsFound: uniqueSkills.slice(0, 5),
    };
  } catch (error) {
    console.error("❌ Skills filtering test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Run the test
if (process.env.DATABASE_URL) {
  testSkillsFiltering()
    .then(result => {
      console.log("\n✅ Skills filtering test completed:", result);
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
} else {
  console.log("⚠️  DATABASE_URL not set, skipping test");
}
