export type Training = {
  id: string;
  name: string;
  description: string | null;
  conceptNote: string | null;
  activityReport: string | null;
  trainingDate: Date;
  venue: string;
  status: string;
  numberOfParticipants: number;
  budget: number | null;
  organization_id: string;
  cluster_id: string;
  project_id: string;
  created_at: Date;
  updated_at: Date;
};

export type NewTraining = Omit<
  Training,
  "id" | "created_at" | "updated_at" | "numberOfParticipants"
>;

export type TrainingParticipant = {
  id: string;
  training_id: string;
  participant_id: string;
  attendance_status: string;
  created_at: Date;
  updated_at: Date;
};

export type TrainingResponse = {
  success: boolean;
  data?: Training;
  error?: string;
};

export type TrainingsResponse = {
  success: boolean;
  data?: Training[];
  error?: string;
};

export type TrainingParticipantResponse = {
  success: boolean;
  data?: TrainingParticipant;
  error?: string;
};
