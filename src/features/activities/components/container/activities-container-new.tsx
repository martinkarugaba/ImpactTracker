"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, CalendarDays, UserCheck } from "lucide-react";
import { useActivityContainerState } from "./use-activity-container-state";
import { MetricsTab } from "./metrics-tab";
import { ActivitiesTab } from "./activities-tab";
import { ActivitiesDemographicsTab } from "./activities-demographics-tab";
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
              value as "activities" | "metrics" | "demographics" | "calendar"
            )
          }
          className="mb-4 w-full"
        >
          <TabsList className="grid h-10 w-full grid-cols-4 rounded-md bg-gray-100 p-1 dark:bg-gray-900">
            <TabsTrigger
              value="activities"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="demographics"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Demographics</span>
              <span className="sm:hidden">Demo</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
          </TabsList>

          <MetricsTab
            metricsActivities={state.metricsActivities}
            metricsData={state.metricsData}
            isMetricsLoading={state.isMetricsLoading}
            filters={state.filters}
          />

          <ActivitiesDemographicsTab
            activities={state.activities}
            isLoading={state.isActivitiesLoading}
            clusterId={clusterId}
          />

          <div
            className="flex h-full min-h-[800px]"
            data-state={state.activeTab === "calendar" ? "active" : "inactive"}
            data-orientation="horizontal"
            role="tabpanel"
            tabIndex={0}
            id="calendar"
          >
            {state.activeTab === "calendar" && (
              <CalendarProvider>
                <ActivitiesCalendar className="w-full" clusterId={clusterId} />
              </CalendarProvider>
            )}
          </div>

          <ActivitiesTab
            activities={state.activities}
            pagination={state.pagination}
            isLoading={state.isActivitiesLoading}
            onPaginationChange={state.handlePaginationChange}
            onPageChange={state.handlePageChange}
            onAddActivity={() => state.setIsCreateDialogOpen(true)}
            onEditActivity={activity => state.setEditingActivity(activity)}
            onDeleteActivity={activity => state.setDeletingActivity(activity)}
            onDeleteMultipleActivities={(ids: string[]) => {
              // TODO: Implement bulk delete functionality
              console.log("Delete activities:", ids);
            }}
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
        organizations={state.organizations}
        clusters={[]}
        projects={[]}
      />
    </div>
  );
}
