"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </CardTitle>
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-16 animate-pulse rounded" />
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Activities",
      value: metrics.totalActivities,
      change: "+12% from last month",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Active Activities",
      value: metrics.activeActivities,
      change: `${metrics.activeActivities} ongoing`,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Completed Activities",
      value: metrics.completedActivities,
      change: `${((metrics.completedActivities / metrics.totalActivities) * 100).toFixed(1)}% completion rate`,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Total Participants",
      value: metrics.totalParticipants,
      change: `Across ${metrics.totalActivities} activities`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "This Month",
      value: metrics.thisMonth,
      change: "Activities scheduled",
      icon: Calendar,
      color: "text-indigo-600",
    },
    {
      title: "Next Month",
      value: metrics.nextMonth,
      change: "Upcoming activities",
      icon: TrendingUp,
      color: "text-teal-600",
    },
    {
      title: "Total Budget",
      value: `$${metrics.totalBudget.toLocaleString()}`,
      change: "Allocated budget",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Overdue",
      value: metrics.overdue,
      change: "Need attention",
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-muted-foreground text-xs">{card.change}</p>
            </CardContent>
          </Card>
        );
      })}
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
