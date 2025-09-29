/**
 * Optimized React Query Hooks for Activities
 *
 * Enhanced hooks with better caching strategies, stale times,
 * keepPreviousData, and query invalidation patterns for improved UX.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActivitiesOptimized,
  getActivityDetailsOptimized,
  getAllActivitiesForExportOptimized,
  getActivitiesMetricsOptimized,
  createActivity,
  updateActivity,
  deleteActivity,
  type GetActivitiesOptimizedParams,
} from "../actions/optimized";

// Query keys for consistent cache management
export const activitiesQueryKeys = {
  all: ["activities"] as const,
  lists: () => [...activitiesQueryKeys.all, "list"] as const,
  list: (clusterId?: string, params?: GetActivitiesOptimizedParams) =>
    [...activitiesQueryKeys.lists(), { clusterId, ...params }] as const,
  details: () => [...activitiesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...activitiesQueryKeys.details(), id] as const,
  exports: () => [...activitiesQueryKeys.all, "export"] as const,
  export: (
    clusterId: string,
    filters?: GetActivitiesOptimizedParams["filters"],
    search?: string
  ) =>
    [...activitiesQueryKeys.exports(), { clusterId, filters, search }] as const,
  metrics: () => [...activitiesQueryKeys.all, "metrics"] as const,
  metric: (clusterId: string) =>
    [...activitiesQueryKeys.metrics(), clusterId] as const,
};

// Optimized activities list hook
export function useActivitiesOptimized(
  clusterId?: string,
  params: GetActivitiesOptimizedParams = {}
) {
  return useQuery({
    queryKey: activitiesQueryKeys.list(clusterId, params),
    queryFn: () => getActivitiesOptimized(clusterId, params),
    enabled: !!clusterId, // Only run when clusterId is available

    // Performance optimizations
    staleTime: 3 * 60 * 1000, // 3 minutes - activities change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer

    // UX improvements
    placeholderData: previousData => previousData, // Show previous data while loading new
    refetchOnWindowFocus: false, // Don't refetch on every focus
    refetchOnMount: false, // Use cached data if available

    // Retry configuration
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = String(error.message).toLowerCase();
        if (
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("forbidden")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Transform data for better UI
    select: data => {
      if (!data.success) return data;

      return {
        ...data,
        data: data.data
          ? {
              ...data.data,
              data: data.data.data.map(activity => ({
                ...activity,
                // Add computed properties
                statusDisplay: activity.status
                  ? activity.status.charAt(0).toUpperCase() +
                    activity.status.slice(1)
                  : "Unknown",
                dateRange:
                  activity.startDate && activity.endDate
                    ? `${activity.startDate.toLocaleDateString()} - ${activity.endDate.toLocaleDateString()}`
                    : activity.startDate
                      ? `From ${activity.startDate.toLocaleDateString()}`
                      : "Date TBD",
                participantSummary: `${(activity as Record<string, unknown>).totalParticipants || 0} participants (${(activity as Record<string, unknown>).uniqueParticipants || 0} unique)`,
                sessionSummary: `${(activity as Record<string, unknown>).sessionCount || 0} sessions`,
              })),
            }
          : undefined,
      };
    },

    throwOnError: false,
  });
}

// Optimized activity details hook
export function useActivityDetailsOptimized(
  activityId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: activitiesQueryKeys.detail(activityId),
    queryFn: () => getActivityDetailsOptimized(activityId),
    enabled: enabled && !!activityId,

    // Details-specific optimizations
    staleTime: 2 * 60 * 1000, // 2 minutes - details can be more dynamic
    gcTime: 15 * 60 * 1000, // Keep details in cache longer
    refetchOnWindowFocus: false,

    // Transform for better UI
    select: data => {
      if (!data.success) return data;

      const activity = data.data;
      if (!activity) return data;

      return {
        ...data,
        data: {
          ...activity,
          // Add computed properties
          durationDisplay: (activity as Record<string, unknown>).duration
            ? `${(activity as Record<string, unknown>).duration} hours`
            : "Not specified",
          sessionsWithNumbers:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((activity as any).sessions as any[])?.map(
              (session: Record<string, unknown>, index: number) => ({
                ...session,
                displayNumber: session.sessionNumber || index + 1,
                dateDisplay:
                  (session.sessionDate as Date)?.toLocaleDateString() ||
                  "Date TBD",
                timeDisplay:
                  session.startTime && session.endTime
                    ? `${session.startTime} - ${session.endTime}`
                    : "Time TBD",
              })
            ) || [],
          statsDisplay: {
            totalParticipants:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((activity as any).stats?.totalParticipants as number) || 0,
            uniqueParticipants:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((activity as any).stats?.uniqueParticipants as number) || 0,
            totalSessions:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((activity as any).stats?.totalSessions as number) || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            averageAttendance: (activity as any).stats?.totalSessions
              ? Math.round(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (((activity as any).stats.totalParticipants /
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (activity as any).stats.totalSessions) *
                    100) /
                    100
                )
              : 0,
          },
        },
      };
    },
  });
}

// Optimized activities export hook
export function useActivitiesExportOptimized(
  clusterId: string,
  filters?: GetActivitiesOptimizedParams["filters"],
  search?: string,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: activitiesQueryKeys.export(clusterId, filters, search),
    queryFn: () =>
      getAllActivitiesForExportOptimized(clusterId, filters, search),
    enabled: enabled && !!clusterId,

    // Export-specific settings
    staleTime: 0, // Always fresh for exports
    gcTime: 2 * 60 * 1000, // Short cache time for exports
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Limited retries for large exports

    throwOnError: true, // Throw errors for export failures
  });
}

// Optimized activities metrics hook
export function useActivitiesMetricsOptimized(clusterId: string) {
  return useQuery({
    queryKey: activitiesQueryKeys.metric(clusterId),
    queryFn: () => getActivitiesMetricsOptimized(clusterId),
    enabled: !!clusterId,

    // Metrics-specific optimizations
    staleTime: 3 * 60 * 1000, // 3 minutes - activity metrics can be slightly stale
    gcTime: 15 * 60 * 1000, // Keep metrics in cache longer
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes

    // Transform for metrics calculations
    select: data => {
      if (!data.success || !data.data?.data) return data;

      const activities = data.data.data;
      const now = new Date();

      const metrics = {
        total: activities.length,
        byStatus: {
          active: activities.filter(a => a.status === "active").length,
          completed: activities.filter(a => a.status === "completed").length,
          planned: activities.filter(a => a.status === "planned").length,
          cancelled: activities.filter(a => a.status === "cancelled").length,
        },
        byCategory: activities.reduce(
          (
            acc: Record<string, number>,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activity: any
          ) => {
            const category =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (activity as any).category || activity.type || "uncategorized";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        byTimeframe: {
          upcoming: activities.filter(
            a => a.startDate && new Date(a.startDate) > now
          ).length,
          ongoing: activities.filter(
            a =>
              a.startDate &&
              a.endDate &&
              new Date(a.startDate) <= now &&
              new Date(a.endDate) >= now
          ).length,
          past: activities.filter(a => a.endDate && new Date(a.endDate) < now)
            .length,
        },
        averageDuration:
          activities.reduce(
            (sum, a) =>
              sum + (((a as Record<string, unknown>).duration as number) || 0),
            0
          ) /
          (activities.filter(a => (a as Record<string, unknown>).duration)
            .length || 1),
      };

      return {
        ...data,
        metrics,
      };
    },
  });
}

// Optimized create activity mutation
export function useCreateActivityOptimized(_clusterId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,

    // Optimistic updates
    onMutate: async newActivity => {
      await queryClient.cancelQueries({
        queryKey: activitiesQueryKeys.lists(),
      });

      const previousActivities = queryClient.getQueriesData({
        queryKey: activitiesQueryKeys.lists(),
      });

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: activitiesQueryKeys.lists() },
        (old: unknown) => {
          const _oldData = old as Record<string, unknown>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldData = old as any;
          if (!oldData?.success || !oldData?.data?.data) return old;

          const optimisticActivity = {
            ...newActivity,
            id: `temp-${Date.now()}`,
            created_at: new Date(),
            updated_at: new Date(),
            sessionsWithNumbers: [],
            statsDisplay: {
              totalParticipants: 0,
              uniqueParticipants: 0,
              totalSessions: 0,
              averageAttendance: 0,
            },
          };

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [optimisticActivity, ...oldData.data.data],
              pagination: {
                ...oldData.data.pagination,
                total: oldData.data.pagination.total + 1,
              },
            },
          };
        }
      );

      return { previousActivities };
    },

    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: activitiesQueryKeys.metrics(),
      });
      console.log("✅ Activity created successfully");
    },

    onError: (error, variables, context) => {
      if (context?.previousActivities) {
        context.previousActivities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("❌ Failed to create activity:", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
    },
  });
}

// Optimized update activity mutation
export function useUpdateActivityOptimized(_clusterId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateActivity(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: activitiesQueryKeys.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: activitiesQueryKeys.detail(id),
      });

      const previousData = queryClient.getQueriesData({
        queryKey: activitiesQueryKeys.all,
      });

      // Update list queries
      queryClient.setQueriesData(
        { queryKey: activitiesQueryKeys.lists() },
        (old: unknown) => {
          const oldData = old as Record<string, unknown>;
          if (!oldData?.success || !oldData?.data) return old;

          return {
            ...oldData,
            data: {
              ...(oldData.data as Record<string, unknown>),
              data: (
                (oldData.data as Record<string, unknown>).data as Array<
                  Record<string, unknown>
                >
              ).map((activity: Record<string, unknown>) =>
                activity.id === id
                  ? { ...activity, ...data, updated_at: new Date() }
                  : activity
              ),
            },
          };
        }
      );

      // Update detail query
      queryClient.setQueryData(
        activitiesQueryKeys.detail(id),
        (old: unknown) => {
          const oldData = old as Record<string, unknown>;
          if (!oldData?.success || !oldData?.data) return old;
          return {
            ...oldData,
            data: { ...oldData.data, ...data, updated_at: new Date() },
          };
        }
      );

      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: activitiesQueryKeys.metrics(),
      });
      console.log("✅ Activity updated successfully");
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("❌ Failed to update activity:", error);
    },
  });
}

// Optimized delete activity mutation
export function useDeleteActivityOptimized(_clusterId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,

    onMutate: async activityId => {
      await queryClient.cancelQueries({
        queryKey: activitiesQueryKeys.lists(),
      });

      const previousData = queryClient.getQueriesData({
        queryKey: activitiesQueryKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: activitiesQueryKeys.lists() },
        (old: unknown) => {
          const oldData = old as Record<string, unknown>;
          if (!oldData?.success || !oldData?.data) return old;

          return {
            ...oldData,
            data: {
              ...(oldData.data as Record<string, unknown>),
              data: (
                (oldData.data as Record<string, unknown>).data as Array<
                  Record<string, unknown>
                >
              ).filter((a: Record<string, unknown>) => a.id !== activityId),
              pagination: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(oldData.data as any).pagination,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                total: Math.max(0, (oldData.data as any).pagination.total - 1),
              },
            },
          };
        }
      );

      // Remove detail query
      queryClient.removeQueries({
        queryKey: activitiesQueryKeys.detail(activityId),
      });

      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: activitiesQueryKeys.metrics(),
      });
      console.log("✅ Activity deleted successfully");
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("❌ Failed to delete activity:", error);
    },
  });
}

// Cache management utilities
export const activitiesCacheUtils = {
  // Prefetch activities for better UX
  prefetchActivities: (
    queryClient: ReturnType<typeof useQueryClient>,
    clusterId: string,
    params?: GetActivitiesOptimizedParams
  ) => {
    return queryClient.prefetchQuery({
      queryKey: activitiesQueryKeys.list(clusterId, params),
      queryFn: () => getActivitiesOptimized(clusterId, params),
      staleTime: 3 * 60 * 1000,
    });
  },

  // Prefetch activity details
  prefetchActivityDetails: (
    queryClient: ReturnType<typeof useQueryClient>,
    activityId: string
  ) => {
    return queryClient.prefetchQuery({
      queryKey: activitiesQueryKeys.detail(activityId),
      queryFn: () => getActivityDetailsOptimized(activityId),
      staleTime: 2 * 60 * 1000,
    });
  },

  // Clear all activities cache
  clearActivitiesCache: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.removeQueries({ queryKey: activitiesQueryKeys.all });
  },

  // Invalidate specific cluster data
  invalidateClusterActivities: (
    queryClient: ReturnType<typeof useQueryClient>,
    clusterId: string
  ) => {
    queryClient.invalidateQueries({
      queryKey: activitiesQueryKeys.lists(),
      predicate: query => {
        const key = query.queryKey as readonly unknown[];
        return key.some(
          (part: unknown) =>
            typeof part === "object" &&
            part !== null &&
            "clusterId" in part &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (part as any).clusterId === clusterId
        );
      },
    });
  },

  // Invalidate activity and related data after session changes
  invalidateActivitySessions: (
    queryClient: ReturnType<typeof useQueryClient>,
    activityId: string
  ) => {
    queryClient.invalidateQueries({
      queryKey: activitiesQueryKeys.detail(activityId),
    });
    queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
  },
};
