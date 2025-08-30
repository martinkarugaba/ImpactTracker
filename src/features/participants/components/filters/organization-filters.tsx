"use client";

import { FilterSelect } from "./filter-select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface OrganizationFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string }>;
  enterprises: Array<{ id: string; name: string }>;
}

export function OrganizationFilters({
  filters,
  updateFilter,
  projects,
  organizations,
  enterprises,
}: OrganizationFiltersProps) {
  // Transform projects to include acronym as label
  const projectOptions = projects.map(project => ({
    id: project.id,
    name: project.name,
    label: project.acronym,
  }));

  return (
    <>
      {/* Project Filter */}
      <FilterSelect
        value={filters.project}
        onValueChange={value => updateFilter("project", value)}
        placeholder="Project"
        options={projectOptions}
        allLabel="All Projects"
      />

      {/* Organization Filter */}
      <FilterSelect
        value={filters.organization}
        onValueChange={value => updateFilter("organization", value)}
        placeholder="Organization"
        options={organizations}
        allLabel="All Organizations"
      />

      {/* Enterprise Filter */}
      <FilterSelect
        value={filters.enterprise}
        onValueChange={value => updateFilter("enterprise", value)}
        placeholder="Enterprise"
        options={enterprises}
        allLabel="All Enterprises"
      />
    </>
  );
}
