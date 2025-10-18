"use client";

import { TabsContent } from "@/components/ui/tabs";
import { type Activity, type ActivityMetrics } from "../../types/types";

interface ChartsTabProps {
  metricsActivities: Activity[];
  metricsData: unknown;
  isMetricsLoading: boolean;
}

export function ChartsTab({
  metricsActivities,
  metricsData,
  isMetricsLoading,
}: ChartsTabProps) {
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
    <TabsContent value="charts" className="mt-5 space-y-6">
      {/* Visual Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Activity Charts</h3>

        {/* Activity Charts/Visualizations */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Status Distribution Chart */}
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <h4 className="mb-3 font-medium">Activities by Status</h4>
            {isMetricsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(metrics.byStatus || {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">{status}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  )
                )}
                {Object.keys(metrics.byStatus || {}).length === 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type Distribution Chart */}
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <h4 className="mb-3 font-medium">Activities by Type</h4>
            {isMetricsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(metrics.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
                {Object.keys(metrics.byType || {}).length === 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities Summary */}
        {isMetricsLoading ? (
          <div className="flex h-32 items-center justify-center rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : metricsActivities.length > 0 ? (
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
                    <span className="ml-2 text-xs text-muted-foreground">
                      {activity.type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <div className="py-4 text-center text-sm text-muted-foreground">
              No activities available
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
