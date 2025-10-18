"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ActivityMetricsCards } from "../metrics/activity-metrics-cards";
import {
  type Activity,
  type ActivityFilters,
  type ActivityMetrics,
} from "../../types/types";

interface MetricsTabProps {
  metricsActivities: Activity[];
  metricsData: unknown;
  isMetricsLoading: boolean;
  filters: ActivityFilters;
}

export function MetricsTab({
  metricsData,
  isMetricsLoading,
  filters,
}: MetricsTabProps) {
  const metrics: ActivityMetrics = (metricsData as { data?: ActivityMetrics })
    ?.data || {
    totalActivities: 0,
    activeActivities: 0,
    completedActivities: 0,
    ongoingActivities: 0,
    plannedActivities: 0,
    totalParticipants: 0,
    thisMonth: 0,
    nextMonth: 0,
    totalBudget: 0,
    overdue: 0,
    actualSpent: 0,
    multiDayActivities: 0,
    singleDayActivities: 0,
    totalSessions: 0,
    completedSessions: 0,
    scheduledSessions: 0,
    sessionCompletionRate: 0,
    averageSessionsPerActivity: 0,
    averageActivityDuration: 0,
    activitiesWithSessions: 0,
    byType: {},
    byStatus: {},
  };

  return (
    <TabsContent value="metrics" className="mt-5 space-y-6">
      {/* Metrics Cards */}
      <div className="space-y-3">
        {/* Metrics Header with Filter Status */}
        {(() => {
          const hasActiveFilters = Object.entries(filters).some(
            ([key, value]) => {
              if (key === "search")
                return typeof value === "string" && value.trim() !== "";
              if (key === "startDate" || key === "endDate") return !!value;
              return value && value !== "all" && value !== "";
            }
          );

          if (hasActiveFilters) {
            return (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Metrics reflect current filters</span>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <ActivityMetricsCards metrics={metrics} isLoading={isMetricsLoading} />
      </div>
    </TabsContent>
  );
}
