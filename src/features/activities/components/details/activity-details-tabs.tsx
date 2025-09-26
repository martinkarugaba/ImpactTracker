"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Users, BarChart3, UserCheck } from "lucide-react";
import { Activity } from "../../types/types";
import { ActivityOverviewTab } from "./activity-overview-tab";
import { AttendanceTab } from "./attendance-tab";
import { AttendanceAnalyticsTab } from "./attendance-analytics-tab";
import { ParticipantsDemographicsTab } from "./participants-demographics-tab";

interface ActivityDetailsTabsProps {
  activity: Activity;
  onCreateConceptNote: () => void;
  onEditConceptNote: (conceptNoteId: string) => void;
  onDeleteConceptNote: (conceptNoteId: string) => void;
  onCreateActivityReport: () => void;
  onEditActivityReport: (activityReportId: string) => void;
  onDeleteActivityReport: (activityReportId: string) => void;
  onManageAttendance: (sessionId?: string) => void; // Opens dialog to add/edit participants and manage their attendance
  onCreateSession: () => void;
  onEditSession: (sessionId: string) => void;
  refreshKey: number;
  activityReportsRefreshKey: number;
}

export function ActivityDetailsTabs({
  activity,
  onCreateConceptNote,
  onEditConceptNote,
  onDeleteConceptNote,
  onCreateActivityReport,
  onEditActivityReport,
  onDeleteActivityReport,
  onManageAttendance,
  onCreateSession,
  onEditSession,
  refreshKey,
  activityReportsRefreshKey,
}: ActivityDetailsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
          <span className="sm:hidden">Info</span>
        </TabsTrigger>
        <TabsTrigger value="attendance">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Attendance</span>
          <span className="sm:hidden">People</span>
        </TabsTrigger>
        <TabsTrigger value="demographics">
          <UserCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Demographics</span>
          <span className="sm:hidden">Demo</span>
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <ActivityOverviewTab
          activity={activity}
          onCreateConceptNote={onCreateConceptNote}
          onEditConceptNote={onEditConceptNote}
          onDeleteConceptNote={onDeleteConceptNote}
          onCreateActivityReport={onCreateActivityReport}
          onEditActivityReport={onEditActivityReport}
          onDeleteActivityReport={onDeleteActivityReport}
          refreshKey={refreshKey}
          activityReportsRefreshKey={activityReportsRefreshKey}
        />
      </TabsContent>

      <TabsContent value="attendance" className="mt-6">
        <AttendanceTab
          activity={activity}
          onManageAttendance={onManageAttendance}
          onCreateSession={onCreateSession}
          onEditSession={onEditSession}
        />
      </TabsContent>

      <TabsContent value="demographics" className="mt-6">
        <ParticipantsDemographicsTab activity={activity} />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <AttendanceAnalyticsTab activity={activity} />
      </TabsContent>
    </Tabs>
  );
}
