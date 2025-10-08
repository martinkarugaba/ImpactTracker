"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, PieChart, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParticipantContainerJotai } from "../../state/use-participant-container-jotai";
import { useParticipantState } from "../../state/use-participant-state";
import type { Participant } from "../../types/types";
import { AnalyticsTab } from "./metrics-tab";
import { ChartsTab } from "./charts-tab";
import { ParticipantsTab } from "./participants-tab";
import { TargetsTab } from "./targets-tab";
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

  // Get user session for role checking
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  // Wrapper functions to match ParticipantsTab interface
  const handleEditWrapper = (data: unknown, id: string) => {
    const participant = state.participants?.find(
      (p: Participant) => p.id === id
    );
    if (participant) {
      state.handleEdit(participant);
    }
  };

  const handleDeleteWrapper = (id: string) => {
    const participant = state.participants?.find(
      (p: Participant) => p.id === id
    );
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
    <div className="space-y-6 border-green-500">
      {/* Modern Tabs Design */}
      <div className="bg-transparent">
        <Tabs
          value={activeTab}
          onValueChange={value =>
            setActiveTab(
              value as "participants" | "analytics" | "charts" | "targets"
            )
          }
          className="w-full"
        >
          <TabsList className="bg-muted">
            <TabsTrigger
              value="participants"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
            >
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger
                  value="charts"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
                >
                  <PieChart className="h-4 w-4" />
                  Charts
                </TabsTrigger>
                <TabsTrigger
                  value="targets"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
                >
                  <Target className="h-4 w-4" />
                  Targets
                </TabsTrigger>
              </>
            )}
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
            onFiltersChange={state.handleFiltersChange}
            projects={projects}
            clusters={clusters}
            organizations={organizations}
            filterOptions={state.filterOptions}
            searchValue={state.searchValue}
            onSearchChange={() => {}} // No longer needed - Jotai handles this
            isParticipantsLoading={state.isParticipantsLoading}
            isFiltering={state.isFiltering}
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

          {/* Charts Tab - Super Admin Only */}
          {isSuperAdmin && (
            <ChartsTab
              metricsParticipants={state.metricsParticipants}
              isMetricsLoading={state.isMetricsLoading}
            />
          )}

          {/* Targets Tab - Super Admin Only */}
          {isSuperAdmin && (
            <TargetsTab
              metricsParticipants={state.metricsParticipants}
              isMetricsLoading={state.isMetricsLoading}
            />
          )}
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
