export interface Intervention {
  participantId: string;
  participantName: string;
  participantContact?: string | null;
  // If the participant attended multiple activities we may attach
  // an `activities` array and leave the single-activity fields
  // undefined. Consumers should prefer `activities` when present.
  activityId?: string;
  activityTitle?: string | null;
  skillCategory?: string | null;
  outcomes?: string[] | null;
  activities?: Array<{
    activityId: string;
    activityTitle?: string | null;
    skillCategory?: string | null;
    outcomes?: string[] | null;
    source: "activity_participants" | "session_attendance";
    attendedAt?: string | null;
  }>;
  source: "activity_participants" | "session_attendance";
  attendedAt?: string | null; // ISO date if available
}
