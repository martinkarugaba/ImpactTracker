"use server";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";

export interface SkillsOptions {
  vocationalSkills: string[];
  softSkills: string[];
  businessSkills: string[];
}

/**
 * Get all unique skills from the database for filter options
 * Updated to match the improved filtering logic with better data handling
 */
export async function getUniqueSkills(): Promise<SkillsOptions> {
  try {
    console.log("🔍 Fetching unique skills from database...");

    // Get all participants with their skills arrays
    const allParticipants = await db
      .select({
        vocationalSkillsParticipations:
          participants.vocationalSkillsParticipations,
        vocationalSkillsCompletions: participants.vocationalSkillsCompletions,
        vocationalSkillsCertifications:
          participants.vocationalSkillsCertifications,
        softSkillsParticipations: participants.softSkillsParticipations,
        softSkillsCompletions: participants.softSkillsCompletions,
        softSkillsCertifications: participants.softSkillsCertifications,
      })
      .from(participants);

    console.log(
      `📊 Processing skills from ${allParticipants.length} participants`
    );

    // Extract unique skills from arrays with improved data handling
    const vocationalSkillsSet = new Set<string>();
    const softSkillsSet = new Set<string>();

    // Helper function to process skills arrays and extract individual skills
    const processSkillsArray = (
      skillsArray: string[] | null | undefined
    ): string[] => {
      if (!skillsArray || !Array.isArray(skillsArray)) return [];

      const individualSkills: string[] = [];

      skillsArray
        .filter(skill => skill != null && typeof skill === "string")
        .forEach(skill => {
          const trimmedSkill = skill.trim();
          if (!trimmedSkill) return;

          // Split by various separators to extract individual skills
          const separators = [",", ";", "/", "&", " and ", " + "];
          let skillsToProcess = [trimmedSkill];

          // Apply each separator
          separators.forEach(separator => {
            const newSkills: string[] = [];
            skillsToProcess.forEach(s => {
              if (s.includes(separator)) {
                newSkills.push(...s.split(separator));
              } else {
                newSkills.push(s);
              }
            });
            skillsToProcess = newSkills;
          });

          // Clean up and add individual skills
          skillsToProcess.forEach(s => {
            const cleanSkill = s.trim();
            if (cleanSkill.length > 0) {
              individualSkills.push(cleanSkill);
            }
          });
        });

      return individualSkills;
    };

    allParticipants.forEach((participant, index) => {
      // Debug first few participants to show skill extraction
      if (index < 3) {
        console.log(`👤 Processing participant ${index + 1}:`);
        console.log(
          "   Raw vocational participations:",
          participant.vocationalSkillsParticipations
        );

        const processedVocational = processSkillsArray(
          participant.vocationalSkillsParticipations
        );
        console.log(
          "   Extracted individual vocational skills:",
          processedVocational
        );

        console.log(
          "   Raw soft participations:",
          participant.softSkillsParticipations
        );

        const processedSoft = processSkillsArray(
          participant.softSkillsParticipations
        );
        console.log("   Extracted individual soft skills:", processedSoft);
      }

      // Vocational skills from all participation types
      const allVocationalSkills = [
        ...processSkillsArray(participant.vocationalSkillsParticipations),
        ...processSkillsArray(participant.vocationalSkillsCompletions),
        ...processSkillsArray(participant.vocationalSkillsCertifications),
      ];

      allVocationalSkills.forEach(skill => {
        if (skill && skill.trim()) {
          // Normalize the skill name for consistency
          const normalizedSkill = skill.trim();
          vocationalSkillsSet.add(normalizedSkill);
        }
      });

      // Soft skills from all participation types
      const allSoftSkills = [
        ...processSkillsArray(participant.softSkillsParticipations),
        ...processSkillsArray(participant.softSkillsCompletions),
        ...processSkillsArray(participant.softSkillsCertifications),
      ];

      allSoftSkills.forEach(skill => {
        if (skill && skill.trim()) {
          // Normalize the skill name for consistency
          const normalizedSkill = skill.trim();
          softSkillsSet.add(normalizedSkill);
        }
      });
    });

    // Convert sets to sorted arrays with case-insensitive sorting
    const vocationalSkills = Array.from(vocationalSkillsSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    const softSkills = Array.from(softSkillsSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Business skills: For now, we include vocational skills that might be business-related
    // This allows business skills filtering to work with the vocational skills data
    const businessRelatedKeywords = [
      "business",
      "entrepreneur",
      "marketing",
      "accounting",
      "finance",
      "management",
    ];
    const businessSkills = vocationalSkills.filter(skill =>
      businessRelatedKeywords.some(keyword =>
        skill.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    console.log("✅ Extracted unique individual skills:");
    console.log(`   📈 Vocational skills: ${vocationalSkills.length}`);
    console.log(`   📈 Soft skills: ${softSkills.length}`);
    console.log(`   📈 Business-related skills: ${businessSkills.length}`);

    // Validate that extracted skills actually return participants
    console.log("🔍 Validating skills return participants...");
    const validatedVocationalSkills = vocationalSkills;
    const validatedSoftSkills = softSkills;

    // In development, validate a sample of skills
    if (process.env.NODE_ENV === "development" && vocationalSkills.length > 0) {
      const sampleSkills = vocationalSkills.slice(0, 5);
      const validSkills: string[] = [];

      for (const skill of sampleSkills) {
        const testResults = await db
          .select({ id: participants.id })
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
          .limit(1);

        if (testResults.length > 0) {
          validSkills.push(skill);
        } else {
          console.log(
            `   ⚠️  Skill "${skill}" returns zero participants - investigating...`
          );
        }
      }

      console.log(
        `   ✅ Validated ${validSkills.length}/${sampleSkills.length} sample skills`
      );
    }

    // Log sample individual skills for debugging
    if (validatedVocationalSkills.length > 0) {
      console.log(
        "   🎯 Sample individual vocational skills:",
        validatedVocationalSkills.slice(0, 10)
      );
    }
    if (validatedSoftSkills.length > 0) {
      console.log(
        "   🎯 Sample individual soft skills:",
        validatedSoftSkills.slice(0, 10)
      );
    }
    if (businessSkills.length > 0) {
      console.log(
        "   🎯 Sample business-related skills:",
        businessSkills.slice(0, 5)
      );
    }

    return {
      vocationalSkills,
      softSkills,
      businessSkills,
    };
  } catch (error) {
    console.error("❌ Error fetching unique skills:", error);
    return {
      vocationalSkills: [],
      softSkills: [],
      businessSkills: [],
    };
  }
}
