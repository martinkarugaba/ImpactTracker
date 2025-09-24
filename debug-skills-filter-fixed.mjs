#!/usr/bin/env node

// Debug script to test skills filtering in the database
import { Pool } from "pg";

async function debugSkillsFiltering() {
  // Get database connection from environment
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔍 Testing skills filtering...");

    // 1. Check if participants table has skills data
    console.log("\n📊 Checking participants with skills data:");
    const skillsDataQuery = `
      SELECT 
        id, 
        "first_name", 
        "last_name",
        "vocational_skills_participations",
        "vocational_skills_completions", 
        "vocational_skills_certifications",
        "soft_skills_participations",
        "soft_skills_completions",
        "soft_skills_certifications"
      FROM participants 
      WHERE 
        array_length("vocational_skills_participations", 1) > 0 
        OR array_length("soft_skills_participations", 1) > 0
      LIMIT 5;
    `;

    const skillsData = await pool.query(skillsDataQuery);
    console.log(
      `Found ${skillsData.rows.length} participants with skills data:`
    );
    skillsData.rows.forEach(row => {
      console.log(`- ${row.first_name} ${row.last_name}:`);
      console.log(
        `  Vocational Participations: ${JSON.stringify(row.vocational_skills_participations)}`
      );
      console.log(
        `  Soft Participations: ${JSON.stringify(row.soft_skills_participations)}`
      );
    });

    // 2. Get unique skills from all participants
    console.log("\n🎯 Getting unique vocational skills:");
    const uniqueVocationalQuery = `
      SELECT DISTINCT unnest("vocational_skills_participations") as skill
      FROM participants 
      WHERE array_length("vocational_skills_participations", 1) > 0
      ORDER BY skill
      LIMIT 10;
    `;

    const uniqueVocational = await pool.query(uniqueVocationalQuery);
    console.log(
      "Unique vocational skills:",
      uniqueVocational.rows.map(r => r.skill)
    );

    console.log("\n🎯 Getting unique soft skills:");
    const uniqueSoftQuery = `
      SELECT DISTINCT unnest("soft_skills_participations") as skill
      FROM participants 
      WHERE array_length("soft_skills_participations", 1) > 0
      ORDER BY skill
      LIMIT 10;
    `;

    const uniqueSoft = await pool.query(uniqueSoftQuery);
    console.log(
      "Unique soft skills:",
      uniqueSoft.rows.map(r => r.skill)
    );

    // 3. Test the actual filtering query
    if (uniqueVocational.rows.length > 0) {
      const testSkill = uniqueVocational.rows[0].skill;
      console.log(`\n🧪 Testing filter with vocational skill: "${testSkill}"`);

      const filterQuery = `
        SELECT COUNT(*) as count
        FROM participants 
        WHERE $1 = ANY("vocational_skills_participations")
           OR $1 = ANY("vocational_skills_completions") 
           OR $1 = ANY("vocational_skills_certifications");
      `;

      const filterResult = await pool.query(filterQuery, [testSkill]);
      console.log(
        `Found ${filterResult.rows[0].count} participants with skill "${testSkill}"`
      );

      // Show some examples
      const examplesQuery = `
        SELECT "first_name", "last_name", "vocational_skills_participations"
        FROM participants 
        WHERE $1 = ANY("vocational_skills_participations")
        LIMIT 3;
      `;

      const examples = await pool.query(examplesQuery, [testSkill]);
      console.log("Examples:");
      examples.rows.forEach(row => {
        console.log(
          `- ${row.first_name} ${row.last_name}: ${JSON.stringify(row.vocational_skills_participations)}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

debugSkillsFiltering();
