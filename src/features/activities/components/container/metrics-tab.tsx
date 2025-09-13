"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ActivityMetricsCards } from "../metrics/activity-metrics-cards";
import {
  type Activity,
  type ActivityFilters as ActivityFiltersType,
  type ActivityMetrics,
} from "../../types/types";

interface MetricsTabProps {
  metricsActivities: Activity[];
  metricsData: unknown;
  isMetricsLoading: boolean;
  filters: ActivityFiltersType;
}

export function MetricsTab({
  metricsActivities,
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
    <TabsContent value="metrics" className="space-y-6">
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
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                  <span>Metrics reflect current filters</span>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <ActivityMetricsCards metrics={metrics} isLoading={isMetricsLoading} />
      </div>

      {/* Visual Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Activity Analytics</h3>

        {/* Activity Charts/Visualizations */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Status Distribution Chart */}
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <h4 className="mb-3 font-medium">Activities by Status</h4>
            <div className="space-y-2">
              {Object.entries(metrics.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Type Distribution Chart */}
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <h4 className="mb-3 font-medium">Activities by Type</h4>
            <div className="space-y-2">
              {Object.entries(metrics.byType || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities Summary */}
        {metricsActivities.length > 0 && (
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <h4 className="mb-3 font-medium">Recent Activities</h4>
            <div className="space-y-2">
              {metricsActivities.slice(0, 5).map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {activity.title}
                    </span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {activity.type}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
