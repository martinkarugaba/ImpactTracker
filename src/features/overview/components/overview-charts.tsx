"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const activitiesChartConfig = {
  activities: {
    label: "Activities",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const vslasChartConfig = {
  vslas: {
    label: "VSLAs",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const conceptNotesChartConfig = {
  conceptNotes: {
    label: "Concept Notes",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const trainingsChartConfig = {
  trainings: {
    label: "Trainings",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const activityReportsChartConfig = {
  activityReports: {
    label: "Activity Reports",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const projectsChartConfig = {
  projects: {
    label: "Projects",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const clustersChartConfig = {
  clusters: {
    label: "Clusters",
    color: "var(--primary)",
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
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
    participants: item.participants,
  }));

  const activitiesData = trendData.map(item => ({
    period: item.month,
    activities: item.activities,
  }));

  const vslasData = trendData.map(item => ({
    period: item.month,
    vslas: item.vslas,
  }));

  const conceptNotesData = trendData.map(item => ({
    period: item.month,
    conceptNotes: item.conceptNotes,
  }));

  const trainingsData = trendData.map(item => ({
    period: item.month,
    trainings: item.trainings,
  }));

  const activityReportsData = trendData.map(item => ({
    period: item.month,
    activityReports: item.activityReports,
  }));

  const projectsData = trendData.map(item => ({
    period: item.month,
    projects: item.projects,
  }));

  const clustersData = trendData.map(item => ({
    period: item.month,
    clusters: item.clusters,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Participants Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="natural"
                  dataKey="participants"
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
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="natural"
                  dataKey="activities"
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
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="vslas"
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
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="natural"
                  dataKey="conceptNotes"
                  stroke="var(--color-conceptNotes)"
                  fill="url(#fillConceptNotes)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Trainings Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
            Trainings Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={trainingsChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingsData}>
                <defs>
                  <linearGradient
                    id="strokeTrainings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-trainings)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-trainings)"
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="natural"
                  dataKey="trainings"
                  stroke="var(--color-trainings)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-trainings)" }}
                  activeDot={{ r: 6, fill: "var(--color-trainings)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Activity Reports Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
            Activity Reports Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={activityReportsChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityReportsData}>
                <defs>
                  <linearGradient
                    id="fillActivityReports"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-activityReports)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-activityReports)"
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="activityReports"
                  fill="url(#fillActivityReports)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Projects Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
            Projects Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={projectsChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectsData}>
                <defs>
                  <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-projects)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-projects)"
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="natural"
                  dataKey="projects"
                  stroke="var(--color-projects)"
                  fill="url(#fillProjects)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Clusters Trend */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
            Clusters Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={clustersChartConfig}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clustersData}>
                <defs>
                  <linearGradient id="fillClusters" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-clusters)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-clusters)"
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="clusters"
                  fill="url(#fillClusters)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
