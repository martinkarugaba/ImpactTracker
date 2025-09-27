"use client";

import { TabsContent } from "@/components/ui/tabs";
import { UserCheck } from "lucide-react";
import { AttendanceAnalyticsStandalone } from "@/components/shared/attendance-analytics";
import { type AttendanceRecord } from "@/hooks/shared/use-attendance-analytics";
import type { Activity } from "../../types/types";

interface ActivitiesDemographicsTabProps {
  activities: Activity[];
  isLoading?: boolean;
  clusterId?: string;
}

export function ActivitiesDemographicsTab({
  activities: _activities,
  isLoading = false,
  clusterId: _clusterId,
}: ActivitiesDemographicsTabProps) {
  // For now, show empty attendance records with a message
  // This will need to be enhanced to fetch actual session data
  const attendanceRecords: AttendanceRecord[] = [];
  const loading = isLoading;

  return (
    <TabsContent value="demographics" className="mt-6">
      {attendanceRecords.length > 0 ? (
        <AttendanceAnalyticsStandalone
          attendanceRecords={attendanceRecords}
          isLoading={loading}
          title="Activities Demographics"
          description="Demographic analysis of participants across all activities"
          showHeader={true}
        />
      ) : (
        <div className="bg-card rounded-xl border p-8 text-center">
          <UserCheck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-semibold">Demographics Analytics</h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md">
            View demographic breakdowns of participants across all activities.
            This feature analyzes attendance patterns by gender, age, location,
            and employment status.
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            {loading
              ? "Loading activity demographics..."
              : "No attendance data available. Start by creating activities with sessions and recording attendance."}
          </p>
        </div>
      )}
    </TabsContent>
  );
}
