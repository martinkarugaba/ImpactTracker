"use client";

import { TabsContent } from "@/components/ui/tabs";
import { DetailedParticipantMetrics } from "@/components/shared/detailed-metrics";
import { type Participant } from "../../types/types";

interface AnalyticsTabProps {
  metricsParticipants: Participant[];
  isMetricsLoading: boolean;
}

export function AnalyticsTab({
  metricsParticipants,
  isMetricsLoading,
}: AnalyticsTabProps) {
  return (
    <TabsContent value="analytics" className="mt-4">
      {/* Analytics Container */}
      <div className="space-y-0">
        {/* Detailed Metrics with Tabs */}
        <DetailedParticipantMetrics
          data={metricsParticipants}
          dataType="participants"
          isLoading={isMetricsLoading}
        />
      </div>
    </TabsContent>
  );
}
