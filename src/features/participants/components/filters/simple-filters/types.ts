import { type Participant } from "../../../types/types";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  values: FilterOption[];
}

export interface FilterGroups {
  quick: FilterGroup[];
  enterprise: FilterGroup[];
  skills: FilterGroup[];
  demographics: FilterGroup[];
  employment: FilterGroup[];
}

export interface SimpleParticipantFiltersProps {
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  districts?: Array<{ id: string; name: string }>;
  subCounties?: Array<{ id: string; name: string }>;
  participants?: Participant[];
}
