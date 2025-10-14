"use client";

import { useQuery } from "@tanstack/react-query";
import type { Intervention } from "../types/types";

interface FetcherResult {
  success: boolean;
  data?: Intervention[];
  error?: string;
}

export function useInterventions(opts?: {
  enabled?: boolean;
  // Optional custom fetcher so consumers can decide how to fetch (no API route required)
  fetcher?: () => Promise<FetcherResult>;
}) {
  const fetcher =
    opts?.fetcher ??
    (async () =>
      ({
        success: false,
        data: [],
        error: "No fetcher provided",
      }) as FetcherResult);

  return useQuery({
    queryKey: ["interventions"],
    queryFn: async () => {
      const res = await fetcher();
      if (!res.success)
        throw new Error(res.error ?? "Failed to fetch interventions");
      return res.data ?? [];
    },
    enabled: opts?.enabled ?? true,
  });
}
