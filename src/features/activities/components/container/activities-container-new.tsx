"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar } from "lucide-react";
import { useActivityContainerState } from "./use-activity-container-state";
import { MetricsTab } from "./metrics-tab";
import { ActivitiesTab } from "./activities-tab";
import { ActivityDialogs } from "./activity-dialogs";

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
            state.setActiveTab(value as "metrics" | "activities")
          }
          className="mb-4 w-full"
        >
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-md bg-gray-100 p-1 dark:bg-gray-900">
            <TabsTrigger
              value="metrics"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-blue-400"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-green-400"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
          </TabsList>

          <MetricsTab
            metricsActivities={state.metricsActivities}
            metricsData={state.metricsData}
            isMetricsLoading={state.isMetricsLoading}
            filters={state.filters}
          />

          <ActivitiesTab
            activities={state.activities}
            pagination={state.pagination}
            filters={state.filters}
            onFiltersChange={state.setFilters}
            searchValue={state.searchValue}
            onSearchChange={state.handleSearchChange}
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
        organizations={[]}
        clusters={[]}
        projects={[]}
      />
    </div>
  );
}
