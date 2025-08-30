"use client";

import { useFilterState } from "./use-filter-state";
import { FilterHeader } from "./filter-header";
import { OrganizationFilters } from "./organization-filters";
import { LocationFilters } from "./location-filters";
import { DemographicFilters } from "./demographic-filters";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface ParticipantFiltersProps {
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{
    id: string;
    name: string;
    acronym: string;
  }>;
  _clusters: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string }>;
  districts?: Array<{ id: string; name: string }>;
  subCounties?: Array<{ id: string; name: string }>;
  enterprises?: Array<{ id: string; name: string }>;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

export function ParticipantFilters({
  filters,
  onFiltersChange,
  projects,
  _clusters: _,
  organizations = [],
  districts = [],
  subCounties = [],
  enterprises = [],
  searchTerm: _searchTerm,
  onSearchChange: _onSearchChange,
}: ParticipantFiltersProps) {
  const { updateFilter, clearFilters, removeFilter, hasActiveFilters } =
    useFilterState({
      filters,
      onFiltersChange,
    });

  return (
    <div className="space-y-0">
      <FilterHeader
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        filters={filters}
        filterOptions={{
          projects,
          organizations,
          districts,
          subCounties,
          enterprises,
        }}
        onRemoveFilter={removeFilter}
      />

      <div className="flex flex-wrap items-center justify-between">
        <OrganizationFilters
          filters={filters}
          updateFilter={updateFilter}
          projects={projects}
          organizations={organizations}
          enterprises={enterprises}
        />

        <LocationFilters
          filters={filters}
          updateFilter={updateFilter}
          districts={districts}
          subCounties={subCounties}
        />

        <DemographicFilters filters={filters} updateFilter={updateFilter} />
      </div>
    </div>
  );
}
