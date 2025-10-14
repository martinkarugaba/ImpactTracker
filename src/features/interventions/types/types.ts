export interface Intervention {
  participantId: string;
  participantName: string;
  participantContact?: string | null;
  activityId: string;
  activityTitle?: string | null;
  skillCategory?: string | null;
  outcomes?: string[] | null;
  source: "activity_participants" | "session_attendance";
  attendedAt?: string | null; // ISO date if available
}
