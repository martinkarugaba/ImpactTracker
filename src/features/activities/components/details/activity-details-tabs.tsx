"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Users, BarChart3, Calendar } from "lucide-react";
import { Activity } from "../../types/types";
import { ActivityOverviewTab } from "./activity-overview-tab";
import { ParticipantsTab } from "./participants-tab";
import { AttendanceAnalyticsTab } from "./attendance-analytics-tab";
import { SessionsTab } from "./sessions-tab";

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
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-4 rounded-lg p-1">
        <TabsTrigger
          value="overview"
          className="hover:bg-background/60 data-[state=active]:bg-background flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-medium transition-all data-[state=active]:shadow-sm sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Info className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden truncate sm:inline">Overview</span>
          <span className="truncate sm:hidden">Info</span>
        </TabsTrigger>
        <TabsTrigger
          value="sessions"
          className="hover:bg-background/60 data-[state=active]:bg-background flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-medium transition-all data-[state=active]:shadow-sm sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Calendar className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden truncate sm:inline">Sessions</span>
          <span className="truncate sm:hidden">Days</span>
        </TabsTrigger>
        <TabsTrigger
          value="participants"
          className="hover:bg-background/60 data-[state=active]:bg-background flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-medium transition-all data-[state=active]:shadow-sm sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Users className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden truncate sm:inline">Participants</span>
          <span className="truncate sm:hidden">People</span>
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="hover:bg-background/60 data-[state=active]:bg-background flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-medium transition-all data-[state=active]:shadow-sm sm:gap-2 sm:px-3 sm:text-sm"
        >
          <BarChart3 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden truncate sm:inline">Analytics</span>
          <span className="truncate sm:hidden">Stats</span>
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

      <TabsContent value="sessions" className="mt-6">
        <SessionsTab
          activity={activity}
          onManageAttendance={onManageAttendance}
          onCreateSession={onCreateSession}
          onEditSession={onEditSession}
        />
      </TabsContent>

      <TabsContent value="participants" className="mt-6">
        <ParticipantsTab
          activity={activity}
          onManageAttendance={onManageAttendance}
        />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <AttendanceAnalyticsTab activity={activity} />
      </TabsContent>
    </Tabs>
  );
}
