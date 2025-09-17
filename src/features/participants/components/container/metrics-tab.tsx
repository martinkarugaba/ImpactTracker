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
      {/* Colorful Analytics Container */}
      <div className="space-y-8 rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Demographics Analytics - Enhanced with Colors */}
        <ParticipantDemographicsAnalytics
          participants={metricsParticipants}
          isLoading={isMetricsLoading}
        />
      </div>
    </TabsContent>
  );
}
