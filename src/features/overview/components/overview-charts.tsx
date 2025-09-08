"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { getKPITrendData } from "../actions/overview";
import { Skeleton } from "@/components/ui/skeleton";

// Chart configurations for consistent styling and dark mode
const participantsChartConfig = {
  participants: {
    label: "Participants",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const activitiesChartConfig = {
  activities: {
    label: "Activities",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const vslasChartConfig = {
  vslas: {
    label: "VSLAs",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const conceptNotesChartConfig = {
  conceptNotes: {
    label: "Concept Notes",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function OverviewCharts() {
  const { data: trendResponse, isLoading } = useQuery({
    queryKey: ["kpi-trend-data"],
    queryFn: getKPITrendData,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-muted h-3 w-3 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!trendResponse?.success || !trendResponse.data) {
    return (
      <div className="text-muted-foreground text-center">
        {trendResponse?.error || "No trend data available"}
      </div>
    );
  }

  const trendData = trendResponse.data;

  // Transform data for individual charts
  const participantsData = trendData.map(item => ({
    period: item.month,
    count: item.participants,
  }));

  const activitiesData = trendData.map(item => ({
    period: item.month,
    count: item.activities,
  }));

  const vslasData = trendData.map(item => ({
    period: item.month,
    count: item.vslas,
  }));

  const conceptNotesData = trendData.map(item => ({
    period: item.month,
    count: item.conceptNotes,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Participants Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
            Participants Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={participantsChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={participantsData}>
                <defs>
                  <linearGradient
                    id="fillParticipants"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-participants)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-participants)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Area
                  type="natural"
                  dataKey="count"
                  stroke="var(--color-participants)"
                  fill="url(#fillParticipants)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Activities Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
            Activities Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={activitiesChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activitiesData}>
                <defs>
                  <linearGradient
                    id="strokeActivities"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-activities)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-activities)"
                      stopOpacity={0.8}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Line
                  type="natural"
                  dataKey="count"
                  stroke="var(--color-activities)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-activities)" }}
                  activeDot={{ r: 6, fill: "var(--color-activities)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* VSLAs Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-3))]" />
            VSLAs Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={vslasChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vslasData}>
                <defs>
                  <linearGradient id="fillVslas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-vslas)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-vslas)"
                      stopOpacity={0.6}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Bar
                  dataKey="count"
                  fill="url(#fillVslas)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Concept Notes Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-4))]" />
            Concept Notes Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={conceptNotesChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conceptNotesData}>
                <defs>
                  <linearGradient
                    id="fillConceptNotes"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-conceptNotes)"
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-conceptNotes)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Area
                  type="natural"
                  dataKey="count"
                  stroke="var(--color-conceptNotes)"
                  fill="url(#fillConceptNotes)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
