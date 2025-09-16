"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ParticipantDemographicsAnalytics } from "../metrics/participant-demographics-analytics";
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
    <TabsContent value="analytics" className="mt-6">
      {/* Demographics Analytics - Clean and Focused */}
      <ParticipantDemographicsAnalytics
        participants={metricsParticipants}
        isLoading={isMetricsLoading}
      />
    </TabsContent>
  );
}
