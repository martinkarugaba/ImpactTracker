"use client";

import { useQuery } from "@tanstack/react-query";
import { getClusterUsers } from "@/features/clusters/actions/cluster-users";

export function useClusterUsers(clusterId?: string) {
  return useQuery({
    queryKey: ["cluster-users", clusterId],
    queryFn: async () => {
      if (!clusterId) {
        return { success: true, data: [] };
      }

      const result = await getClusterUsers(clusterId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch cluster users");
      }

      return result;
    },
    enabled: !!clusterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
