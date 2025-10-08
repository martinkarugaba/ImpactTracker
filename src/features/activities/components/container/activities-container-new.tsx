"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  PieChart,
  UserCheck,
  Target,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useActivityContainerState } from "./use-activity-container-state";
import { MetricsTab } from "./metrics-tab";
import { ChartsTab } from "./charts-tab";
import { ActivitiesTab } from "./activities-tab";
import { ActivitiesDemographicsTab } from "./activities-demographics-tab";
import { TargetsTab } from "./targets-tab";
import { ActivityDialogs } from "./activity-dialogs";
import { ActivitiesCalendar } from "../calendar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";

interface ActivitiesContainerProps {
  clusterId?: string;
}

export function ActivitiesContainerNew({
  clusterId,
}: ActivitiesContainerProps) {
  const state = useActivityContainerState({ clusterId });
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  if (state.activitiesError || state.metricsError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading activities</h3>
          <p className="text-muted-foreground mt-2">
            {state.activitiesError?.message ||
              state.metricsError?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Tabs with Minimal Styling */}
      <div className="mb-4 bg-transparent">
        <Tabs
          value={state.activeTab}
          onValueChange={value =>
            state.setActiveTab(
              value as
                | "activities"
                | "metrics"
                | "charts"
                | "demographics"
                | "calendar"
                | "targets"
            )
          }
          className="mb-4 w-full"
        >
          <TabsList className="bg-muted/30 inline-flex h-11 w-auto rounded-lg p-1">
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger
                  value="charts"
                  className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <PieChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Charts</span>
                  <span className="sm:hidden">Visual</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="demographics"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Demographics</span>
              <span className="sm:hidden">Demo</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger
                value="targets"
                className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Targets</span>
                <span className="sm:hidden">Tgt</span>
              </TabsTrigger>
            )}
          </TabsList>

          <MetricsTab
            metricsActivities={state.metricsActivities}
            metricsData={state.metricsData}
            isMetricsLoading={state.isMetricsLoading}
            filters={state.filters}
          />

          {isSuperAdmin && (
            <ChartsTab
              metricsActivities={state.metricsActivities}
              metricsData={state.metricsData}
              isMetricsLoading={state.isMetricsLoading}
            />
          )}

          <ActivitiesDemographicsTab
            activities={state.activities}
            isLoading={state.isActivitiesLoading}
            clusterId={clusterId}
          />

          <TabsContent
            value="calendar"
            className="mt-0 flex h-full min-h-[800px]"
          >
            <CalendarProvider>
              <ActivitiesCalendar className="w-full" clusterId={clusterId} />
            </CalendarProvider>
          </TabsContent>

          {isSuperAdmin && (
            <TargetsTab
              metricsActivities={state.metricsActivities}
              isMetricsLoading={state.isMetricsLoading}
            />
          )}

          <ActivitiesTab
            activities={state.activities}
            pagination={state.pagination}
            isLoading={state.isActivitiesLoading}
            onPaginationChange={state.handlePaginationChange}
            onPageChange={state.handlePageChange}
            onAddActivity={() => state.setIsCreateDialogOpen(true)}
            onEditActivity={activity => state.setEditingActivity(activity)}
            onDeleteActivity={activity => state.setDeletingActivity(activity)}
            onDeleteMultipleActivities={state.handleDeleteMultiple}
            onExportData={() => {
              // TODO: Implement export functionality
              console.log("Export activities");
            }}
            onImport={(data: unknown[]) => {
              // TODO: Implement import functionality
              console.log("Import activities:", data);
            }}
          />
        </Tabs>
      </div>

      <ActivityDialogs
        clusterId={clusterId}
        isCreateDialogOpen={state.isCreateDialogOpen}
        setIsCreateDialogOpen={state.setIsCreateDialogOpen}
        isImportDialogOpen={state.isImportDialogOpen}
        setIsImportDialogOpen={state.setIsImportDialogOpen}
        editingActivity={state.editingActivity}
        setEditingActivity={state.setEditingActivity}
        deletingActivity={state.deletingActivity}
        setDeletingActivity={state.setDeletingActivity}
        clusterUsers={state.clusterUsers}
        clusters={[]}
        projects={[]}
      />
    </div>
  );
}
