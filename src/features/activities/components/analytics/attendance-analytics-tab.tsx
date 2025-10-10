"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttendanceAnalytics } from "../../hooks/use-attendance-analytics";
import {
  AttendanceDemographicsMetrics,
  YouthEmploymentAttendanceMetrics,
  WageEmploymentAttendanceMetrics,
  SelfEmploymentAttendanceMetrics,
  SecondaryEmploymentAttendanceMetrics,
} from "../analytics";
import { type Participant } from "@/features/participants/types/types";

// Attendance record type with participant data
interface AttendanceRecord {
  id: string;
  session_id: string;
  participant_id: string;
  attendance_status: "attended" | "absent" | "late" | "excused" | "invited";
  participant?: Participant;
  participantName?: string;
}

interface AttendanceAnalyticsTabProps {
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
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
    <Tabs
      id="attendance-analytics-tabs"
      defaultValue="demographics"
      className="w-full"
    >
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
}: AttendanceAnalyticsTabProps) {
  const metrics = useAttendanceAnalytics(attendanceRecords);

  return (
    <TabsContent value="attendance-analytics" className="mt-6">
      {/* Analytics Container */}
      <div className="space-y-6 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-green-500 to-blue-500 p-2 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Attendance Analytics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Attendance patterns and demographic breakdowns
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

        {/* Detailed Metrics with Tabs */}
        <DetailedAttendanceMetrics
          attendanceRecords={attendanceRecords}
          isLoading={isLoading}
        />
      </div>
    </TabsContent>
  );
}
