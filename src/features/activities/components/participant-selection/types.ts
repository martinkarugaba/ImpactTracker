import { type Participant } from "@/features/participants/types/types";

export interface ParticipantSelectionActivity {
  cluster_id: string;
  project_id: string;
  organization_id: string;
}

export interface ParticipantSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParticipantsSelected: (participants: Participant[]) => void;
  activity?: ParticipantSelectionActivity;
}

export interface ParticipantCardProps {
  participant: Participant;
  isSelected: boolean;
  onToggle: (participant: Participant, checked: boolean) => void;
}

export interface ParticipantListProps {
  participants: Participant[];
  selectedParticipants: Participant[];
  onParticipantToggle: (participant: Participant, checked: boolean) => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

export interface SelectedParticipantsSectionProps {
  selectedParticipants: Participant[];
  onClearAll: () => void;
}

export interface ParticipantSearchFormProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
}
