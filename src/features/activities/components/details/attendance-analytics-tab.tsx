"use client";

import { useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Target,
  Award,
  Download,
} from "lucide-react";
import { Activity } from "../../types/types";
import {
  useActivityParticipants,
  useActivitySessions,
} from "../../hooks/use-activities";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, differenceInDays } from "date-fns";

interface AttendanceAnalyticsTabProps {
  activity: Activity;
}

export function AttendanceAnalyticsTab({
  activity,
}: AttendanceAnalyticsTabProps) {
  const {
    data: participantsResponse,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useActivityParticipants(activity.id);

  const { data: sessionsResponse, isLoading: isLoadingSessions } =
    useActivitySessions(activity.id);

  // Memoize participants and sessions to prevent re-renders
  const participants = useMemo(() => {
    return participantsResponse?.success ? participantsResponse.data || [] : [];
  }, [participantsResponse]);

  const sessions = useMemo(() => {
    return sessionsResponse?.data || [];
  }, [sessionsResponse]);

  const completedSessions = useMemo(() => {
    return sessions.filter(s => s.status === "completed");
  }, [sessions]);

  // Calculate comprehensive attendance analytics
  const analytics = useMemo(() => {
    const totalParticipants = participants.length;
    const totalSessions = sessions.length;
    const completedSessionsCount = completedSessions.length;
    const totalPossibleAttendance = totalParticipants * completedSessionsCount;

    // Basic stats
    const activeParticipants = participants.filter(
      p => p.attendance_status === "attended"
    ).length;
    const absentParticipants = participants.filter(
      p => p.attendance_status === "absent"
    ).length;
    const pendingParticipants = participants.filter(
      p => p.attendance_status === "pending"
    ).length;

    // Session completion rate
    const sessionCompletionRate =
      totalSessions > 0 ? (completedSessionsCount / totalSessions) * 100 : 0;

    // Overall attendance rate (simple calculation for now)
    const overallAttendanceRate =
      totalParticipants > 0
        ? (activeParticipants / totalParticipants) * 100
        : 0;

    // Session consistency (participants who attended multiple sessions)
    const regularAttendees = activeParticipants; // Simplified for now

    // Calculate activity duration
    const activityDuration =
      sessions.length > 0
        ? differenceInDays(
            parseISO(sessions[sessions.length - 1].session_date),
            parseISO(sessions[0].session_date)
          ) + 1
        : 1;

    return {
      totalParticipants,
      totalSessions,
      completedSessionsCount,
      activeParticipants,
      absentParticipants,
      pendingParticipants,
      sessionCompletionRate,
      overallAttendanceRate,
      regularAttendees,
      activityDuration,
      totalPossibleAttendance,
    };
  }, [participants, sessions, completedSessions]);

  if (isLoadingParticipants || isLoadingSessions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (participantsError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load attendance analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="dark:via-background relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Attendance Analytics
              </h2>
              <p className="text-muted-foreground mt-2">
                Comprehensive attendance tracking and participation insights for
                multi-day activities
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                    <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalSessions}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sessions
                </div>
                <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {analytics.activityDuration} days
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.overallAttendanceRate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Attendance Rate
                </div>
                <Badge className="mt-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {analytics.activeParticipants} {analytics.totalParticipants}{" "}
                  attending
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-purple-100 p-4 dark:bg-purple-900/30">
                    <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.sessionCompletionRate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sessions Complete
                </div>
                <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {analytics.completedSessionsCount} {analytics.totalSessions}{" "}
                  done
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/30">
                    <Award className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.regularAttendees}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Consistent Attendees
                </div>
                <Badge className="mt-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  High engagement
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-200/30 blur-2xl dark:from-blue-800/20 dark:to-indigo-800/20"></div>
      </div>

      {/* Attendance Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Attendance Overview
            </h3>
            <p className="text-muted-foreground">
              Detailed breakdown of participant attendance patterns
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Active Participants"
            value={analytics.activeParticipants}
            description="Participants who have attended sessions"
            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
            className="border-l-4 border-l-emerald-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: `${analytics.overallAttendanceRate.toFixed(1)}%`,
              description: "of total participants",
            }}
          />
          <MetricCard
            title="Absent Participants"
            value={analytics.absentParticipants}
            description="Participants marked as absent"
            icon={<XCircle className="h-4 w-4 text-red-600" />}
            className="border-l-4 border-l-red-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: `${analytics.totalParticipants > 0 ? ((analytics.absentParticipants / analytics.totalParticipants) * 100).toFixed(1) : 0}%`,
              description: "absence rate",
            }}
          />
          <MetricCard
            title="Pending Check-ins"
            value={analytics.pendingParticipants}
            description="Participants with pending attendance status"
            icon={<Clock className="h-4 w-4 text-orange-600" />}
            className="border-l-4 border-l-orange-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: "Needs Review",
              description: "manual verification required",
            }}
          />
        </div>
      </div>

      {/* Session Progress */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Session Progress
            </h3>
            <p className="text-muted-foreground">
              Track progress across all activity sessions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activity Timeline</span>
              <Badge variant="outline">
                {analytics.completedSessionsCount} of {analytics.totalSessions}{" "}
                complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{analytics.sessionCompletionRate.toFixed(1)}%</span>
              </div>
              <Progress
                value={analytics.sessionCompletionRate}
                className="h-2"
              />
            </div>

            {sessions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Session Details</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                          {session.session_number}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Session {session.session_number}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {format(parseISO(session.session_date), "MMM dd")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          session.status === "completed"
                            ? "default"
                            : session.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {session.status === "scheduled"
                          ? "Upcoming"
                          : session.status === "in_progress"
                            ? "Active"
                            : session.status === "completed"
                              ? "Done"
                              : "Cancelled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed attendance trends chart will be displayed here. This
                would show attendance patterns over time, peak attendance days,
                and engagement metrics.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participant Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/20">
                  <div className="text-2xl font-bold text-emerald-600">
                    {analytics.totalParticipants > 0
                      ? Math.round(
                          (analytics.activeParticipants /
                            analytics.totalParticipants) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-300">
                    Active Participation
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.activityDuration}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Days Duration
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced participant analytics including attendance patterns,
                  engagement scores, and retention rates will be displayed here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
