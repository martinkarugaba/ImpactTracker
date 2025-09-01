"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users } from "lucide-react";
import { useParticipantContainerState } from "./use-participant-container-state";
import { useFilterOptions } from "./use-filter-options";
import { MetricsTab } from "./metrics-tab";
import { ParticipantsTab } from "./participants-tab";
import { ParticipantDialogs } from "./participant-dialogs";

interface ParticipantsContainerProps {
  clusterId: string;
  projects: Array<{ id: string; name: string; acronym: string }>;
  clusters: Array<{ id: string; name: string }>;
  organizations?: Array<{ id: string; name: string }>;
}

export function ParticipantsContainer({
  clusterId,
  projects,
  clusters,
  organizations = [],
}: ParticipantsContainerProps) {
  const state = useParticipantContainerState({ clusterId });

  const filterOptions = useFilterOptions({
    participants: state.participants,
    locationNames: state.locationNames,
  });

  if (state.participantsError || state.metricsError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading participants</h3>
          <p className="text-muted-foreground mt-2">
            {state.participantsError?.message ||
              state.metricsError?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Tabs with Better Visual Hierarchy */}
      <div className="rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <Tabs
          value={state.activeTab}
          onValueChange={state.setActiveTab}
          className="w-full"
        >
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-md bg-gray-100 p-1 dark:bg-gray-900">
            <TabsTrigger
              value="metrics"
              className="flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-blue-400"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-green-400"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Participants</span>
              <span className="sm:hidden">People</span>
            </TabsTrigger>
          </TabsList>

          <MetricsTab
            metricsParticipants={state.metricsParticipants}
            isMetricsLoading={state.isMetricsLoading}
            filters={state.filters}
            onFiltersChange={state.setFilters}
            projects={projects}
            clusters={clusters}
            organizations={organizations}
            filterOptions={filterOptions}
            searchValue={state.searchValue}
            onSearchChange={state.handleSearchChange}
          />

          <ParticipantsTab
            participants={state.participants}
            clusterId={clusterId}
            pagination={state.pagination}
            participantsData={state.participantsData}
            filters={state.filters}
            onFiltersChange={state.setFilters}
            projects={projects}
            clusters={clusters}
            organizations={organizations}
            filterOptions={filterOptions}
            searchValue={state.searchValue}
            onSearchChange={state.handleSearchChange}
            isParticipantsLoading={state.isParticipantsLoading}
            locationNamesLoading={state.locationNames.isLoading}
            onPaginationChange={state.handlePaginationChange}
            onPageChange={page =>
              state.handlePaginationChange(page, state.pagination.pageSize)
            }
            onAddParticipant={() => state.setIsCreateDialogOpen(true)}
            onEditParticipant={(data, id) => {
              const participant = state.participants.find(p => p.id === id);
              if (participant) {
                state.setEditingParticipant(participant);
              }
            }}
            onDeleteParticipant={id => {
              const participant = state.participants.find(p => p.id === id);
              if (participant) {
                state.setDeletingParticipant(participant);
              }
            }}
            onExportData={() => {}}
            onImport={() => {}}
            setIsImportDialogOpen={state.setIsImportDialogOpen}
          />
        </Tabs>
      </div>

      <ParticipantDialogs
        clusterId={clusterId}
        isCreateDialogOpen={state.isCreateDialogOpen}
        setIsCreateDialogOpen={state.setIsCreateDialogOpen}
        isImportDialogOpen={state.isImportDialogOpen}
        setIsImportDialogOpen={state.setIsImportDialogOpen}
        editingParticipant={state.editingParticipant}
        setEditingParticipant={state.setEditingParticipant}
        deletingParticipant={state.deletingParticipant}
        setDeletingParticipant={state.setDeletingParticipant}
      />
    </div>
  );
}
