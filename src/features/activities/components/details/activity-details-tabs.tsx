"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Users, BarChart3 } from "lucide-react";
import { Activity } from "../../types/types";
import { ActivityOverviewTab } from "./activity-overview-tab";
import { ParticipantsTab } from "./participants-tab";
import { ParticipantsMetricsTab } from "./participants-metrics-tab";

interface ActivityDetailsTabsProps {
  activity: Activity;
  onCreateConceptNote: () => void;
  onEditConceptNote: (conceptNoteId: string) => void;
  onDeleteConceptNote: (conceptNoteId: string) => void;
  onCreateActivityReport: () => void;
  onEditActivityReport: (activityReportId: string) => void;
  onDeleteActivityReport: (activityReportId: string) => void;
  onManageAttendance: () => void; // Opens dialog to add/edit participants and manage their attendance
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
  refreshKey,
  activityReportsRefreshKey,
}: ActivityDetailsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 rounded-lg p-1">
        <TabsTrigger
          value="overview"
          className="hover:bg-background/60 data-[state=active]:bg-background flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-medium transition-all data-[state=active]:shadow-sm sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Info className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden truncate sm:inline">Overview</span>
          <span className="truncate sm:hidden">Info</span>
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
          value="metrics"
          className="hover:bg-background/60 data-[state=active]:bg-background flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-medium transition-all data-[state=active]:shadow-sm sm:gap-2 sm:px-3 sm:text-sm"
        >
          <BarChart3 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden truncate sm:inline">Metrics</span>
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

      <TabsContent value="participants" className="mt-6">
        <ParticipantsTab
          activity={activity}
          onManageAttendance={onManageAttendance}
        />
      </TabsContent>

      <TabsContent value="metrics" className="mt-6">
        <ParticipantsMetricsTab activity={activity} />
      </TabsContent>
    </Tabs>
  );
}
