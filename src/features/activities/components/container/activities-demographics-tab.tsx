"use client";

import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { useAllActivityParticipants } from "../../hooks/use-activities";
import { useCalculatedParticipantMetrics } from "@/features/participants/hooks/use-calculated-participant-metrics";
import {
  DemographicsMetrics,
  YouthEmploymentMetrics,
  WageEmploymentMetrics,
  SelfEmploymentMetrics,
  SecondaryEmploymentMetrics,
} from "@/features/participants/components/metrics/detailed-metrics";
import type { Activity } from "../../types/types";
import type { Participant } from "@/features/participants/types/types";

interface ActivitiesDemographicsTabProps {
  activities: Activity[];
  isLoading?: boolean;
  clusterId?: string;
}

function DetailedActivityParticipantMetrics({
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
    <Tabs
      id="demographics-tabs"
      defaultValue="demographics"
      className="w-full border-purple-500"
    >
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

export function ActivitiesDemographicsTab({
  activities: _activities,
  isLoading = false,
  clusterId,
}: ActivitiesDemographicsTabProps) {
  const {
    data: participantsResponse,
    isLoading: isParticipantsLoading,
    error: participantsError,
  } = useAllActivityParticipants(clusterId);

  const participants = participantsResponse?.success
    ? participantsResponse.data || []
    : [];

  const loading = isLoading || isParticipantsLoading;

  if (
    participantsError ||
    (participantsResponse && !participantsResponse.success)
  ) {
    return (
      <TabsContent value="demographics" className="mt-6">
        <div className="bg-card rounded-xl border p-8 text-center">
          <UserCheck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-semibold">Error Loading Demographics</h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md">
            Failed to load participant demographics data. Please try refreshing
            the page.
          </p>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="demographics" className="mt-6">
      {participants.length > 0 ? (
        <div className="space-y-0">
          {/* Header */}
          <div className="flex items-center justify-end pb-4">
            <Badge variant="outline" className="text-xs">
              {participants.length} participants across activities
            </Badge>
          </div>

          {/* Detailed Metrics with Tabs */}
          <DetailedActivityParticipantMetrics
            participants={participants}
            isLoading={loading}
          />
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-8 text-center">
          <UserCheck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-semibold">
            {loading ? "Loading Demographics..." : "No Activity Participants"}
          </h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md">
            {loading
              ? "Loading demographic analysis of participants across all activities..."
              : "No participants found across activities. Start by creating activities and adding participants to see demographic analytics."}
          </p>
        </div>
      )}
    </TabsContent>
  );
}
