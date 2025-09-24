#!/usr/bin/env tsx
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function checkSkillsData() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }

    const client = postgres(process.env.DATABASE_URL, {
      ssl: true,
      connect_timeout: 10,
      idle_timeout: 0.5,
      max_lifetime: 60 * 30,
    });

    const db = drizzle(client);

    // First, let's check if we have any participants at all
    const participants = await db.query.participants.findMany({
      limit: 5,
    });

    console.log("\n🔍 First few participants found:", participants.length);

    if (participants.length > 0) {
      console.log("\n📊 Sample participant data (first record):");
      console.log(
        JSON.stringify(
          {
            id: participants[0].id,
            firstName: participants[0].firstName,
            lastName: participants[0].lastName,
            vocationalSkills: participants[0].vocationalSkillsParticipations,
            softSkills: participants[0].softSkillsParticipations,
          },
          null,
          2
        )
      );
    }

    // Now let's check specifically for participants with skills
    const participantsWithSkills = await db.query.participants.findMany({
      where: sql`array_length(vocational_skills_participations, 1) > 0 OR array_length(soft_skills_participations, 1) > 0`,
    });

    console.log(
      "\n📊 Participants with any skills:",
      participantsWithSkills.length
    );

    if (participantsWithSkills.length > 0) {
      console.log("\n🎯 Example participant with skills:");
      const example = participantsWithSkills[0];
      console.log({
        name: `${example.firstName} ${example.lastName}`,
        vocationalSkills: example.vocationalSkillsParticipations,
        softSkills: example.softSkillsParticipations,
      });
    }

    // Get unique skills
    const uniqueVocationalSkills = await db.execute(
      sql`SELECT DISTINCT unnest(vocational_skills_participations) as skill FROM participants WHERE array_length(vocational_skills_participations, 1) > 0`
    );
    const uniqueSoftSkills = await db.execute(
      sql`SELECT DISTINCT unnest(soft_skills_participations) as skill FROM participants WHERE array_length(soft_skills_participations, 1) > 0`
    );

    console.log(
      "\n🔧 Unique vocational skills in database:",
      uniqueVocationalSkills.rows.map(r => r.skill)
    );
    console.log(
      "\n🤝 Unique soft skills in database:",
      uniqueSoftSkills.rows.map(r => r.skill)
    );
  } catch (error) {
    console.error("Error checking skills data:", error);
  }
}

checkSkillsData();
