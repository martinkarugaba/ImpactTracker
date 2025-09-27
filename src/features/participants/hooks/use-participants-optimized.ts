/**
 * Optimized React Query Hooks for Participants
 *
 * Enhanced hooks with better caching strategies, stale times,
 * keepPreviousData, and query invalidation patterns for improved UX.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getParticipantsOptimized,
  getAllFilteredParticipantsForExportOptimized,
  getAllParticipantsForMetricsOptimized,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  type GetParticipantsOptimizedParams,
} from "../actions/optimized";

// Query keys for consistent cache management
export const participantsQueryKeys = {
  all: ["participants"] as const,
  lists: () => [...participantsQueryKeys.all, "list"] as const,
  list: (clusterId?: string, params?: GetParticipantsOptimizedParams) =>
    [...participantsQueryKeys.lists(), { clusterId, ...params }] as const,
  details: () => [...participantsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...participantsQueryKeys.details(), id] as const,
  exports: () => [...participantsQueryKeys.all, "export"] as const,
  export: (
    clusterId: string,
    filters?: GetParticipantsOptimizedParams["filters"],
    search?: string
  ) =>
    [
      ...participantsQueryKeys.exports(),
      { clusterId, filters, search },
    ] as const,
  metrics: () => [...participantsQueryKeys.all, "metrics"] as const,
  metric: (clusterId: string) =>
    [...participantsQueryKeys.metrics(), clusterId] as const,
};

// Optimized participants list hook
export function useParticipantsOptimized(
  clusterId?: string,
  params: GetParticipantsOptimizedParams = {}
) {
  return useQuery({
    queryKey: participantsQueryKeys.list(clusterId, params),
    queryFn: () => getParticipantsOptimized(clusterId, params),
    enabled: !!clusterId, // Only run when clusterId is available

    // Performance optimizations
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer

    // UX improvements
    placeholderData: previousData => previousData, // Show previous data while loading new
    refetchOnWindowFocus: false, // Don't refetch on every focus
    refetchOnMount: false, // Use cached data if available

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = String(error.message).toLowerCase();
        if (
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("forbidden")
        ) {
          return false;
        }
      }
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Transform data for better TypeScript support
    select: data => {
      if (!data.success) return data;

      return {
        ...data,
        data: data.data
          ? {
              ...data.data,
              // Add computed properties for better UX
              data: data.data.data.map(participant => ({
                ...participant,
                fullName: `${participant.firstName} ${participant.lastName}`,
                ageDisplay: participant.age
                  ? `${participant.age} years`
                  : "Unknown",
                locationDisplay: `${participant.district || "Unknown"}, ${participant.subCounty || "Unknown"}`,
              })),
            }
          : undefined,
      };
    },

    // Error handling
    throwOnError: false, // Handle errors in components
  });
}

// Optimized participants export hook
export function useParticipantsExportOptimized(
  clusterId: string,
  filters?: GetParticipantsOptimizedParams["filters"],
  search?: string,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: participantsQueryKeys.export(clusterId, filters, search),
    queryFn: () =>
      getAllFilteredParticipantsForExportOptimized(clusterId, filters, search),
    enabled: enabled && !!clusterId,

    // Export-specific settings
    staleTime: 0, // Always fresh for exports
    gcTime: 2 * 60 * 1000, // Short cache time for exports
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Limited retries for large exports

    // Handle large datasets
    throwOnError: true, // Throw errors for export failures
  });
}

// Optimized participants metrics hook
export function useParticipantsMetricsOptimized(clusterId: string) {
  return useQuery({
    queryKey: participantsQueryKeys.metric(clusterId),
    queryFn: () => getAllParticipantsForMetricsOptimized(clusterId),
    enabled: !!clusterId,

    // Metrics-specific optimizations
    staleTime: 2 * 60 * 1000, // 2 minutes - metrics can be slightly stale
    gcTime: 15 * 60 * 1000, // Keep metrics in cache longer
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes

    // Transform for metrics calculations
    select: data => {
      if (!data.success || !data.data?.data) return data;

      const participants = data.data.data;
      const metrics = {
        total: participants.length,
        byGender: {
          male: participants.filter(p => p.sex === "male").length,
          female: participants.filter(p => p.sex === "female").length,
          other: participants.filter(
            p => p.sex && !["male", "female"].includes(p.sex)
          ).length,
        },
        byEmployment: {
          employed: participants.filter(p => p.employmentStatus === "employed")
            .length,
          unemployed: participants.filter(
            p => p.employmentStatus === "unemployed"
          ).length,
          selfEmployed: participants.filter(
            p => p.employmentStatus === "self-employed"
          ).length,
        },
        bySkills: {
          hasVocational: participants.filter(
            p => p.hasVocationalSkills === "yes"
          ).length,
          hasSoft: participants.filter(p => p.hasSoftSkills === "yes").length,
          hasBusiness: participants.filter(p => p.hasBusinessSkills === "yes")
            .length,
        },
        byVSLA: {
          subscribed: participants.filter(p => p.isSubscribedToVSLA === "yes")
            .length,
          notSubscribed: participants.filter(p => p.isSubscribedToVSLA === "no")
            .length,
        },
        byEnterprise: {
          owns: participants.filter(p => p.ownsEnterprise === "yes").length,
          doesNotOwn: participants.filter(p => p.ownsEnterprise === "no")
            .length,
        },
      };

      return {
        ...data,
        metrics,
      };
    },
  });
}

// Optimized create participant mutation
export function useCreateParticipantOptimized(_clusterId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createParticipant,

    // Optimistic updates for better UX
    onMutate: async newParticipant => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: participantsQueryKeys.lists(),
      });

      // Snapshot previous value
      const previousParticipants = queryClient.getQueriesData({
        queryKey: participantsQueryKeys.lists(),
      });

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: participantsQueryKeys.lists() },
        (old: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldData = old as any;
          if (!oldData?.success || !oldData?.data?.data) return old;

          const optimisticParticipant = {
            ...newParticipant,
            id: `temp-${Date.now()}`, // Temporary ID
            fullName: `${newParticipant.firstName} ${newParticipant.lastName}`,
            created_at: new Date(),
            updated_at: new Date(),
          };

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [optimisticParticipant, ...oldData.data.data],
              pagination: {
                ...oldData.data.pagination,
                total: oldData.data.pagination.total + 1,
              },
            },
          };
        }
      );

      return { previousParticipants };
    },

    // Success handling
    onSuccess: (_data, _variables, _context) => {
      // Invalidate and refetch participants queries
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.metrics(),
      });

      // Show success notification
      console.log("✅ Participant created successfully");
    },

    // Error handling with rollback
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousParticipants) {
        context.previousParticipants.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      console.error("❌ Failed to create participant:", error);
    },

    // Always refetch after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.lists(),
      });
    },
  });
}

// Optimized update participant mutation
export function useUpdateParticipantOptimized(_clusterId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }) => updateParticipant(id, data),

    // Optimistic updates
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: participantsQueryKeys.lists(),
      });

      const previousData = queryClient.getQueriesData({
        queryKey: participantsQueryKeys.lists(),
      });

      // Update all relevant queries
      queryClient.setQueriesData(
        { queryKey: participantsQueryKeys.lists() },
        (old: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldData = old as any;
          if (!oldData?.success || !oldData?.data?.data) return old;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (participant: any) =>
                  participant.id === id
                    ? {
                        ...participant,
                        ...data,
                        fullName: `${data.firstName || participant.firstName} ${data.lastName || participant.lastName}`,
                        updated_at: new Date(),
                      }
                    : participant
              ),
            },
          };
        }
      );

      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.metrics(),
      });
      console.log("✅ Participant updated successfully");
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("❌ Failed to update participant:", error);
    },
  });
}

// Optimized delete participant mutation
export function useDeleteParticipantOptimized(_clusterId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteParticipant,

    // Optimistic removal
    onMutate: async participantId => {
      await queryClient.cancelQueries({
        queryKey: participantsQueryKeys.lists(),
      });

      const previousData = queryClient.getQueriesData({
        queryKey: participantsQueryKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: participantsQueryKeys.lists() },
        (old: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldData = old as any;
          if (!oldData?.success || !oldData?.data?.data) return old;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (p: any) => p.id !== participantId
              ),
              pagination: {
                ...oldData.data.pagination,
                total: Math.max(0, oldData.data.pagination.total - 1),
              },
            },
          };
        }
      );

      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: participantsQueryKeys.metrics(),
      });
      console.log("✅ Participant deleted successfully");
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("❌ Failed to delete participant:", error);
    },
  });
}

// Cache management utilities
export const participantsCacheUtils = {
  // Prefetch participants for better UX
  prefetchParticipants: (
    queryClient: ReturnType<typeof useQueryClient>,
    clusterId: string,
    params?: GetParticipantsOptimizedParams
  ) => {
    return queryClient.prefetchQuery({
      queryKey: participantsQueryKeys.list(clusterId, params),
      queryFn: () => getParticipantsOptimized(clusterId, params),
      staleTime: 5 * 60 * 1000,
    });
  },

  // Clear all participants cache
  clearParticipantsCache: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.removeQueries({ queryKey: participantsQueryKeys.all });
  },

  // Invalidate specific cluster data
  invalidateClusterParticipants: (
    queryClient: ReturnType<typeof useQueryClient>,
    clusterId: string
  ) => {
    queryClient.invalidateQueries({
      queryKey: participantsQueryKeys.lists(),
      predicate: query => {
        const key = query.queryKey as readonly unknown[];
        return key.some(
          (part: unknown) =>
            typeof part === "object" &&
            part !== null &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (part as any).clusterId === clusterId
        );
      },
    });
  },
};
