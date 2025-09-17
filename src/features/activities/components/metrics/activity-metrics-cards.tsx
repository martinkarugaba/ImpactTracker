"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconActivity,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconUsers,
  IconTrendingUp,
  IconAlertCircle,
  IconCalendarTime,
  IconCalendarStats,
  IconClockPlay,
  IconProgressBolt,
} from "@tabler/icons-react";
import { type ActivityMetrics } from "../../types/types";

interface ActivityMetricsCardsProps {
  metrics: ActivityMetrics;
  isLoading?: boolean;
}

export function ActivityMetricsCards({
  metrics,
  isLoading,
}: ActivityMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="--"
            footer={{
              title: "Loading...",
              description: "Fetching data...",
            }}
            icon={<IconActivity className="size-4" />}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Activities"
        value={metrics.totalActivities}
        footer={{
          title: "+12% from last month",
          description: "Overall activity count",
        }}
        icon={<IconActivity className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Active Activities"
        value={metrics.activeActivities}
        footer={{
          title: `${metrics.activeActivities} ongoing`,
          description: "Currently in progress",
        }}
        icon={<IconClock className="size-4 text-orange-600" />}
      />

      <MetricCard
        title="Completed Activities"
        value={metrics.completedActivities}
        footer={{
          title: `${((metrics.completedActivities / metrics.totalActivities) * 100).toFixed(1)}% completion rate`,
          description: "Successfully finished",
        }}
        icon={<IconCheck className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Total Participants"
        value={metrics.totalParticipants}
        footer={{
          title: `Across ${metrics.totalActivities} activities`,
          description: "People involved",
        }}
        icon={<IconUsers className="size-4 text-purple-600" />}
      />

      <MetricCard
        title="This Month"
        value={metrics.thisMonth}
        footer={{
          title: "Activities scheduled",
          description: "Current month pipeline",
        }}
        icon={<IconCalendar className="size-4 text-indigo-600" />}
      />

      <MetricCard
        title="Next Month"
        value={metrics.nextMonth}
        footer={{
          title: "Upcoming activities",
          description: "Future planning",
        }}
        icon={<IconTrendingUp className="size-4 text-teal-600" />}
      />

      <MetricCard
        title="Total Budget"
        value={`$${metrics.totalBudget.toLocaleString()}`}
        footer={{
          title: "Allocated budget",
          description: "Financial resources",
        }}
        icon={<IconCurrencyDollar className="size-4 text-emerald-600" />}
      />

      <MetricCard
        title="Overdue"
        value={metrics.overdue}
        footer={{
          title: "Need attention",
          description: "Delayed activities",
        }}
        icon={<IconAlertCircle className="size-4 text-red-600" />}
      />

      {/* Session-based Metrics */}
      <MetricCard
        title="Multi-Day Activities"
        value={metrics.multiDayActivities}
        footer={{
          title: `${metrics.singleDayActivities} single-day`,
          description: "Activities with sessions",
        }}
        icon={<IconCalendarTime className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Total Sessions"
        value={metrics.totalSessions}
        footer={{
          title: `${metrics.averageSessionsPerActivity} avg per activity`,
          description: "All scheduled sessions",
        }}
        icon={<IconCalendarStats className="size-4 text-purple-600" />}
      />

      <MetricCard
        title="Session Completion"
        value={`${metrics.sessionCompletionRate}%`}
        footer={{
          title: `${metrics.completedSessions}/${metrics.totalSessions} complete`,
          description: "Progress tracking",
        }}
        icon={<IconProgressBolt className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Avg Duration"
        value={`${metrics.averageActivityDuration} days`}
        footer={{
          title: "Per activity",
          description: "Planning insights",
        }}
        icon={<IconClockPlay className="size-4 text-orange-600" />}
      />
    </div>
  );
}

interface ActivityStatusOverviewProps {
  metrics: ActivityMetrics;
  isLoading?: boolean;
}

export function ActivityStatusOverview({
  metrics,
  isLoading,
}: ActivityStatusOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-8 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusData = [
    {
      status: "Planned",
      count: metrics.byStatus.planned || 0,
      color: "bg-blue-100 text-blue-800",
    },
    {
      status: "Ongoing",
      count: metrics.byStatus.ongoing || 0,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      status: "Completed",
      count: metrics.byStatus.completed || 0,
      color: "bg-green-100 text-green-800",
    },
    {
      status: "Cancelled",
      count: metrics.byStatus.cancelled || 0,
      color: "bg-red-100 text-red-800",
    },
    {
      status: "Postponed",
      count: metrics.byStatus.postponed || 0,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusData.map(item => (
            <div
              key={item.status}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={item.color}>
                  {item.status}
                </Badge>
              </div>
              <span className="text-sm font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityTypeOverviewProps {
  metrics: ActivityMetrics;
  isLoading?: boolean;
}

export function ActivityTypeOverview({
  metrics,
  isLoading,
}: ActivityTypeOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-4 w-8 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const typeData = Object.entries(metrics.byType || {})
    .map(([type, count]) => ({
      type: type
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {typeData.map(item => (
            <div key={item.type} className="flex items-center justify-between">
              <span className="text-sm">{item.type}</span>
              <Badge variant="outline">{item.count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
