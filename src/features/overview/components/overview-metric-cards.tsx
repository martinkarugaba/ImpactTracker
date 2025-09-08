"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/ui/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCalendarEvent,
  IconBuildingBank,
  IconFileText,
} from "@tabler/icons-react";
import { getKPIOverviewMetrics } from "../actions/overview";

export function OverviewMetricCards() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["kpi-overview-metrics"],
    queryFn: getKPIOverviewMetrics,
  });

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="from-primary/5 to-card space-y-3 rounded-lg border bg-gradient-to-t p-6 shadow-xs"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!response?.success || !response.data) {
    return (
      <div className="text-muted-foreground text-center">
        {response?.error || "No data available"}
      </div>
    );
  }

  const data = response.data;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Participants"
        value={data.participants.total.toLocaleString()}
        trend={{
          value: data.participants.growth,
          isPositive: data.participants.growth > 0,
          label: "from last month",
        }}
        footer={{
          title: `${data.participants.thisMonth} new this month`,
          description: `${data.participants.males} males, ${data.participants.females} females`,
        }}
        icon={
          <div className="flex items-center gap-2">
            <IconUsers className="h-4 w-4 text-[hsl(var(--chart-1))]" />
            {data.participants.growth > 0 ? (
              <IconTrendingUp className="h-4 w-4" />
            ) : (
              <IconTrendingDown className="h-4 w-4" />
            )}
          </div>
        }
      />

      <MetricCard
        title="Total Activities"
        value={data.activities.total.toLocaleString()}
        trend={{
          value: data.activities.growth,
          isPositive: data.activities.growth > 0,
          label: "from last month",
        }}
        footer={{
          title: `${data.activities.completed} completed`,
          description: `${data.activities.ongoing} ongoing, ${data.activities.planned} planned`,
        }}
        icon={
          <div className="flex items-center gap-2">
            <IconCalendarEvent className="h-4 w-4 text-[hsl(var(--chart-2))]" />
            {data.activities.growth > 0 ? (
              <IconTrendingUp className="h-4 w-4" />
            ) : (
              <IconTrendingDown className="h-4 w-4" />
            )}
          </div>
        }
      />

      <MetricCard
        title="Active VSLAs"
        value={data.vslas.active.toLocaleString()}
        trend={{
          value: data.vslas.growth,
          isPositive: data.vslas.growth > 0,
          label: "from last month",
        }}
        footer={{
          title: `${data.vslas.totalMembers} total members`,
          description: `UGX ${data.vslas.totalSavings.toLocaleString()} total savings`,
        }}
        icon={
          <div className="flex items-center gap-2">
            <IconBuildingBank className="h-4 w-4 text-[hsl(var(--chart-3))]" />
            {data.vslas.growth > 0 ? (
              <IconTrendingUp className="h-4 w-4" />
            ) : (
              <IconTrendingDown className="h-4 w-4" />
            )}
          </div>
        }
      />

      <MetricCard
        title="Concept Notes"
        value={data.conceptNotes.total.toLocaleString()}
        trend={{
          value: data.conceptNotes.growth,
          isPositive: data.conceptNotes.growth > 0,
          label: "from last month",
        }}
        footer={{
          title: `${data.conceptNotes.thisMonth} this month`,
          description: "Submitted concept notes",
        }}
        icon={
          <div className="flex items-center gap-2">
            <IconFileText className="h-4 w-4 text-[hsl(var(--chart-4))]" />
            {data.conceptNotes.growth > 0 ? (
              <IconTrendingUp className="h-4 w-4" />
            ) : (
              <IconTrendingDown className="h-4 w-4" />
            )}
          </div>
        }
      />
    </div>
  );
}
