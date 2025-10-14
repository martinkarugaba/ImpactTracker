import { useMutation } from "@tanstack/react-query";
import { getAllFilteredInterventionsForExport } from "../actions/get-interventions";
import { saveAs } from "file-saver";

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

      // Convert data to CSV format
      const csvContent = result.data
        ?.map(intervention =>
          [
            intervention.participantName,
            intervention.activityTitle,
            intervention.skillCategory,
            intervention.age,
            intervention.subcounty,
          ].join(",")
        )
        .join("\n");

      // Create a Blob and trigger download
      const blob = new Blob([csvContent || ""], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "interventions_export.csv");

      return result.data || [];
    },
  });
}

// Ensure proper formatting with a newline at the end of the file.
