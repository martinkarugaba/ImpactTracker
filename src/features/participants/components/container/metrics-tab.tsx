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
    <TabsContent value="metrics" className="mt-6 space-y-6">
      {/* Enhanced Metrics Header */}
      <div className="space-y-4">
        {/* Metrics Status Indicator */}
        {(() => {
          const hasActiveFilters = Object.entries(filters).some(
            ([key, value]) => {
              if (key === "search") return value && value.trim() !== "";
              return value && value !== "all" && value !== "";
            }
          );

          if (hasActiveFilters) {
            return (
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Analytics reflect current filters
                  </span>
                </div>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Showing all participants data
                </span>
              </div>
            </div>
          );
        })()}

        {/* Metrics Cards with Enhanced Styling */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <CompactParticipantMetrics
            participants={metricsParticipants}
            isLoading={isMetricsLoading}
          />
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
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
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Visual Analytics
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <ParticipantMetricsCharts
            participants={metricsParticipants}
            isLoading={isMetricsLoading}
          />
        </div>
      </div>
    </TabsContent>
  );
}
