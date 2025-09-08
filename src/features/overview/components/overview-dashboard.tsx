"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewMetricCards } from "./overview-metric-cards";
import { OverviewCharts } from "./overview-charts";
import {
  IconChartAreaLine,
  IconTarget,
  IconTrendingUp,
} from "@tabler/icons-react";

// Loading component for the overview sections
function OverviewSectionLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function OverviewDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Track your KPI performance across all key areas
        </p>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="metrics" className="space-y-8">
        <TabsList className="grid h-11 w-full grid-cols-3">
          <TabsTrigger
            value="metrics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
          >
            <IconTarget className="h-4 w-4" />
            <span className="hidden sm:inline">Metrics</span>
            <span className="sm:hidden">KPIs</span>
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
          >
            <IconChartAreaLine className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
            <span className="sm:hidden">Charts</span>
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
          >
            <IconTrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Key Performance Indicators
              </h2>
              <p className="text-muted-foreground text-sm">
                Current metrics across all your key performance areas
              </p>
            </div>
            <Suspense fallback={<OverviewSectionLoading />}>
              <OverviewMetricCards />
            </Suspense>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Performance Trends</h2>
              <p className="text-muted-foreground text-sm">
                Historical data and trends over the past 6 months
              </p>
            </div>
            <Suspense fallback={<OverviewSectionLoading />}>
              <OverviewCharts />
            </Suspense>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTrendingUp className="h-5 w-5" />
                Key Insights
              </CardTitle>
              <CardDescription>
                AI-powered insights based on your KPI data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Growing Participation
                  </h4>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-200">
                    Your participant engagement has increased by 15% compared to
                    last month, indicating strong community involvement.
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Activity Optimization
                  </h4>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                    Activities scheduled on weekdays show 23% higher completion
                    rates than weekend activities.
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">
                    VSLA Growth Opportunity
                  </h4>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                    VSLA formation has plateaued. Consider targeted outreach in
                    underserved areas to boost growth.
                  </p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Concept Note Success
                  </h4>
                  <p className="mt-1 text-sm text-purple-700 dark:text-purple-200">
                    Concept notes submitted in the first half of the month have
                    a 40% higher approval rate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
