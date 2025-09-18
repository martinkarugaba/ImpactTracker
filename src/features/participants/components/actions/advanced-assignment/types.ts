export interface AdvancedAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subCounties: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
}

export interface OrganizationOption {
  id: string;
  name: string;
  acronym?: string;
}

export interface SubCountyOption {
  id: string;
  name: string;
}

export interface AssignmentResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: {
    totalParticipantsUpdated: number;
    totalParticipantsFound: number;
    totalSubCounties: number;
    organizationName: string;
    results: Array<{
      subCounty: string;
      participantsFound: number;
      participantsUpdated: number;
    }>;
  };
}
