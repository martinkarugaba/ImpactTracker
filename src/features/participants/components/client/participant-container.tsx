"use client";

import { useState } from "react";
import { type Participant } from "../../types/types";
import { ParticipantsTable } from "../participants-table";
import { CompactParticipantMetrics } from "../metrics/compact-participant-metrics";
import { DetailedParticipantMetrics } from "../metrics/detailed-participant-metrics";
import { useParticipantData } from "./participant-data-provider";
import { useParticipantFormHandlers } from "./participant-form-handlers";
import { extractClusterOrganizations } from "./participant-transformer";
import { type ParticipantContainerProps } from "./types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown } from "lucide-react";

export function ParticipantContainer({
  clusterId,
  projects,
  clusters,
  searchParams,
}: ParticipantContainerProps) {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);

  // Get participant data and related state
  const {
    participantsData,
    isLoadingParticipants,
    participantsResult,
    metricsData,
    isLoadingMetrics,
    applyFiltersToMetrics,
    toggleMetricsFilters,
    filters,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    searchTerm,
    districts,
    sexOptions,
  } = useParticipantData({
    clusterId,
    initialSearchParams: searchParams,
  });

  // Get form handling functions
  const {
    handleSubmit,
    handleImportParticipants,
    handleEdit,
    handleDelete,
    handleAdd,
  } = useParticipantFormHandlers({
    clusterId,
    onSetIsLoading: setIsLoading,
    onSetIsOpen: setIsOpen,
    onSetEditingParticipant: setEditingParticipant,
  });

  // Get organizations data
  const clusterOrganizations = extractClusterOrganizations(clusterId, clusters);

  // We no longer need to extract metrics here since CompactParticipantMetrics handles it
  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Compact Metrics Panel */}
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Participant Overview</h3>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Detailed Metrics
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
                <SheetHeader className="mb-6">
                  <SheetTitle>Participant Metrics</SheetTitle>
                  <SheetDescription>
                    Detailed breakdown of participant demographics and
                    statistics
                  </SheetDescription>
                  {toggleMetricsFilters && (
                    <div className="mt-4 flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <label
                          className="text-muted-foreground text-sm"
                          htmlFor="filter-toggle"
                        >
                          Apply filters to metrics
                        </label>
                        <Switch
                          id="filter-toggle"
                          checked={applyFiltersToMetrics}
                          onCheckedChange={toggleMetricsFilters}
                        />
                      </div>
                    </div>
                  )}
                </SheetHeader>
                <div className="overflow-y-auto pr-1">
                  <DetailedParticipantMetrics
                    participants={metricsData}
                    isLoading={isLoadingMetrics}
                    onFilterChange={filter => {
                      const newFilters = { ...filters };

                      switch (filter.type) {
                        case "gender":
                          newFilters.sex = filter.value;
                          break;
                        case "age":
                          // Handle age-based filters
                          const isYoung = filter.value.includes("young");
                          const isFemale = filter.value.includes("female");

                          newFilters.ageGroup = isYoung ? "young" : "older";
                          newFilters.sex = isFemale ? "female" : "male";
                          break;
                        case "disability":
                          newFilters.isPWD = "true";
                          if (filter.value !== "all") {
                            newFilters.sex = filter.value;
                          }
                          break;
                        case "all":
                          // Reset filters
                          newFilters.sex = "";
                          newFilters.ageGroup = "";
                          newFilters.isPWD = "";
                          break;
                      }

                      handleFilterChange(newFilters);
                    }}
                    activeFilters={{
                      gender: filters.sex,
                      age:
                        filters.ageGroup &&
                        filters.sex &&
                        `${filters.ageGroup}-${filters.sex}`,
                      disability: filters.isPWD === "true",
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="mb-6">
            <CompactParticipantMetrics
              participants={metricsData}
              isLoading={isLoadingMetrics}
            />
          </div>
        </div>

        <ParticipantsTable
          data={participantsData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingParticipant={editingParticipant}
          handleSubmit={handleSubmit}
          onImportParticipants={handleImportParticipants}
          isLoading={isLoading || isLoadingParticipants}
          tableIsLoading={isLoadingParticipants}
          tableError={
            !participantsResult?.success ? participantsResult?.error : ""
          }
          projects={projects}
          organizations={clusterOrganizations}
          clusters={clusters}
          districts={districts}
          sexOptions={sexOptions}
          filters={filters}
          setFilters={handleFilterChange}
          pagination={participantsResult?.data?.pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}
