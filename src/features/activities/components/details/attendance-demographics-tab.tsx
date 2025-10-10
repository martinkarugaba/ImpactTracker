"use client";

import { useMemo } from "react";
import type { Activity } from "../../types/types";
import {
  useActivityParticipants,
  useActivitySessions,
} from "../../hooks/use-activities";
import { getSessionAttendance } from "../../actions/attendance";
import { useQuery } from "@tanstack/react-query";
import { AttendanceAnalyticsStandalone } from "@/components/shared/attendance-analytics";
import { type AttendanceRecord } from "@/hooks/shared/use-attendance-analytics";

interface AttendanceDemographicsTabProps {
  activity: Activity;
}

export function AttendanceDemographicsTab({
  activity,
}: AttendanceDemographicsTabProps) {
  const { data: _participantsResponse, isLoading: isLoadingParticipants } =
    useActivityParticipants(activity.id);

  const { data: sessionsResponse, isLoading: isLoadingSessions } =
    useActivitySessions(activity.id);

  // Get all session IDs to fetch attendance data
  const sessionIds = useMemo(() => {
    return sessionsResponse?.data?.map(session => session.id) || [];
  }, [sessionsResponse]);

  // Fetch attendance data for all sessions
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["activity-attendance-analytics", activity.id, sessionIds],
    queryFn: async () => {
      if (sessionIds.length === 0) return [];

      // Fetch attendance for all sessions
      const attendancePromises = sessionIds.map(sessionId =>
        getSessionAttendance(sessionId)
      );

      const attendanceResults = await Promise.all(attendancePromises);

      // Flatten all attendance records
      const allAttendanceRecords = attendanceResults
        .filter(result => result.success && result.data)
        .flatMap(result => result.data || []);

      return allAttendanceRecords;
    },
    enabled: sessionIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform attendance data to match our expected format
  const attendanceRecords: AttendanceRecord[] = useMemo(() => {
    if (!attendanceData) return [];

    return attendanceData.map(record => ({
      id: record.id,
      session_id: record.session_id,
      participant_id: record.participant_id,
      attendance_status: record.attendance_status as
        | "attended"
        | "absent"
        | "late"
        | "excused"
        | "invited",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participant: record.participant as any, // Type assertion needed due to simplified participant data from attendance records
      participantName: record.participantName,
    }));
  }, [attendanceData]);

  const isLoading =
    isLoadingParticipants || isLoadingSessions || isLoadingAttendance;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <AttendanceAnalyticsStandalone
      attendanceRecords={attendanceRecords}
      isLoading={isLoading}
      showHeader={true}
    />
  );
}
