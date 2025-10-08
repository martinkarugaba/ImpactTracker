"use client";

import { FilterSelect } from "./filter-select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface LocationFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
  districts: Array<{ id: string; name: string }>;
  subCounties: Array<{ id: string; name: string }>;
  counties?: Array<{ id: string; name: string }>;
  parishes?: Array<{ id: string; name: string }>;
  villages?: Array<{ id: string; name: string }>;
}

export function LocationFilters({
  filters,
  updateFilter,
  districts,
  subCounties,
  counties = [],
  parishes = [],
  villages = [],
}: LocationFiltersProps) {
  return (
    <>
      {/* District Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          District
        </label>
        <FilterSelect
          value={filters.district}
          onValueChange={value => updateFilter("district", value)}
          placeholder="Select district..."
          options={districts}
          allLabel="All Districts"
        />
      </div>

      {/* County Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          County
        </label>
        <FilterSelect
          value={filters.county}
          onValueChange={value => updateFilter("county", value)}
          placeholder="Select county..."
          options={counties}
          allLabel="All Counties"
        />
      </div>

      {/* SubCounty Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Sub County
        </label>
        <FilterSelect
          value={filters.subCounty}
          onValueChange={value => updateFilter("subCounty", value)}
          placeholder="Select sub county..."
          options={subCounties}
          allLabel="All Sub Counties"
        />
      </div>

      {/* Parish Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Parish
        </label>
        <FilterSelect
          value={filters.parish}
          onValueChange={value => updateFilter("parish", value)}
          placeholder="Select parish..."
          options={parishes}
          allLabel="All Parishes"
        />
      </div>

      {/* Village Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Village
        </label>
        <FilterSelect
          value={filters.village}
          onValueChange={value => updateFilter("village", value)}
          placeholder="Select village..."
          options={villages}
          allLabel="All Villages"
        />
      </div>
    </>
  );
}
