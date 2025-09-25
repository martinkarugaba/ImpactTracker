import { getUniqueSkills } from "./src/features/participants/actions/get-unique-skills";

async function testSkillsOptions() {
  console.log("🔍 Testing skills options...");

  try {
    const skills = await getUniqueSkills();

    console.log("📊 Skills loaded:");
    console.log(
      `📈 Vocational skills count: ${skills.vocationalSkills.length}`
    );
    console.log(`📈 Soft skills count: ${skills.softSkills.length}`);
    console.log(`📈 Business skills count: ${skills.businessSkills.length}`);

    if (skills.vocationalSkills.length > 0) {
      console.log("🎯 Sample vocational skills:");
      skills.vocationalSkills.slice(0, 10).forEach((skill, index) => {
        console.log(`  ${index + 1}. "${skill}"`);
      });
    }

    if (skills.softSkills.length > 0) {
      console.log("🎯 Sample soft skills:");
      skills.softSkills.slice(0, 10).forEach((skill, index) => {
        console.log(`  ${index + 1}. "${skill}"`);
      });
    }

    // Check if 'book making' exists in the options
    const hasBookMaking = skills.vocationalSkills.includes("book making");
    console.log(`\n📝 'book making' in vocational skills: ${hasBookMaking}`);

    // Look for variations
    const bookMakingVariations = skills.vocationalSkills.filter(skill =>
      skill.toLowerCase().includes("book")
    );
    console.log(
      `📝 Skills containing 'book': ${JSON.stringify(bookMakingVariations)}`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testSkillsOptions();
