"use client";

import { type Project } from "@/features/projects/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableFiltersProps {
  organizations: { id: string; name: string }[];
  projects: Project[];
  districts: string[];
  sexOptions: string[];
  filters: {
    cluster: string;
    project: string;
    district: string;
    sex: string;
    isPWD: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      cluster: string;
      project: string;
      district: string;
      sex: string;
      isPWD: string;
    }>
  >;
}

export function ParticipantTableFilters({
  organizations,
  projects,
  districts,
  sexOptions,
  filters,
  setFilters,
}: TableFiltersProps) {
  return (
    <div className="w-full space-y-4 p-6">
      <h2 className="text-lg font-semibold">Filters</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {/* View Selector */}
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="active">Active Participants</SelectItem>
            <SelectItem value="by-district">By District</SelectItem>
          </SelectContent>
        </Select>

        {/* Cluster filter */}
        <Select
          value={filters.cluster || "all"}
          onValueChange={value =>
            setFilters(prev => ({
              ...prev,
              cluster: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cluster" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Project filter */}
        <Select
          value={filters.project || "all"}
          onValueChange={value =>
            setFilters(prev => ({
              ...prev,
              project: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.acronym}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District filter */}
        <Select
          value={filters.district || "all"}
          onValueChange={value =>
            setFilters(prev => ({
              ...prev,
              district: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(district => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender filter */}
        <Select
          value={filters.sex || "all"}
          onValueChange={value =>
            setFilters(prev => ({
              ...prev,
              sex: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            {sexOptions.map(sex => (
              <SelectItem key={sex} value={sex}>
                {sex.charAt(0).toUpperCase() + sex.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
