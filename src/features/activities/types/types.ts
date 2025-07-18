import { type InferSelectModel } from "drizzle-orm";
import {
  type activities,
  type activityParticipants,
  type conceptNotes,
} from "@/lib/db/schema";

export type ConceptNote = InferSelectModel<typeof conceptNotes>;

export type NewConceptNote = Omit<
  ConceptNote,
  "id" | "created_at" | "updated_at"
>;

export type BudgetItem = {
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type ConceptNoteResponse = {
  success: boolean;
  data?: ConceptNote;
  error?: string;
};

export type Activity = InferSelectModel<typeof activities> & {
  organizationName?: string;
  projectName?: string;
  clusterName?: string;
  participantCount?: number;
  // Additional fields for enhanced functionality
  conceptNote?: ConceptNote | null; // Updated to allow null
  activityReport?: string;
  attendanceCount?: number;
  attendanceList?: AttendanceRecord[];
};

export type AttendanceRecord = {
  id: string;
  name: string;
  email: string;
  attended: boolean;
  role?: string;
  organization?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
};

export type ActivityParticipant = InferSelectModel<
  typeof activityParticipants
> & {
  participantName?: string;
  participantEmail?: string;
};

export type NewActivity = Omit<
  Activity,
  | "id"
  | "created_at"
  | "updated_at"
  | "organizationName"
  | "projectName"
  | "clusterName"
  | "participantCount"
>;

export type ActivityResponse = {
  success: boolean;
  data?: Activity;
  error?: string;
};

export type PaginatedActivitiesResponse = {
  success: boolean;
  data?: {
    data: Activity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
};

export type ActivitiesResponse = PaginatedActivitiesResponse;

export type ActivityFilters = {
  search?: string;
  type?: string;
  status?: string;
  organizationId?: string;
  clusterId?: string;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
};

export type ActivityMetrics = {
  totalActivities: number;
  activeActivities: number;
  completedActivities: number;
  ongoingActivities: number;
  plannedActivities: number;
  totalParticipants: number;
  thisMonth: number;
  nextMonth: number;
  totalBudget: number;
  overdue: number;
  actualSpent: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
};

export type ActivityMetricsResponse = {
  success: boolean;
  data?: ActivityMetrics;
  error?: string;
};

export const ACTIVITY_TYPES = [
  "meeting",
  "workshop",
  "training",
  "field_visit",
  "conference",
  "seminar",
  "consultation",
  "assessment",
  "monitoring",
  "evaluation",
  "community_engagement",
  "capacity_building",
  "advocacy",
  "research",
  "other",
] as const;

export const ACTIVITY_STATUSES = [
  "planned",
  "ongoing",
  "completed",
  "cancelled",
  "postponed",
] as const;

export const ATTENDANCE_STATUSES = [
  "invited",
  "confirmed",
  "attended",
  "absent",
  "cancelled",
] as const;

export const PARTICIPANT_ROLES = [
  "participant",
  "facilitator",
  "organizer",
  "observer",
  "speaker",
  "moderator",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];
