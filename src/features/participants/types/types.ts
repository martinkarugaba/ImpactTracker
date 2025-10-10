import { type InferSelectModel } from "drizzle-orm";
import { type participants } from "@/lib/db/schema";

export type Participant = InferSelectModel<typeof participants> & {
  organizationName?: string;
  projectName?: string;
  projectAcronym?: string;
  clusterName?: string;
  districtName?: string;
  subCountyName?: string;
  countyName?: string;
};

export type NewParticipant = Omit<
  Participant,
  | "id"
  | "created_at"
  | "updated_at"
  | "organizationName"
  | "projectName"
  | "clusterName"
>;

export interface ParticipantResponse {
  success: boolean;
  data?: Participant;
  error?: string;
}

export interface PaginatedParticipantsResponse {
  success: boolean;
  data?: {
    data: Participant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

export type ParticipantsResponse = PaginatedParticipantsResponse;

export interface CountResult {
  count: number;
}

export interface ParticipantMetrics {
  totalParticipants: number;
  totalFemales: number;
  femalesYouth: number;
  femalesOlder: number;
  totalMales: number;
  malesYouth: number;
  malesOlder: number;
  totalPWD: number;
  pwdMale: number;
  pwdFemale: number;
}

export interface ParticipantMetricsResponse {
  success: boolean;
  data?: ParticipantMetrics;
  error?: string;
}

export interface ParticipantFilters {
  search: string;
  project: string;
  organization: string;
  district: string;
  subCounty: string;
  county: string;
  parish: string;
  village: string;
  enterprise: string;
  sex: string;
  isPWD: string;
  ageGroup: string;
  // New filter fields
  maritalStatus: string;
  educationLevel: string;
  isSubscribedToVSLA: string;
  ownsEnterprise: string;
  employmentStatus: string;
  employmentSector: string;
  hasVocationalSkills: string;
  hasSoftSkills: string;
  hasBusinessSkills: string;
  // Specific skill filters
  specificVocationalSkill: string;
  specificSoftSkill: string;
  specificBusinessSkill: string;
  populationSegment: string;
  isActiveStudent: string;
  isTeenMother: string;
  sourceOfIncome: string;
  // Enterprise specific filters
  enterpriseSector: string;
  businessScale: string;
  // Additional demographic filters
  nationality: string;
  locationSetting: string;
  isRefugee: string;
  isMother: string;
  // Phase 1 Enhanced Filters
  monthlyIncomeRange: string;
  numberOfChildrenRange: string;
  noOfTrainingsRange: string;
  employmentType: string;
  accessedLoans: string;
  individualSaving: string;
  groupSaving: string;
}
