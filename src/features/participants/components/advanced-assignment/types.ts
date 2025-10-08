export type AssignmentLevel = "subcounty" | "parish";

export interface SubCountyOption {
  id: string;
  name: string;
  selected: boolean;
}

export interface ParishOption {
  id: string;
  name: string;
  subCountyId: string;
  selected: boolean;
}

export interface OrganizationOption {
  id: string;
  name: string;
}

export interface AssignmentResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: {
    organizationName: string;
    totalSubCounties?: number;
    totalParishes?: number;
    totalParticipantsFound: number;
    totalParticipantsUpdated: number;
    results: Array<{
      subcounty?: string;
      parish?: string;
      participantsFound: number;
      participantsUpdated: number;
    }>;
  };
}

export interface AssignmentPreview {
  level: AssignmentLevel;
  organization: OrganizationOption;
  selectedItems: SubCountyOption[] | ParishOption[];
  totalItems: number;
}
