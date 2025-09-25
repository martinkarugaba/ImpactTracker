import { getUniqueSkills } from "./src/features/participants/actions/get-unique-skills";

async function debugSkillsOptions() {
  console.log("🔍 Starting skills options debug...");

  try {
    const skills = await getUniqueSkills();
    console.log("📊 Skills loaded:", skills);
    console.log("📈 Vocational skills count:", skills.vocationalSkills.length);
    console.log("📈 Soft skills count:", skills.softSkills.length);
    console.log("📈 Business skills count:", skills.businessSkills.length);

    if (skills.vocationalSkills.length > 0) {
      console.log(
        "🎯 Sample vocational skills:",
        skills.vocationalSkills.slice(0, 5)
      );
    }

    if (skills.softSkills.length > 0) {
      console.log("🎯 Sample soft skills:", skills.softSkills.slice(0, 5));
    }
  } catch (error) {
    console.error("❌ Error loading skills:", error);
  }
}

debugSkillsOptions();
