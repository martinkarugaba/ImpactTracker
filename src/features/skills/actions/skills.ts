"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";
import type {
  SkillsMetrics,
  SkillSummary,
  SkillDetails,
  SkillType,
  SkillStatus,
  SkillsResponse,
  SkillParticipant,
} from "../types/types";

/**
 * Get overall skills metrics and statistics
 */
export async function getSkillsMetrics(
  clusterId?: string
): Promise<SkillsResponse<SkillsMetrics>> {
  try {
    // Build base query with cluster filter if provided
    const baseCondition = clusterId
      ? eq(participants.cluster_id, clusterId)
      : undefined;

    // Get all participants with skills
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
        id: participants.id,
      })
      .from(participants)
      .where(baseCondition);

    // Extract unique skills
    const vocationalSkillsSet = new Set<string>();
    const softSkillsSet = new Set<string>();
    const skillCounts = new Map<string, { count: number; type: SkillType }>();
    const participantsWithSkills = new Set<string>();

    let totalCompletions = 0;
    let totalCertifications = 0;
    let totalParticipations = 0;

    allParticipants.forEach(participant => {
      let hasAnySkill = false;

      // Process vocational skills
      const vocationalSkills = [
        ...(participant.vocationalSkillsParticipations || []),
        ...(participant.vocationalSkillsCompletions || []),
        ...(participant.vocationalSkillsCertifications || []),
      ];

      vocationalSkills.forEach(skill => {
        if (skill && skill.trim()) {
          const cleanSkill = skill.trim();
          vocationalSkillsSet.add(cleanSkill);
          hasAnySkill = true;

          const current = skillCounts.get(cleanSkill) || {
            count: 0,
            type: "vocational" as SkillType,
          };
          skillCounts.set(cleanSkill, { ...current, count: current.count + 1 });
        }
      });

      // Process soft skills
      const softSkills = [
        ...(participant.softSkillsParticipations || []),
        ...(participant.softSkillsCompletions || []),
        ...(participant.softSkillsCertifications || []),
      ];

      softSkills.forEach(skill => {
        if (skill && skill.trim()) {
          const cleanSkill = skill.trim();
          softSkillsSet.add(cleanSkill);
          hasAnySkill = true;

          const current = skillCounts.get(cleanSkill) || {
            count: 0,
            type: "soft" as SkillType,
          };
          skillCounts.set(cleanSkill, { ...current, count: current.count + 1 });
        }
      });

      // Count completions and certifications
      totalParticipations +=
        (participant.vocationalSkillsParticipations?.length || 0) +
        (participant.softSkillsParticipations?.length || 0);
      totalCompletions +=
        (participant.vocationalSkillsCompletions?.length || 0) +
        (participant.softSkillsCompletions?.length || 0);
      totalCertifications +=
        (participant.vocationalSkillsCertifications?.length || 0) +
        (participant.softSkillsCertifications?.length || 0);

      if (hasAnySkill) {
        participantsWithSkills.add(participant.id);
      }
    });

    // Get top 10 skills
    const topSkills = Array.from(skillCounts.entries())
      .map(([skillName, data]) => ({
        skillName,
        skillType: data.type,
        participantCount: data.count,
      }))
      .sort((a, b) => b.participantCount - a.participantCount)
      .slice(0, 10);

    // Calculate business skills (subset of vocational with business keywords)
    const businessKeywords = [
      "business",
      "entrepreneur",
      "marketing",
      "accounting",
      "finance",
      "management",
    ];
    const businessSkillsCount = Array.from(vocationalSkillsSet).filter(skill =>
      businessKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    ).length;

    const averageCompletionRate =
      totalParticipations > 0
        ? Math.round((totalCompletions / totalParticipations) * 100)
        : 0;

    const averageCertificationRate =
      totalParticipations > 0
        ? Math.round((totalCertifications / totalParticipations) * 100)
        : 0;

    return {
      success: true,
      data: {
        totalSkills: vocationalSkillsSet.size + softSkillsSet.size,
        vocationalSkillsCount: vocationalSkillsSet.size,
        softSkillsCount: softSkillsSet.size,
        businessSkillsCount,
        totalParticipantsWithSkills: participantsWithSkills.size,
        averageCompletionRate,
        averageCertificationRate,
        topSkills,
      },
    };
  } catch (error) {
    console.error("Error getting skills metrics:", error);
    return {
      success: false,
      error: "Failed to get skills metrics",
    };
  }
}

/**
 * Get list of all skills with summary data
 */
