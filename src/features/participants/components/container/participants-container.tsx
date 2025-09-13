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
  organizations?: Array<{ id: string; name: string; acronym: string }>;
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
      {/* Modern Tabs Design */}
      <div className="bg-transparent">
        <Tabs
          value={state.activeTab}
          onValueChange={state.setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="participants"
              className="flex items-center gap-2 data-[state=active]:text-green-600"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Participants</span>
              <span className="sm:hidden">People</span>
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="flex items-center gap-2 data-[state=active]:text-blue-600"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
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
            onViewParticipant={state.handleView}
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
        onSuccess={() => {
          // This will trigger a refetch of participants data
          window.location.reload();
        }}
      />
    </div>
  );
}
