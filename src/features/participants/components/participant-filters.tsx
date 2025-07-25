"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  projects: Array<{ id: string; name: string }>;
  _clusters: Array<{ id: string; name: string }>;
  _organizations: Array<{ id: string; name: string }>;
}

export function ParticipantFilters({
  filters,
  onFiltersChange,
  projects,
  _clusters,
  _organizations,
}: ParticipantFiltersProps) {
  const updateFilter = (key: keyof ParticipantFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
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
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== "" && value !== "all"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Clear filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search participants..."
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            className="h-9"
          />
        </div>

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
                {project.name}
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
            <SelectItem value="young">Youth (18-35)</SelectItem>
            <SelectItem value="adult">Adult (36-59)</SelectItem>
            <SelectItem value="elder">Elder (60+)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
