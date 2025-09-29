"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalculatedParticipantMetrics } from "../../hooks/use-calculated-participant-metrics";
import {
  DemographicsMetrics,
  YouthEmploymentMetrics,
  WageEmploymentMetrics,
  SelfEmploymentMetrics,
  SecondaryEmploymentMetrics,
} from "../metrics/detailed-metrics";
import { type Participant } from "../../types/types";

interface AnalyticsTabProps {
  metricsParticipants: Participant[];
  isMetricsLoading: boolean;
}

function DetailedParticipantMetrics({
  participants,
  isLoading = false,
}: {
  participants: Participant[];
  isLoading?: boolean;
}) {
  const metrics = useCalculatedParticipantMetrics(participants);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 w-96 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="demographics" className="w-full border-orange-500">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="youth-employment">Youth in Work</TabsTrigger>
        <TabsTrigger value="wage-employment">Wage Employment</TabsTrigger>
        <TabsTrigger value="self-employment">Self Employment</TabsTrigger>
        <TabsTrigger value="secondary-employment">
          Secondary Employment
        </TabsTrigger>
      </TabsList>

      {/* Demographics Tab */}
      <TabsContent value="demographics" className="mt-6">
        <DemographicsMetrics metrics={metrics} />
      </TabsContent>

      {/* Youth Employment Tab */}
      <TabsContent value="youth-employment" className="mt-6">
        <YouthEmploymentMetrics metrics={metrics} />
      </TabsContent>

      {/* Wage Employment Tab */}
      <TabsContent value="wage-employment" className="mt-6">
        <WageEmploymentMetrics metrics={metrics} />
      </TabsContent>

      {/* Self Employment Tab */}
      <TabsContent value="self-employment" className="mt-6">
        <SelfEmploymentMetrics metrics={metrics} />
      </TabsContent>

      {/* Secondary Employment Tab */}
      <TabsContent value="secondary-employment" className="mt-6">
        <SecondaryEmploymentMetrics metrics={metrics} />
      </TabsContent>
    </Tabs>
  );
}

export function AnalyticsTab({
  metricsParticipants,
  isMetricsLoading,
}: AnalyticsTabProps) {
  return (
    <TabsContent value="analytics" className="mt-4">
      {/* Analytics Container */}
      <div className="space-y-0">
        {/* Header */}
        <div className="flex items-center justify-end pb-4">
          <Badge variant="outline" className="text-xs">
            {metricsParticipants.length} participants
          </Badge>
        </div>

        {/* Detailed Metrics with Tabs */}
        <DetailedParticipantMetrics
          participants={metricsParticipants}
          isLoading={isMetricsLoading}
        />
      </div>
    </TabsContent>
  );
}
