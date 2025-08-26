"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { type ParticipantFilters as ParticipantFiltersType } from "../types/types";

interface ParticipantFiltersProps {
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{
    id: string;
    name: string;
    acronym: string;
  }>;
  _clusters: Array<{ id: string; name: string }>;
  _organizations: Array<{ id: string; name: string }>;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

export function ParticipantFilters({
  filters,
  onFiltersChange,
  projects,
  _clusters,
  _organizations,
  searchTerm: _searchTerm,
  onSearchChange: _onSearchChange,
}: ParticipantFiltersProps) {
  const updateFilter = (key: keyof ParticipantFiltersType, value: string) => {
    console.log(`🔧 Filter update: ${key} = ${value}`);
    const newFilters = {
      ...filters,
      [key]: value,
    };
    console.log("🔧 New filters state:", newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      project: "all",
      district: "all",
      sex: "all",
      isPWD: "all",
      ageGroup: "all",
    });
    // Search is now handled in the data table header
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "search") return false; // Exclude search from this check
    return value !== "" && value !== "all";
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Project Filter */}
        <Select
          value={filters.project}
          onValueChange={value => updateFilter("project", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Project" />
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
      </div>
    </div>
  );
}
