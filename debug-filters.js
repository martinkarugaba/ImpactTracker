import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

// Create database connection using the same setup as the main app
const sql = neon(process.env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store",
    keepalive: false,
  },
  fullResults: true,
  arrayMode: false,
});

async function debugFilters() {
  try {
    console.log("🔍 Debugging participant filters...\n");

    // Get basic stats
    const allParticipants =
      await sql`SELECT age, sex, is_pwd FROM participants LIMIT 100`;
    console.log("📊 Sample of first 100 participants:");
    console.log("Result structure:", JSON.stringify(allParticipants, null, 2));

    // For Neon, the result might be in .rows property
    const participants = allParticipants.rows || allParticipants;

    if (Array.isArray(participants) && participants.length > 0) {
      console.log("Total participants found:", participants.length);
      console.log("Ages:", participants.map(p => p.age).slice(0, 20));
      console.log("Sexes:", [...new Set(participants.map(p => p.sex))]);
      console.log("PWD values:", [...new Set(participants.map(p => p.is_pwd))]);
    } else {
      console.log("No participants found or unexpected format");
    }

    // Check age distribution
    const ageStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN age >= 15 AND age <= 35 THEN 1 END) as age_15_35,
        COUNT(CASE WHEN age > 35 THEN 1 END) as age_over_35,
        COUNT(CASE WHEN age >= 36 AND age <= 59 THEN 1 END) as age_36_59,
        COUNT(CASE WHEN age >= 60 THEN 1 END) as age_60_plus
      FROM participants
    `;
    console.log("\n📈 Age distribution:");
    console.log(ageStats.rows[0]);

    // Check PWD distribution
    const pwdStats = await sql`
      SELECT 
        is_pwd,
        COUNT(*) as count
      FROM participants 
      GROUP BY is_pwd
    `;
    console.log("\n♿ PWD distribution:");
    console.log(pwdStats.rows);

    // Check sex distribution
    const sexStats = await sql`
      SELECT 
        sex,
        COUNT(*) as count
      FROM participants 
      GROUP BY sex
    `;
    console.log("\n👥 Sex distribution:");
    console.log(sexStats.rows);

    // Test the exact filter that's not working (36-59 age group)
    const age36to59 = await sql`
      SELECT COUNT(*) as count
      FROM participants 
      WHERE age >= 36 AND age <= 59
    `;
    console.log("\n🎯 Participants aged 36-59:");
    console.log(age36to59.rows[0]);

    // Test our current filter logic (15-35)
    const age15to35 = await sql`
      SELECT COUNT(*) as count
      FROM participants 
      WHERE age >= 15 AND age <= 35
    `;
    console.log("\n🎯 Participants aged 15-35:");
    console.log(age15to35.rows[0]);

    // Test over 35
    const ageOver35 = await sql`
      SELECT COUNT(*) as count
      FROM participants 
      WHERE age > 35
    `;
    console.log("\n🎯 Participants over 35:");
    console.log(ageOver35.rows[0]);

    // Test 60+ specifically
    const age60Plus = await sql`
      SELECT COUNT(*) as count
      FROM participants 
      WHERE age >= 60
    `;
    console.log("\n🎯 Participants aged 60+:");
    console.log(age60Plus.rows[0]);

    // Show some actual ages over 35 for verification
    const samplesOver35 = await sql`
      SELECT age, sex, is_pwd
      FROM participants 
      WHERE age > 35
      ORDER BY age
      LIMIT 20
    `;
    console.log("\n🔍 Sample participants over 35:");
    console.log(
      samplesOver35.rows.map(
        p => `Age: ${p.age}, Sex: ${p.sex}, PWD: ${p.is_pwd}`
      )
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugFilters();
