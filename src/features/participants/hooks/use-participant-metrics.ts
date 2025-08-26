"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllParticipantsForMetrics, getParticipants } from "../actions";
import { type ParticipantFilters } from "../types/types";

export function useParticipantMetrics(
  clusterId: string,
  filters?: ParticipantFilters
) {
  return useQuery({
    queryKey: [
      "participant-metrics",
      clusterId,
      filters ? JSON.stringify(filters) : "all",
    ],
    queryFn: async () => {
      // Check if any meaningful filters are applied (excluding 'all' values)
      const hasActiveFilters =
        filters &&
        Object.entries(filters).some(([key, value]) => {
          if (key === "search") return value && value.trim() !== "";
          return value && value !== "all" && value !== "";
        });

      // If filters are provided and active, use the filtered getParticipants
      if (hasActiveFilters) {
        const result = await getParticipants(clusterId, {
          search: filters.search || undefined,
          filters: {
            project: filters.project !== "all" ? filters.project : undefined,
            district: filters.district !== "all" ? filters.district : undefined,
            sex: filters.sex !== "all" ? filters.sex : undefined,
            isPWD: filters.isPWD !== "all" ? filters.isPWD : undefined,
            ageGroup: filters.ageGroup !== "all" ? filters.ageGroup : undefined,
          },
        });
        return result.data?.data || [];
      }

      // Otherwise get all participants for metrics
      const result = await getAllParticipantsForMetrics(clusterId);
      return result.data?.data || [];
    },
  });
}
