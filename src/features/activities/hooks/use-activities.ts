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
import {
  getActivityParticipants,
  addActivityParticipants,
  bulkUpdateActivityParticipants,
} from "../actions/participants";
import { type NewActivity } from "../types/types";

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
