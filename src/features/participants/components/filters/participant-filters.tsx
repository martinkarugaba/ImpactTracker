"use client";

import { useFilterState } from "./use-filter-state";
import { FilterHeader } from "./filter-header";
import { OrganizationFilters } from "./organization-filters";
import { LocationFilters } from "./location-filters";
import { DemographicFilters } from "./demographic-filters";
import { VSLAFilters } from "./vsla-filters";
import { EnterpriseFilters } from "./enterprise-filters";
import { SkillsFilters } from "./skills-filters";
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
  organizations: Array<{ id: string; name: string; acronym: string }>;
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
      {/* Filter Header - Only show when there are active filters */}
      <div className="overflow-hidden">
        <div
          className={`transform transition-all duration-300 ease-in-out ${
            hasActiveFilters
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          style={{
            height: hasActiveFilters ? "auto" : "0",
            marginBottom: hasActiveFilters ? "1rem" : "0",
          }}
        >
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
        </div>
      </div>

      {/* Filter Controls - Always visible */}
      <div className="space-y-6">
        {/* Filter Section 1: Organization & Project Context */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-blue-500"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Organization & Project
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OrganizationFilters
              filters={filters}
              updateFilter={updateFilter}
              projects={projects}
              organizations={organizations}
              enterprises={enterprises}
            />
          </div>
        </div>

        {/* Filter Section 2: Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-green-500"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Location
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LocationFilters
              filters={filters}
              updateFilter={updateFilter}
              districts={districts}
              subCounties={subCounties}
            />
          </div>
        </div>

        {/* Filter Section 3: Demographics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-purple-500"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Demographics & Personal
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DemographicFilters filters={filters} updateFilter={updateFilter} />
          </div>
        </div>

        {/* Filter Section 4: Financial & VSLA */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-orange-500"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Financial & VSLA
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <VSLAFilters filters={filters} updateFilter={updateFilter} />
          </div>
        </div>

        {/* Filter Section 5: Enterprise & Employment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-red-500"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Business & Employment
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <EnterpriseFilters filters={filters} updateFilter={updateFilter} />
          </div>
        </div>

        {/* Filter Section 6: Skills & Development */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-teal-500"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Skills & Development
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SkillsFilters filters={filters} updateFilter={updateFilter} />
          </div>
        </div>
      </div>
    </div>
  );
}
