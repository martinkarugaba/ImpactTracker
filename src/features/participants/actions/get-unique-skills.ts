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
 */
export async function getUniqueSkills(): Promise<SkillsOptions> {
  try {
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

    // Extract unique skills from arrays
    const vocationalSkillsSet = new Set<string>();
    const softSkillsSet = new Set<string>();

    allParticipants.forEach(participant => {
      // Vocational skills from all participation types
      [
        ...(participant.vocationalSkillsParticipations || []),
        ...(participant.vocationalSkillsCompletions || []),
        ...(participant.vocationalSkillsCertifications || []),
      ].forEach(skill => {
        if (skill && skill.trim()) {
          vocationalSkillsSet.add(skill.trim());
        }
      });

      // Soft skills from all participation types
      [
        ...(participant.softSkillsParticipations || []),
        ...(participant.softSkillsCompletions || []),
        ...(participant.softSkillsCertifications || []),
      ].forEach(skill => {
        if (skill && skill.trim()) {
          softSkillsSet.add(skill.trim());
        }
      });
    });

    // Convert sets to sorted arrays
    const vocationalSkills = Array.from(vocationalSkillsSet).sort();
    const softSkills = Array.from(softSkillsSet).sort();

    // Business skills: Since there are no business skills participation/completion columns
    // in the database, we return an empty array. Business skills filtering should
    // rely on the hasBusinessSkills boolean field instead.
    const businessSkills: string[] = [];

    console.log(
      `Found ${vocationalSkills.length} unique vocational skills and ${softSkills.length} unique soft skills`
    );

    return {
      vocationalSkills,
      softSkills,
      businessSkills,
    };
  } catch (error) {
    console.error("Error fetching unique skills:", error);
    return {
      vocationalSkills: [],
      softSkills: [],
      businessSkills: [],
    };
  }
}
