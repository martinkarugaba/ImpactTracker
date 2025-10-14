"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  ActivitySession,
  DailyAttendance,
  DailyAttendanceStatus,
} from "../../types/types";
import { AttendanceDataTable } from "./attendance-data-table";
import { useMarkAttendance } from "../../hooks/use-activities";
import { useCallback } from "react";

interface AttendanceOverviewTabProps {
  sessions: ActivitySession[];
  attendanceBySession: Record<string, DailyAttendance[]>;
  isLoading?: boolean;
  onAttendanceRefresh?: () => void;
}

export function AttendanceOverviewTab({
  sessions,
  attendanceBySession,
  isLoading = false,
  onAttendanceRefresh,
}: AttendanceOverviewTabProps) {
  const markAttendance = useMarkAttendance();

  const handleStatusChange = useCallback(
    async ({
      attendanceId: _attendanceId,
      sessionId,
      participantId,
      status,
    }: {
      attendanceId: string;
      sessionId: string;
      participantId: string;
      status: string;
    }) => {
      // markAttendance expects a typed union; cast the incoming string to the known union
      await markAttendance.mutateAsync({
        sessionId,
        participantId,
        attendanceData: { attendance_status: status as DailyAttendanceStatus },
      });
      // refresh parent list
      onAttendanceRefresh?.();
    },
    [markAttendance, onAttendanceRefresh]
  );
  // Flatten attendance across all sessions for overview metrics
  const allAttendance = Object.values(attendanceBySession).flat();

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    s => s.status === "completed"
  ).length;
  const totalParticipants = new Set(allAttendance.map(a => a.participant_id))
    .size;

  const totalAttended = allAttendance.filter(
    a => a.attendance_status === "attended"
  ).length;
  const totalAbsent = allAttendance.filter(
    a => a.attendance_status === "absent"
  ).length;
  const totalLate = allAttendance.filter(
    a => a.attendance_status === "late"
  ).length;

  const overallRate =
    allAttendance.length > 0
      ? Math.round((totalAttended / allAttendance.length) * 100)
      : 0;

  // Calculate session-by-session breakdown
  const sessionBreakdown = sessions.map(session => {
    const attendance = attendanceBySession[session.id] || [];
    const attended = attendance.filter(
      a => a.attendance_status === "attended"
    ).length;
    const absent = attendance.filter(
      a => a.attendance_status === "absent"
    ).length;
    const late = attendance.filter(a => a.attendance_status === "late").length;
    const rate =
      attendance.length > 0 ? (attended / attendance.length) * 100 : 0;

    return {
      session,
      attendance: {
        total: attendance.length,
        attended,
        absent,
        late,
        rate,
      },
    };
  });

  // Sort by session number
  sessionBreakdown.sort(
    (a, b) => a.session.session_number - b.session.session_number
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Attendance Overview</h3>
        <p className="text-muted-foreground text-sm">
          Comprehensive attendance analytics across all sessions
        </p>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-blue-600" />
              Sessions Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">{totalSessions}</div>
                <div className="text-muted-foreground text-sm">total</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {completedSessions} completed
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {totalSessions - completedSessions} upcoming
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-purple-600" />
              Unique Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">{totalParticipants}</div>
                <div className="text-muted-foreground text-sm">people</div>
              </div>
              <p className="text-muted-foreground text-xs">
                Registered across all sessions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Overall Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">{overallRate}%</div>
                <div className="text-muted-foreground text-sm">average</div>
              </div>
              <p className="text-muted-foreground text-xs">
                {totalAttended} of {allAttendance.length} records
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/50 p-4 shadow-sm dark:from-green-950 dark:to-green-900/50">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            Total Attended
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {totalAttended}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Attendance records
          </p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-red-50 to-red-100/50 p-4 shadow-sm dark:from-red-950 dark:to-red-900/50">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <Users className="h-4 w-4" />
            Total Absent
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-100">
            {totalAbsent}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">Absence records</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 shadow-sm dark:from-yellow-950 dark:to-yellow-900/50">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-300">
            <Clock className="h-4 w-4" />
            Total Late
          </div>
          <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
            {totalLate}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">Late arrivals</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 shadow-sm dark:from-blue-950 dark:to-blue-900/50">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            <BarChart3 className="h-4 w-4" />
            Total Records
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {allAttendance.length}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            All attendance entries
          </p>
        </div>
      </div>

      {/* Detailed Participant Attendance Table */}
      {allAttendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detailed Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceDataTable
              sessionAttendance={allAttendance}
              isLoading={isLoading}
              onParticipantsDeleted={onAttendanceRefresh}
              onStatusChange={handleStatusChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Session-by-Session Breakdown */}
      {sessionBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session-by-Session Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionBreakdown.map(({ session, attendance }) => (
                <div
                  key={session.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                      {session.session_number}
                    </div>
                    <div>
                      <div className="font-medium">
                        {session.title || `Session ${session.session_number}`}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {attendance.total} participants
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {attendance.attended}/{attendance.total}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        attended
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        attendance.rate >= 75
                          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                          : attendance.rate >= 50
                            ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                      }
                    >
                      {Math.round(attendance.rate)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-muted-foreground/50 h-12 w-12" />
            <h4 className="mt-4 text-lg font-semibold">
              No sessions available
            </h4>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Create sessions to start tracking attendance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
