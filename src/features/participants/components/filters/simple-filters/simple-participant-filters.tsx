"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { participantFiltersAtom } from "../../../atoms/participants-atoms";
import { SearchFilter } from "./search-filter";
import { QuickFilters } from "./quick-filters";
import { MoreFiltersPopover } from "./more-filters-popover";
import { ActiveFilterBadges } from "./active-filter-badges";
import { generateDynamicFilterOptions } from "./utils";
import { type SimpleParticipantFiltersProps } from "./types";
import { ParticipantFiltersLoadingSkeleton } from "../filter-loading-skeleton";

export function SimpleParticipantFilters({
  projects,
  organizations,
  districts = [],
  subCounties = [],
  participants = [],
  isLoading = false,
}: SimpleParticipantFiltersProps) {
  const filters = useAtomValue(participantFiltersAtom);

  // Generate organized filter options based on actual data
  const filterGroups = useMemo(
    () => generateDynamicFilterOptions(participants),
    [participants]
  );

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false;
      return value !== "" && value !== "all";
    }).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <ParticipantFiltersLoadingSkeleton />;
  }

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="relative flex flex-wrap items-center gap-3">
        {/* Loading Indicator for Quick Filters */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-start bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
            <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 shadow-sm dark:bg-gray-800">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Applying filters...
              </span>
            </div>
          </div>
        )}

        <SearchFilter isLoading={isLoading} />
        <QuickFilters quickFilters={filterGroups.quick} isLoading={isLoading} />
        <MoreFiltersPopover
          filterGroups={filterGroups}
          projects={projects}
          organizations={organizations}
          districts={districts}
          subCounties={subCounties}
          activeFiltersCount={activeFiltersCount}
          isLoading={isLoading}
        />
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterBadges filterGroups={filterGroups} />
    </div>
  );
}
