"use server";

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

    // Helper function to process skills arrays more robustly
    const processSkillsArray = (
      skillsArray: string[] | null | undefined
    ): string[] => {
      if (!skillsArray || !Array.isArray(skillsArray)) return [];

      return skillsArray
        .filter(skill => skill != null && typeof skill === "string")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .map(skill => {
          // Handle potential comma-separated values within single array items
          if (skill.includes(",")) {
            return skill
              .split(",")
              .map(s => s.trim())
              .filter(s => s.length > 0);
          }
          return [skill];
        })
        .flat();
    };

    allParticipants.forEach((participant, index) => {
      // Debug first few participants
      if (index < 3) {
        console.log(`👤 Processing participant ${index + 1}:`);
        console.log(
          "   Vocational participations:",
          participant.vocationalSkillsParticipations
        );
        console.log(
          "   Soft participations:",
          participant.softSkillsParticipations
        );
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

    console.log("✅ Extracted unique skills:");
    console.log(`   📈 Vocational skills: ${vocationalSkills.length}`);
    console.log(`   📈 Soft skills: ${softSkills.length}`);
    console.log(`   📈 Business-related skills: ${businessSkills.length}`);

    // Log some sample skills for debugging
    if (vocationalSkills.length > 0) {
      console.log(
        "   🎯 Sample vocational skills:",
        vocationalSkills.slice(0, 5)
      );
    }
    if (softSkills.length > 0) {
      console.log("   🎯 Sample soft skills:", softSkills.slice(0, 5));
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
