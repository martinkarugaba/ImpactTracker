"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, PieChart } from "lucide-react";
import { useParticipantContainerJotai, useParticipantState } from "../../state";
import { useFilterOptions } from "./use-filter-options";
import { AnalyticsTab } from "./metrics-tab";
import { ChartsTab } from "./charts-tab";
import { ParticipantsTab } from "./participants-tab";
import { ParticipantDialogs } from "./participant-dialogs";

interface JotaiParticipantsContainerProps {
  clusterId: string;
  projects: Array<{ id: string; name: string; acronym: string }>;
  clusters: Array<{ id: string; name: string }>;
  organizations?: Array<{ id: string; name: string; acronym: string }>;
}

export function JotaiParticipantsContainer({
  clusterId,
  projects,
  clusters,
  organizations = [],
}: JotaiParticipantsContainerProps) {
  // Use Jotai-based container state
  const state = useParticipantContainerJotai({ clusterId });

  // Get tab state from Jotai
  const { activeTab, setActiveTab } = useParticipantState();

  const filterOptions = useFilterOptions({
    participants: state.participants,
    locationNames: state.locationNames,
  });

  // Wrapper functions to match ParticipantsTab interface
  const handleEditWrapper = (data: unknown, id: string) => {
    const participant = state.participants?.find(p => p.id === id);
    if (participant) {
      state.handleEdit(participant);
    }
  };

  const handleDeleteWrapper = (id: string) => {
    const participant = state.participants?.find(p => p.id === id);
    if (participant) {
      state.handleDelete(participant);
    }
  };

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/30 grid h-11 w-auto grid-cols-3 rounded-lg p-1">
            <TabsTrigger
              value="participants"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Participants</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Metrics</span>
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Charts</span>
              <span className="sm:hidden">Visual</span>
            </TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <ParticipantsTab
            participants={state.participants}
            clusterId={clusterId}
            pagination={{
              page: state.pagination.page,
              pageSize: state.pagination.pageSize,
            }}
            participantsData={state.participantsData}
            filters={state.filters}
            onFiltersChange={() => {}} // No longer needed - Jotai handles this
            projects={projects}
            clusters={clusters}
            organizations={organizations}
            filterOptions={filterOptions}
            searchValue={state.searchValue}
            onSearchChange={() => {}} // No longer needed - Jotai handles this
            isParticipantsLoading={state.isParticipantsLoading}
            locationNamesLoading={false}
            onPaginationChange={state.handlePaginationChange}
            onPageChange={page =>
              state.handlePaginationChange(page, state.pagination.pageSize)
            }
            onAddParticipant={() => state.setIsCreateDialogOpen(true)}
            onEditParticipant={handleEditWrapper}
            onDeleteParticipant={handleDeleteWrapper}
            onViewParticipant={state.handleView}
            onExportData={format => state.handleExport(format)}
            onImport={() => {}} // TODO: Implement import
            setIsImportDialogOpen={state.setIsImportDialogOpen}
          />

          {/* Analytics Tab */}
          <AnalyticsTab
            metricsParticipants={state.metricsParticipants}
            isMetricsLoading={state.isMetricsLoading}
          />

          {/* Charts Tab */}
          <ChartsTab
            metricsParticipants={state.metricsParticipants}
            isMetricsLoading={state.isMetricsLoading}
          />
        </Tabs>
      </div>

      {/* Dialogs */}
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
