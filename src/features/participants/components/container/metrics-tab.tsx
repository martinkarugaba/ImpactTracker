"use client";

import { TabsContent } from "@/components/ui/tabs";
import { CompactParticipantMetrics } from "../metrics/compact-participant-metrics";
import { ParticipantMetricsCharts } from "../metrics/participant-metrics-charts";
import {
  type Participant,
  type ParticipantFilters as ParticipantFiltersType,
} from "../../types/types";
import { ParticipantFilters } from "../filters";

interface MetricsTabProps {
  metricsParticipants: Participant[];
  isMetricsLoading: boolean;
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{ id: string; name: string; acronym: string }>;
  clusters: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string }>;
  filterOptions: {
    districts: Array<{ id: string; name: string }>;
    subCounties: Array<{ id: string; name: string }>;
    enterprises: Array<{ id: string; name: string }>;
  };
  searchValue: string;
  onSearchChange: (search: string) => void;
}

export function MetricsTab({
  metricsParticipants,
  isMetricsLoading,
  filters,
  onFiltersChange,
  projects,
  clusters,
  organizations,
  filterOptions,
  searchValue,
  onSearchChange,
}: MetricsTabProps) {
  return (
    <TabsContent value="metrics" className="space-y-6">
      {/* Metrics Cards */}
      <div className="space-y-3">
        {/* Metrics Header with Filter Status */}
        {(() => {
          const hasActiveFilters = Object.entries(filters).some(
            ([key, value]) => {
              if (key === "search") return value && value.trim() !== "";
              return value && value !== "all" && value !== "";
            }
          );

          if (hasActiveFilters) {
            return (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                  <span>Metrics reflect current filters</span>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <CompactParticipantMetrics
          participants={metricsParticipants}
          isLoading={isMetricsLoading}
        />
      </div>

      {/* Filters for Metrics */}
      <ParticipantFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        projects={projects}
        _clusters={clusters}
        organizations={organizations}
        districts={filterOptions.districts}
        subCounties={filterOptions.subCounties}
        enterprises={filterOptions.enterprises}
        searchTerm={searchValue}
        onSearchChange={onSearchChange}
      />

      {/* Charts */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Visual Analytics</h3>
        <ParticipantMetricsCharts
          participants={metricsParticipants}
          isLoading={isMetricsLoading}
        />
      </div>
    </TabsContent>
  );
}
