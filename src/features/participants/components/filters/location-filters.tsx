"use client";

import { FilterSelect } from "./filter-select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface LocationFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
  districts: Array<{ id: string; name: string }>;
  subCounties: Array<{ id: string; name: string }>;
}

export function LocationFilters({
  filters,
  updateFilter,
  districts,
  subCounties,
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
    </>
  );
}
