"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAttendanceAnalytics,
  type AttendanceRecord,
} from "@/hooks/shared/use-attendance-analytics";
import {
  AttendanceDemographicsMetrics,
  YouthEmploymentAttendanceMetrics,
  WageEmploymentAttendanceMetrics,
  SelfEmploymentAttendanceMetrics,
  SecondaryEmploymentAttendanceMetrics,
} from "./index";

interface AttendanceAnalyticsTabProps {
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  tabValue?: string; // Optional custom tab value, defaults to "attendance-analytics"
  title?: string; // Optional custom title
  description?: string; // Optional custom description
  showHeader?: boolean; // Whether to show the header section
}

function DetailedAttendanceMetrics({
  attendanceRecords,
  isLoading = false,
}: {
  attendanceRecords: AttendanceRecord[];
  isLoading?: boolean;
}) {
  const metrics = useAttendanceAnalytics(attendanceRecords);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 w-96 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="demographics" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="youth-employment">Youth in Work</TabsTrigger>
        <TabsTrigger value="wage-employment">Wage Employment</TabsTrigger>
        <TabsTrigger value="self-employment">Self Employment</TabsTrigger>
        <TabsTrigger value="secondary-employment">
          Secondary Employment
        </TabsTrigger>
      </TabsList>

      {/* Demographics Tab */}
      <TabsContent value="demographics" className="mt-6">
        <AttendanceDemographicsMetrics metrics={metrics} />
      </TabsContent>

      {/* Youth Employment Tab */}
      <TabsContent value="youth-employment" className="mt-6">
        <YouthEmploymentAttendanceMetrics metrics={metrics} />
      </TabsContent>

      {/* Wage Employment Tab */}
      <TabsContent value="wage-employment" className="mt-6">
        <WageEmploymentAttendanceMetrics metrics={metrics} />
      </TabsContent>

      {/* Self Employment Tab */}
      <TabsContent value="self-employment" className="mt-6">
        <SelfEmploymentAttendanceMetrics metrics={metrics} />
      </TabsContent>

      {/* Secondary Employment Tab */}
      <TabsContent value="secondary-employment" className="mt-6">
        <SecondaryEmploymentAttendanceMetrics metrics={metrics} />
      </TabsContent>
    </Tabs>
  );
}

export function AttendanceAnalyticsTab({
  attendanceRecords,
  isLoading,
  tabValue = "attendance-analytics",
  title = "Attendance Analytics",
  description = "Attendance patterns and demographic breakdowns",
  showHeader = true,
}: AttendanceAnalyticsTabProps) {
  const metrics = useAttendanceAnalytics(attendanceRecords);

  const content = (
    <div className="space-y-6 rounded-xl p-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-green-500 to-blue-500 p-2 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {metrics.total} records
            </Badge>
            <Badge
              variant={metrics.attendanceRate >= 75 ? "default" : "destructive"}
              className="text-xs"
            >
              {metrics.attendanceRate}% attended
            </Badge>
          </div>
        </div>
      )}

      {/* Detailed Metrics with Tabs */}
      <DetailedAttendanceMetrics
        attendanceRecords={attendanceRecords}
        isLoading={isLoading}
      />
    </div>
  );

  // If tabValue is provided, wrap in TabsContent, otherwise return content directly
  if (tabValue) {
    return (
      <TabsContent value={tabValue} className="mt-6">
        {content}
      </TabsContent>
    );
  }

  return content;
}

/**
 * Standalone attendance analytics component that doesn't require being wrapped in Tabs
 */
export function AttendanceAnalyticsStandalone({
  attendanceRecords,
  isLoading,
  title = "Attendance Analytics",
  description = "Attendance patterns and demographic breakdowns",
  showHeader = true,
}: Omit<AttendanceAnalyticsTabProps, "tabValue">) {
  return (
    <AttendanceAnalyticsTab
      attendanceRecords={attendanceRecords}
      isLoading={isLoading}
      tabValue="" // Empty string means no TabsContent wrapper
      title={title}
      description={description}
      showHeader={showHeader}
    />
  );
}
