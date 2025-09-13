import { type InferSelectModel } from "drizzle-orm";
import {
  type activities,
  type activityParticipants,
  type conceptNotes,
  type activityReports,
  type activitySessions,
  type dailyAttendance,
} from "@/lib/db/schema";

export type Activity = InferSelectModel<typeof activities> & {
  organizationName?: string;
  projectName?: string;
  clusterName?: string;
  participantCount?: number;
};

export type ActivityParticipant = InferSelectModel<
  typeof activityParticipants
> & {
  participantName?: string;
  participantEmail?: string;
  participant?: {
    id: string;
    firstName: string;
    lastName: string;
    contact: string;
    designation: string;
    organizationName?: string;
  };
};

export type ConceptNote = InferSelectModel<typeof conceptNotes>;

export type NewConceptNote = Omit<
  ConceptNote,
  "id" | "created_at" | "updated_at"
>;

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
  // Session-based metrics for multi-day activities
  multiDayActivities: number;
  singleDayActivities: number;
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  averageSessionsPerActivity: number;
  averageActivityDuration: number;
  sessionCompletionRate: number;
  activitiesWithSessions: number;
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

// Activity Report Types from Database Schema
export type ActivityReport = InferSelectModel<typeof activityReports>;

export type NewActivityReport = Omit<
  ActivityReport,
  "id" | "created_at" | "updated_at"
>;

// Follow-up Action Types for UI
export type FollowUpAction = {
  id: string;
  action: string;
  responsiblePerson: string;
  timeline: string;
};

export type NewFollowUpAction = Omit<FollowUpAction, "id">;

// Activity Report Response Types
export type ActivityReportResponse = {
  success: boolean;
  data?: ActivityReport;
  error?: string;
};

export type ActivityReportsResponse = {
  success: boolean;
  data?: ActivityReport[];
  error?: string;
};

// Activity Sessions Types
export type ActivitySession = InferSelectModel<typeof activitySessions>;

export type NewActivitySession = Omit<
  ActivitySession,
  "id" | "created_at" | "updated_at"
>;

export type ActivitySessionResponse = {
  success: boolean;
  data?: ActivitySession;
  error?: string;
};

export type ActivitySessionsResponse = {
  success: boolean;
  data?: ActivitySession[];
  error?: string;
};

// Daily Attendance Types
export type DailyAttendance = InferSelectModel<typeof dailyAttendance> & {
  participantName?: string;
  participantEmail?: string;
  participant?: {
    id: string;
    firstName: string;
    lastName: string;
    contact: string;
    designation: string;
    organizationName?: string;
  };
  session?: {
    session_date: string;
    session_number: number;
    venue?: string | null;
  };
};

export type NewDailyAttendance = Omit<
  DailyAttendance,
  | "id"
  | "created_at"
  | "updated_at"
  | "participantName"
  | "participantEmail"
  | "participant"
  | "session"
>;

export type DailyAttendanceResponse = {
  success: boolean;
  data?: DailyAttendance;
  error?: string;
};

export type DailyAttendanceListResponse = {
  success: boolean;
  data?: DailyAttendance[];
  error?: string;
};

// Enhanced Activity Type with Sessions
export type ActivityWithSessions = Activity & {
  sessions?: ActivitySession[];
  totalSessions?: number;
  completedSessions?: number;
  upcomingSessions?: number;
};

// Session Attendance Summary
export type SessionAttendanceSummary = {
  sessionId: string;
  sessionDate: string;
  sessionNumber: number;
  totalParticipants: number;
  attended: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
};

// Activity Attendance Overview
export type ActivityAttendanceOverview = {
  activityId: string;
  totalParticipants: number;
  totalSessions: number;
  overallAttendanceRate: number;
  sessionSummaries: SessionAttendanceSummary[];
  participantAttendanceRates: Array<{
    participantId: string;
    participantName: string;
    sessionsAttended: number;
    totalSessions: number;
    attendanceRate: number;
  }>;
};

// Session Status Types
export const SESSION_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "postponed",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

// Daily Attendance Status Types (extending existing ATTENDANCE_STATUSES)
export const DAILY_ATTENDANCE_STATUSES = [
  "invited",
  "attended",
  "absent",
  "late",
  "excused",
] as const;

export type DailyAttendanceStatus = (typeof DAILY_ATTENDANCE_STATUSES)[number];
