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
      <FilterSelect
        value={filters.district}
        onValueChange={value => updateFilter("district", value)}
        placeholder="District"
        options={districts}
        allLabel="All Districts"
      />

      {/* SubCounty Filter */}
      <FilterSelect
        value={filters.subCounty}
        onValueChange={value => updateFilter("subCounty", value)}
        placeholder="Sub County"
        options={subCounties}
        allLabel="All Sub Counties"
      />
    </>
  );
}
