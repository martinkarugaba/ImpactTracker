import { db } from "./src/lib/db/index.js";
import { participants } from "./src/lib/db/schema.js";
import { sql } from "drizzle-orm";

async function debugSkillsFiltering() {
  try {
    console.log("🔍 Testing skills filtering...");

    // 1. Check if participants table has skills data
    console.log("\n📊 Checking participants with skills data:");

    const skillsData = await db.query.participants.findMany({
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        vocationalSkillsParticipations: true,
        softSkillsParticipations: true,
      },
      where: sql`array_length(${participants.vocationalSkillsParticipations}, 1) > 0 OR array_length(${participants.softSkillsParticipations}, 1) > 0`,
      limit: 5,
    });

    console.log(`Found ${skillsData.length} participants with skills data:`);
    skillsData.forEach(participant => {
      console.log(`- ${participant.firstName} ${participant.lastName}:`);
      console.log(
        `  Vocational: ${JSON.stringify(participant.vocationalSkillsParticipations)}`
      );
      console.log(
        `  Soft: ${JSON.stringify(participant.softSkillsParticipations)}`
      );
    });

    // 2. Test a specific skill filter
    if (
      skillsData.length > 0 &&
      skillsData[0].vocationalSkillsParticipations?.length > 0
    ) {
      const testSkill = skillsData[0].vocationalSkillsParticipations[0];
      console.log(`\n🧪 Testing filter with vocational skill: "${testSkill}"`);

      const filteredParticipants = await db.query.participants.findMany({
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          vocationalSkillsParticipations: true,
        },
        where: sql`${testSkill} = ANY(${participants.vocationalSkillsParticipations})`,
        limit: 3,
      });

      console.log(
        `Found ${filteredParticipants.length} participants with skill "${testSkill}":`
      );
      filteredParticipants.forEach(participant => {
        console.log(
          `- ${participant.firstName} ${participant.lastName}: ${JSON.stringify(participant.vocationalSkillsParticipations)}`
        );
      });
    } else {
      console.log(
        "\n❌ No participants with vocational skills found in database!"
      );
    }

    // 3. Count total participants
    const totalCount = await db.$count(participants);
    console.log(`\n📊 Total participants in database: ${totalCount}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

debugSkillsFiltering();