export async function getSkillsSummary(
  clusterId?: string,
  skillType?: SkillType
): Promise<SkillsResponse<SkillSummary[]>> {
  try {
    const baseCondition = clusterId
      ? eq(participants.cluster_id, clusterId)
      : undefined;

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
      .from(participants)
      .where(baseCondition);

    // Map to track skill statistics
    const skillsMap = new Map<
      string,
      {
        skillType: SkillType;
        participants: Set<string>;
        participations: number;
        completions: number;
        certifications: number;
      }
    >();

    allParticipants.forEach(participant => {
      // Process vocational skills
      if (
        !skillType ||
        skillType === "vocational" ||
        skillType === "business"
      ) {
        (participant.vocationalSkillsParticipations || []).forEach(skill => {
          if (skill?.trim()) {
            const cleanSkill = skill.trim();
            if (!skillsMap.has(cleanSkill)) {
              skillsMap.set(cleanSkill, {
                skillType: "vocational",
                participants: new Set(),
                participations: 0,
                completions: 0,
                certifications: 0,
              });
            }
            const stats = skillsMap.get(cleanSkill)!;
            stats.participations++;
            stats.participants.add(JSON.stringify(participant));
          }
        });

        (participant.vocationalSkillsCompletions || []).forEach(skill => {
          if (skill?.trim()) {
            const cleanSkill = skill.trim();
            if (!skillsMap.has(cleanSkill)) {
              skillsMap.set(cleanSkill, {
                skillType: "vocational",
                participants: new Set(),
                participations: 0,
                completions: 0,
                certifications: 0,
              });
            }
            const stats = skillsMap.get(cleanSkill)!;
            stats.completions++;
            stats.participants.add(JSON.stringify(participant));
          }
        });

        (participant.vocationalSkillsCertifications || []).forEach(skill => {
          if (skill?.trim()) {
            const cleanSkill = skill.trim();
            if (!skillsMap.has(cleanSkill)) {
              skillsMap.set(cleanSkill, {
                skillType: "vocational",
                participants: new Set(),
                participations: 0,
                completions: 0,
                certifications: 0,
              });
            }
            const stats = skillsMap.get(cleanSkill)!;
            stats.certifications++;
            stats.participants.add(JSON.stringify(participant));
          }
        });
      }

      // Process soft skills
      if (!skillType || skillType === "soft") {
        (participant.softSkillsParticipations || []).forEach(skill => {
          if (skill?.trim()) {
            const cleanSkill = skill.trim();
            if (!skillsMap.has(cleanSkill)) {
              skillsMap.set(cleanSkill, {
                skillType: "soft",
                participants: new Set(),
                participations: 0,
                completions: 0,
                certifications: 0,
              });
            }
            const stats = skillsMap.get(cleanSkill)!;
            stats.participations++;
            stats.participants.add(JSON.stringify(participant));
          }
        });

        (participant.softSkillsCompletions || []).forEach(skill => {
          if (skill?.trim()) {
            const cleanSkill = skill.trim();
            if (!skillsMap.has(cleanSkill)) {
              skillsMap.set(cleanSkill, {
                skillType: "soft",
                participants: new Set(),
                participations: 0,
                completions: 0,
                certifications: 0,
              });
            }
            const stats = skillsMap.get(cleanSkill)!;
            stats.completions++;
            stats.participants.add(JSON.stringify(participant));
          }
        });

        (participant.softSkillsCertifications || []).forEach(skill => {
          if (skill?.trim()) {
            const cleanSkill = skill.trim();
            if (!skillsMap.has(cleanSkill)) {
              skillsMap.set(cleanSkill, {
                skillType: "soft",
                participants: new Set(),
                participations: 0,
                completions: 0,
                certifications: 0,
              });
            }
            const stats = skillsMap.get(cleanSkill)!;
            stats.certifications++;
            stats.participants.add(JSON.stringify(participant));
          }
        });
      }
    });

    // Convert to summary array
    const summaries: SkillSummary[] = Array.from(skillsMap.entries())
      .map(([skillName, stats]) => {
        const totalParticipants = stats.participants.size;
        const completionRate =
          stats.participations > 0
            ? Math.round((stats.completions / stats.participations) * 100)
            : 0;
        const certificationRate =
          stats.participations > 0
            ? Math.round((stats.certifications / stats.participations) * 100)
            : 0;

        return {
          skillName,
          skillType: stats.skillType,
          totalParticipants,
          participationsCount: stats.participations,
          completionsCount: stats.completions,
          certificationsCount: stats.certifications,
          completionRate,
          certificationRate,
        };
      })
      .filter(summary => {
        // Filter business skills
        if (skillType === "business") {
          const businessKeywords = [
            "business",
            "entrepreneur",
            "marketing",
            "accounting",
            "finance",
            "management",
          ];
          return businessKeywords.some(keyword =>
            summary.skillName.toLowerCase().includes(keyword)
          );
        }
        return true;
      })
      .sort((a, b) => b.totalParticipants - a.totalParticipants);

    return {
      success: true,
      data: summaries,
    };
  } catch (error) {
    console.error("Error getting skills summary:", error);
    return {
      success: false,
      error: "Failed to get skills summary",
    };
  }
}

