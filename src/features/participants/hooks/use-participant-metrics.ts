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
      // If filters are provided, use the filtered getParticipants
      if (filters && Object.values(filters).some(v => v !== "")) {
        const result = await getParticipants(clusterId, {
          filters: {
            project: filters.project || undefined,
            district: filters.district || undefined,
            sex: filters.sex || undefined,
            isPWD: filters.isPWD || undefined,
            ageGroup: filters.ageGroup || undefined,
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
