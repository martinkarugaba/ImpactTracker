"use client";

import { FilterSelect } from "./filter-select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface OrganizationFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
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

  // Transform organizations to include acronym as label
  const organizationOptions = organizations.map(organization => ({
    id: organization.id,
    name: organization.name,
    label: organization.acronym,
  }));

  return (
    <>
      {/* Project Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Project
        </label>
        <FilterSelect
          value={filters.project}
          onValueChange={value => updateFilter("project", value)}
          placeholder="Select project..."
          options={projectOptions}
          allLabel="All Projects"
        />
      </div>

      {/* Organization Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Organization
        </label>
        <FilterSelect
          value={filters.organization}
          onValueChange={value => updateFilter("organization", value)}
          placeholder="Select organization..."
          options={organizationOptions}
          allLabel="All Organizations"
        />
      </div>

      {/* Enterprise Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Enterprise Type
        </label>
        <FilterSelect
          value={filters.enterprise}
          onValueChange={value => updateFilter("enterprise", value)}
          placeholder="Select enterprise..."
          options={enterprises}
          allLabel="All Enterprises"
        />
      </div>
    </>
  );
}