/**
 * Get detailed information about a specific skill including participants
 */
export async function getSkillDetails(
  skillName: string,
  status?: SkillStatus,
  clusterId?: string
): Promise<SkillsResponse<SkillDetails>> {
  try {
    // Build WHERE conditions
    const conditions = [];
    if (clusterId) {
      conditions.push(eq(participants.cluster_id, clusterId));
    }

    // Build SQL for skill filtering based on status
    let skillCondition;
    if (status === "participation") {
      skillCondition = sql`(
        ${skillName} = ANY(${participants.vocationalSkillsParticipations}) OR
        ${skillName} = ANY(${participants.softSkillsParticipations})
      )`;
    } else if (status === "completion") {
      skillCondition = sql`(
        ${skillName} = ANY(${participants.vocationalSkillsCompletions}) OR
        ${skillName} = ANY(${participants.softSkillsCompletions})
      )`;
    } else if (status === "certification") {
      skillCondition = sql`(
        ${skillName} = ANY(${participants.vocationalSkillsCertifications}) OR
        ${skillName} = ANY(${participants.softSkillsCertifications})
      )`;
    } else {
      // All statuses
      skillCondition = sql`(
        ${skillName} = ANY(${participants.vocationalSkillsParticipations}) OR
        ${skillName} = ANY(${participants.vocationalSkillsCompletions}) OR
        ${skillName} = ANY(${participants.vocationalSkillsCertifications}) OR
        ${skillName} = ANY(${participants.softSkillsParticipations}) OR
        ${skillName} = ANY(${participants.softSkillsCompletions}) OR
        ${skillName} = ANY(${participants.softSkillsCertifications})
      )`;
    }

    conditions.push(skillCondition);

    // Query participants with the skill
    const participantsWithSkill = await db
      .select()
      .from(participants)
      .where(and(...conditions));

    // Enhance with skill status and name
    const enhancedParticipants: SkillParticipant[] = participantsWithSkill.map(
      participant => {
        let skillStatus: SkillStatus = "participation";

        // Determine highest skill status
        const hasCertification =
          participant.vocationalSkillsCertifications?.includes(skillName) ||
          participant.softSkillsCertifications?.includes(skillName);

        const hasCompletion =
          participant.vocationalSkillsCompletions?.includes(skillName) ||
          participant.softSkillsCompletions?.includes(skillName);

        if (hasCertification) {
          skillStatus = "certification";
        } else if (hasCompletion) {
          skillStatus = "completion";
        }

        return {
          ...participant,
          skillStatus,
          participantName: `${participant.firstName} ${participant.lastName}`,
        };
      }
    );

    // Calculate summary statistics
    const totalParticipants = enhancedParticipants.length;
    const participationsCount = enhancedParticipants.filter(
      p => p.skillStatus === "participation"
    ).length;
    const completionsCount = enhancedParticipants.filter(
      p => p.skillStatus === "completion"
    ).length;
    const certificationsCount = enhancedParticipants.filter(
      p => p.skillStatus === "certification"
    ).length;

    const completionRate =
      totalParticipants > 0
        ? Math.round((completionsCount / totalParticipants) * 100)
        : 0;
    const certificationRate =
      totalParticipants > 0
        ? Math.round((certificationsCount / totalParticipants) * 100)
        : 0;

    // Determine skill type
    const isVocational = enhancedParticipants.some(
      p =>
        p.vocationalSkillsParticipations?.includes(skillName) ||
        p.vocationalSkillsCompletions?.includes(skillName) ||
        p.vocationalSkillsCertifications?.includes(skillName)
    );

    const skillType: SkillType = isVocational ? "vocational" : "soft";

    return {
      success: true,
      data: {
        skillName,
        skillType,
        totalParticipants,
        participationsCount,
        completionsCount,
        certificationsCount,
        completionRate,
        certificationRate,
        participants: enhancedParticipants,
      },
    };
  } catch (error) {
    console.error("Error getting skill details:", error);
    return {
      success: false,
      error: "Failed to get skill details",
    };
  }
}
