"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Users, UserCheck, TrendingUp, Calendar } from "lucide-react";
import type { DailyAttendance, ActivityWithSessions } from "../../types/types";
import type { Activity } from "../../types/types";
import { ActivityOverviewTab } from "./activity-overview-tab";
import { AttendanceOverviewTab } from "./attendance-overview-tab";
import { SessionsManagementTab } from "./sessions-management-tab";
import { AttendanceAnalyticsTab } from "./attendance-analytics-tab";
import { AttendanceDemographicsTab } from "./attendance-demographics-tab";

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
  onDuplicateSession?: (sessionId: string) => void;
  attendanceBySession: Record<string, DailyAttendance[]>;
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
  onCreateSession: _onCreateSession,
  onEditSession,
  onDuplicateSession,
  attendanceBySession,
  refreshKey,
  activityReportsRefreshKey,
}: ActivityDetailsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Initialize tab from URL on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "overview",
        "attendance",
        "attendance-overview",
        "sessions-management",
        "demographics",
        "analytics",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Sync URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value === "overview") {
      params.delete("tab");
      params.delete("subtab"); // Clear subtab when switching main tabs
    } else {
      params.set("tab", value);
      params.delete("subtab"); // Clear subtab when switching main tabs
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <Tabs
      id="activity-details-tabs"
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-fit">
        <TabsTrigger value="overview">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
          <span className="sm:hidden">Info</span>
        </TabsTrigger>
        <TabsTrigger value="attendance-overview">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Attendance</span>
          <span className="sm:hidden">People</span>
        </TabsTrigger>
        <TabsTrigger value="sessions-management">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Sessions</span>
          <span className="sm:hidden">Sess</span>
        </TabsTrigger>
        <TabsTrigger value="demographics">
          <UserCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Demographics</span>
          <span className="sm:hidden">Demo</span>
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <TrendingUp className="h-4 w-4" />
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

      <TabsContent value="attendance-overview" className="mt-6">
        {(() => {
          const allAttendance = Object.values(
            attendanceBySession
          ).flat() as DailyAttendance[];

          return (
            <AttendanceOverviewTab
              allAttendance={allAttendance}
              isLoading={false}
            />
          );
        })()}
      </TabsContent>

      <TabsContent value="sessions-management" className="mt-6">
        <SessionsManagementTab
          sessions={(activity as ActivityWithSessions).sessions ?? []}
          attendanceBySession={attendanceBySession}
          onEditSession={onEditSession}
          onManageAttendance={onManageAttendance}
          onDeleteSession={id => console.log("delete session", id)}
          onUpdateSessionStatus={(id, status) =>
            console.log("update status", id, status)
          }
          onDuplicateSession={onDuplicateSession}
        />
      </TabsContent>

      <TabsContent value="demographics" className="mt-6">
        <AttendanceDemographicsTab activity={activity} />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <AttendanceAnalyticsTab activity={activity} />
      </TabsContent>
    </Tabs>
  );
}
