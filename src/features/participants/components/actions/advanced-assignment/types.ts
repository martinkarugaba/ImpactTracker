export type AssignmentLevel = "subcounty" | "parish";

export interface AdvancedAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subCounties: Array<{ id: string; name: string }>;
  parishes?: Array<{ id: string; name: string; subCountyId: string }>;
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

export interface ParishOption {
  id: string;
  name: string;
  subCountyId: string;
}
