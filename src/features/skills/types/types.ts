import type { Participant } from "@/features/participants/types/types";

export type SkillType = "vocational" | "soft" | "business";

export type SkillStatus = "participation" | "completion" | "certification";

export interface SkillSummary {
  skillName: string;
  skillType: SkillType;
  totalParticipants: number;
  participationsCount: number;
  completionsCount: number;
  certificationsCount: number;
  completionRate: number; // percentage
  certificationRate: number; // percentage
}

export interface SkillDetails extends SkillSummary {
  participants: SkillParticipant[];
}

export interface SkillParticipant extends Participant {
  skillStatus: SkillStatus; // participation, completion, or certification
  participantName: string;
}

export interface SkillsMetrics {
  totalSkills: number;
  vocationalSkillsCount: number;
  softSkillsCount: number;
  businessSkillsCount: number;
  totalParticipantsWithSkills: number;
  averageCompletionRate: number;
  averageCertificationRate: number;
  topSkills: Array<{
    skillName: string;
    skillType: SkillType;
    participantCount: number;
  }>;
}

export interface SkillsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
