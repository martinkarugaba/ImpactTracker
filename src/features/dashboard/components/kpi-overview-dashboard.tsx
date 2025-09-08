"use client";

import { useQuery } from "@tanstack/react-query";
import { getKPIOverviewMetrics, getKPITrendData } from "../actions/overview";
import {
  KPIMetricCard,
  KPIParticipantsCard,
  KPIActivitiesCard,
  KPIVSLAsCard,
} from "./kpi-metric-cards";
import {
  KPITrendChart,
  ParticipantsGenderChart,
  ActivitiesStatusChart,
  DistrictPerformanceChart,
  ParticipantsAgeChart,
} from "./kpi-charts";
import {
  IconUsers,
  IconActivity,
  IconBuilding,
  IconFileText,
  IconTrophy,
  IconReport,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function KPIOverviewDashboard() {
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ["kpi-overview-metrics"],
    queryFn: async () => {
      const result = await getKPIOverviewMetrics();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch metrics");
      }
      return result.data!;
    },
  });

  const {
    data: trendData,
    isLoading: trendLoading,
    error: trendError,
  } = useQuery({
    queryKey: ["kpi-trend-data"],
    queryFn: async () => {
      const result = await getKPITrendData();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch trend data");
      }
      return result.data!;
    },
  });

  if (metricsLoading || trendLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (metricsError || trendError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Error loading dashboard data:{" "}
            {metricsError?.message || trendError?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!metricsData || !trendData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main KPI Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIMetricCard
          title="Total Participants"
          value={metricsData.participants.total}
          icon={<IconUsers className="h-4 w-4 text-blue-600" />}
          growth={metricsData.participants.growth}
          subtitle={`${metricsData.participants.thisMonth} this month`}
        />
        <KPIMetricCard
          title="Total Activities"
          value={metricsData.activities.total}
          icon={<IconActivity className="h-4 w-4 text-green-600" />}
          growth={metricsData.activities.growth}
          subtitle={`${metricsData.activities.completed} completed`}
        />
        <KPIMetricCard
          title="Active VSLAs"
          value={metricsData.vslas.active}
          icon={<IconBuilding className="h-4 w-4 text-purple-600" />}
          growth={metricsData.vslas.growth}
          subtitle={`${metricsData.vslas.totalMembers} total members`}
        />
        <KPIMetricCard
          title="Concept Notes"
          value={metricsData.conceptNotes.total}
          icon={<IconFileText className="h-4 w-4 text-orange-600" />}
          growth={metricsData.conceptNotes.growth}
          subtitle={`${metricsData.conceptNotes.thisMonth} this month`}
        />
      </div>

      {/* Detailed Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPIParticipantsCard data={metricsData.participants} />
        <KPIActivitiesCard data={metricsData.activities} />
        <KPIVSLAsCard data={metricsData.vslas} />
      </div>

      {/* Additional KPI Cards for Reports and Success Stories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconReport className="h-5 w-5 text-indigo-600" />
              <span>Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {metricsData.reports.total}
              </div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <Badge variant="secondary" className="mt-2">
                {metricsData.reports.thisMonth} this month
              </Badge>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  This feature will be available when reports module is
                  implemented
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconTrophy className="h-5 w-5 text-yellow-600" />
              <span>Success Stories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {metricsData.successStories.total}
              </div>
              <p className="text-sm text-gray-500">Total Success Stories</p>
              <Badge variant="secondary" className="mt-2">
                {metricsData.successStories.thisMonth} this month
              </Badge>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  This feature will be available when success stories module is
                  implemented
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6">
        {/* KPI Trend Chart - Full Width */}
        <KPITrendChart data={trendData} />

        {/* Secondary Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <ParticipantsGenderChart
            data={{
              males: metricsData.participants.males,
              females: metricsData.participants.females,
            }}
          />
          <ActivitiesStatusChart data={metricsData.activities.byStatus} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <DistrictPerformanceChart
            participantsData={metricsData.participants.byDistrict}
            vslasData={metricsData.vslas.byDistrict}
          />
          <ParticipantsAgeChart data={metricsData.participants.byAge} />
        </div>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Summary Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">
                Participation Growth
              </h4>
              <p className="text-sm text-gray-600">
                {metricsData.participants.growth > 0 ? (
                  <>
                    Participant registration is up{" "}
                    <span className="font-medium text-green-600">
                      {metricsData.participants.growth}%
                    </span>{" "}
                    this month with {metricsData.participants.thisMonth} new
                    registrations.
                  </>
                ) : (
                  <>
                    Participant registration remained steady this month with{" "}
                    {metricsData.participants.thisMonth} new registrations.
                  </>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Activity Progress</h4>
              <p className="text-sm text-gray-600">
                {metricsData.activities.completed} activities completed out of{" "}
                {metricsData.activities.total} total activities.{" "}
                {metricsData.activities.ongoing} activities are currently
                ongoing.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">VSLA Impact</h4>
              <p className="text-sm text-gray-600">
                {metricsData.vslas.active} active VSLAs serving{" "}
                {metricsData.vslas.totalMembers} members with total savings of
                UGX {metricsData.vslas.totalSavings.toLocaleString()}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
