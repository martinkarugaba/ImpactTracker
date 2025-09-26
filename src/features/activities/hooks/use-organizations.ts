"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrganizationsByCluster } from "@/features/organizations/actions/organizations";

export function useOrganizationsByCluster(clusterId?: string) {
  return useQuery({
    queryKey: ["organizations", "cluster", clusterId],
    queryFn: async () => {
      if (!clusterId) {
        return { success: true, data: [] };
      }

      const result = await getOrganizationsByCluster(clusterId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch organizations");
      }

      return result;
    },
    enabled: !!clusterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
