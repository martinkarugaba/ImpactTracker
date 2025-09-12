"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityMetrics,
} from "../actions";
// Import session actions directly
import {
  getActivitySessions,
  getActivitySession,
  createActivitySession,
  updateActivitySession,
  generateActivitySessions,
} from "../actions/sessions";
// Import attendance actions directly
import {
  getSessionAttendance,
  markAttendance,
  getActivityAttendanceSummary,
} from "../actions/attendance";
import {
  getActivityParticipants,
  addActivityParticipants,
  bulkUpdateActivityParticipants,
} from "../actions/participants";
import {
  type NewActivity,
  type NewActivitySession,
  type DailyAttendanceStatus,
} from "../types/types";

export function useActivities(
  clusterId?: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      type?: string;
      status?: string;
      organization?: string;
      project?: string;
      dateFrom?: string;
      dateTo?: string;
    };
  }
) {
  return useQuery({
    queryKey: [
      "activities",
      clusterId,
      params?.page,
      params?.limit,
      params?.search,
      JSON.stringify(params?.filters),
    ],
    queryFn: () => getActivities(clusterId, params),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: () => getActivity(id),
    enabled: !!id,
  });
}

export function useActivityMetrics(clusterId?: string) {
  return useQuery({
    queryKey: ["activity-metrics", clusterId],
    queryFn: () => getActivityMetrics(clusterId),
  });
}

export function useActivityParticipants(activityId: string) {
  return useQuery({
    queryKey: ["activity-participants", activityId],
    queryFn: () => getActivityParticipants(activityId),
    enabled: !!activityId,
  });
}

export function useAddActivityParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      participants,
    }: {
      activityId: string;
      participants: Parameters<typeof addActivityParticipants>[1];
    }) => addActivityParticipants(activityId, participants),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activity-participants", variables.activityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity", variables.activityId],
      });
    },
  });
}

export function useUpdateActivityParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      participants,
    }: {
      activityId: string;
      participants: Parameters<typeof bulkUpdateActivityParticipants>[1];
    }) => bulkUpdateActivityParticipants(activityId, participants),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activity-participants", variables.activityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity", variables.activityId],
      });
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewActivity) => createActivity(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-metrics"],
      });
      if (variables.cluster_id) {
        queryClient.invalidateQueries({
          queryKey: ["activities", variables.cluster_id],
        });
      }
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewActivity> }) =>
      updateActivity(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-participants", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-metrics"],
      });
      if (result.data?.cluster_id) {
        queryClient.invalidateQueries({
          queryKey: ["activities", result.data.cluster_id],
        });
      }
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteActivity(id),
    onSuccess: result => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-metrics"],
      });
      if (result.data?.cluster_id) {
        queryClient.invalidateQueries({
          queryKey: ["activities", result.data.cluster_id],
        });
      }
    },
  });
}

// ========================================
// Session Management Hooks
// ========================================

export function useActivitySessions(activityId: string) {
  return useQuery({
    queryKey: ["activity-sessions", activityId],
    queryFn: () => getActivitySessions(activityId),
    enabled: !!activityId,
  });
}

export function useActivitySession(sessionId: string) {
  return useQuery({
    queryKey: ["activity-session", sessionId],
    queryFn: () => getActivitySession(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateActivitySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivitySession,
    onSuccess: result => {
      if (result.success && result.data) {
        queryClient.invalidateQueries({
          queryKey: ["activity-sessions", result.data.activity_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["activity", result.data.activity_id],
        });
      }
    },
  });
}

export function useUpdateActivitySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<NewActivitySession>;
    }) => updateActivitySession(id, data),
    onSuccess: (result, variables) => {
      if (result.success && result.data) {
        queryClient.invalidateQueries({
          queryKey: ["activity-session", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["activity-sessions", result.data.activity_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["activity", result.data.activity_id],
        });
      }
    },
  });
}

export function useGenerateActivitySessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      startDate,
      endDate,
      sessionData,
    }: {
      activityId: string;
      startDate: Date;
      endDate: Date;
      sessionData?: {
        start_time?: string;
        end_time?: string;
        venue?: string;
      };
    }) => generateActivitySessions(activityId, startDate, endDate, sessionData),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ["activity-sessions", variables.activityId],
        });
        queryClient.invalidateQueries({
          queryKey: ["activity", variables.activityId],
        });
      }
    },
  });
}

// ========================================
// Attendance Management Hooks
// ========================================

export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ["session-attendance", sessionId],
    queryFn: () => getSessionAttendance(sessionId),
    enabled: !!sessionId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      participantId,
      attendanceData,
    }: {
      sessionId: string;
      participantId: string;
      attendanceData: {
        attendance_status: DailyAttendanceStatus;
        check_in_time?: Date;
        check_out_time?: Date;
        notes?: string;
        recorded_by?: string;
      };
    }) => markAttendance(sessionId, participantId, attendanceData),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ["session-attendance", variables.sessionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["activity-attendance-summary"],
        });
      }
    },
  });
}

export function useActivityAttendanceSummary(activityId: string) {
  return useQuery({
    queryKey: ["activity-attendance-summary", activityId],
    queryFn: () => getActivityAttendanceSummary(activityId),
    enabled: !!activityId,
  });
}
