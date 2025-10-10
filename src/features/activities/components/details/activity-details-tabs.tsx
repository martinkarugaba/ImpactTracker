"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Users, UserCheck, TrendingUp } from "lucide-react";
import type { Activity } from "../../types/types";
import { ActivityOverviewTab } from "./activity-overview-tab";
import { AttendanceTab } from "./attendance-tab";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Initialize tab from URL on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["overview", "attendance", "demographics", "analytics"].includes(tab)
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
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-fit">
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

      <TabsContent value="attendance" className="mt-6">
        <AttendanceTab
          activity={activity}
          onManageAttendance={onManageAttendance}
          onCreateSession={onCreateSession}
          onEditSession={onEditSession}
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
