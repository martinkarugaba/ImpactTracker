export type AssignmentLevel = "subcounty" | "parish";

export type SubCountyOption = {
  id: string;
  name: string;
  selected: boolean;
};

export type ParishOption = {
  id: string;
  name: string;
  subCountyId: string;
  selected: boolean;
};

export type OrganizationOption = {
  id: string;
  name: string;
};

export type AssignmentResult = {
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
};

export type AssignmentPreview = {
  level: AssignmentLevel;
  organization: OrganizationOption;
  selectedItems: SubCountyOption[] | ParishOption[];
  totalItems: number;
};
