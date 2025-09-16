"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ParticipantMetricsCharts } from "../metrics/participant-metrics-charts";
import { type Participant } from "../../types/types";

interface ChartsTabProps {
  metricsParticipants: Participant[];
  isMetricsLoading: boolean;
}

export function ChartsTab({
  metricsParticipants,
  isMetricsLoading,
}: ChartsTabProps) {
  return (
    <TabsContent value="charts" className="mt-6">
      {/* Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Visual Analytics
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
        </div>
        <ParticipantMetricsCharts
          participants={metricsParticipants}
          isLoading={isMetricsLoading}
        />
      </div>
    </TabsContent>
  );
}
