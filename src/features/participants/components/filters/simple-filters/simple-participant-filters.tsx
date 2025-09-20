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
      <div className="flex flex-wrap items-center gap-3">
        <SearchFilter />

        <QuickFilters quickFilters={filterGroups.quick} />

        <MoreFiltersPopover
          filterGroups={filterGroups}
          projects={projects}
          organizations={organizations}
          districts={districts}
          subCounties={subCounties}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterBadges filterGroups={filterGroups} />
    </div>
  );
}
