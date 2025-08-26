import { type Project } from "@/features/projects/types";

export interface ClusterWithOrganizations {
  id: string;
  name: string;
  organizations?: { id: string; name: string }[];
}

export interface ParticipantFilters {
  cluster: string;
  project: string;
  district: string;
  sex: string;
  isPWD: string;
  ageGroup?: string;
}

export interface QueryParams {
  page: number;
  limit: number;
  search: string;
  filters: {
    project: string;
    district: string;
    sex: string;
    isPWD: string;
    ageGroup?: string;
  };
}

export interface ParticipantSubmitData {
  id?: string;
  firstName: string;
  lastName: string;
  country: string;
  district: string;
  subCounty: string;
  parish: string;
  village: string;
  sex: "male" | "female" | "other";
  age?: string;
  dateOfBirth?: string;
  isPWD: "yes" | "no";
  isMother: "yes" | "no";
  isRefugee: "yes" | "no";
  designation: string;
  enterprise: string;
  contact: string;
  project_id: string;
  cluster_id: string;
  organization_id: string;
  noOfTrainings: string;
  isActive: "yes" | "no";
  isPermanentResident: "yes" | "no";
  areParentsAlive: "yes" | "no";
  numberOfChildren: string;
  employmentStatus: string;
  monthlyIncome: string;
  mainChallenge?: string;
  skillOfInterest?: string;
  expectedImpact?: string;
  isWillingToParticipate: "yes" | "no";
}

export interface ParticipantContainerProps {
  clusterId: string;
  projects: Project[];
  clusters: ClusterWithOrganizations[];
  searchParams?: {
    page?: number;
    per_page?: number;
    search?: string;
    project?: string;
    district?: string;
    sex?: string;
    isPWD?: string;
    ageGroup?: string;
  };
}
