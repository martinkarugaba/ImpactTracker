"use client";

import { useQuery } from "@tanstack/react-query";
import { getClusterUsers } from "@/features/clusters/actions/cluster-users";
import { useAtom } from "jotai";
import { clusterAtom } from "@/features/auth/atoms/cluster-atom";

export function useClusterUsers(clusterId?: string) {
  const [cluster] = useAtom(clusterAtom);

  const effectiveClusterId = clusterId || cluster?.id;

  const queryKey = ["cluster-users", effectiveClusterId];
  const queryFn = async () => {
    if (!effectiveClusterId) {
      return { success: true, data: [] };
    }

    const result = await getClusterUsers(effectiveClusterId);
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch cluster users");
    }

    return result;
  };

  const queryResult = useQuery({
    queryKey,
    queryFn,
    enabled: !!effectiveClusterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...queryResult,
    isClusterAvailable: !!cluster,
  };
}
