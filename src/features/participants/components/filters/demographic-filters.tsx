"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface DemographicFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
}

export function DemographicFilters({
  filters,
  updateFilter,
}: DemographicFiltersProps) {
  return (
    <>
      {/* Gender Filter */}
      <Select
        value={filters.sex}
        onValueChange={value => updateFilter("sex", value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genders</SelectItem>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
        </SelectContent>
      </Select>

      {/* PWD Filter */}
      <Select
        value={filters.isPWD}
        onValueChange={value => updateFilter("isPWD", value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="PWD Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="true">PWD</SelectItem>
          <SelectItem value="false">Not PWD</SelectItem>
        </SelectContent>
      </Select>

      {/* Age Group Filter */}
      <Select
        value={filters.ageGroup}
        onValueChange={value => updateFilter("ageGroup", value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Age Group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ages</SelectItem>
          <SelectItem value="young">15-35 Years</SelectItem>
          <SelectItem value="adult">36-59 Years</SelectItem>
          <SelectItem value="older">60+ Years</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
