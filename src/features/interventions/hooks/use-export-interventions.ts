import { useMutation } from "@tanstack/react-query";
import { getAllFilteredInterventionsForExport } from "../actions/get-interventions";

export function useExportInterventions() {
  return useMutation({
    mutationFn: async (params: {
      clusterId: string;
      filters?: Record<string, unknown>;
      search?: string;
    }) => {
      const result = await getAllFilteredInterventionsForExport(
        params.clusterId,
        params.filters,
        params.search
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to export interventions");
      }
      return result.data || [];
    },
  });
}

// Ensure proper formatting with a newline at the end of the file.
