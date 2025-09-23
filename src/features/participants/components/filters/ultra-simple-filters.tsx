"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface UltraSimpleFiltersProps {
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  districts?: Array<{ id: string; name: string }>;
}

export function UltraSimpleFilters({
  filters,
  onFiltersChange,
  projects,
  organizations,
  districts = [],
}: UltraSimpleFiltersProps) {
  const updateFilter = (key: keyof ParticipantFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      project: "all",
      organization: "all",
      district: "all",
      sex: "all",
      ageGroup: "all",
      employmentStatus: "all",
      isSubscribedToVSLA: "all",
    });
  };

  const getActiveFiltersCount = () => {
    const activeKeys = [
      "project",
      "organization",
      "district",
      "sex",
      "ageGroup",
      "employmentStatus",
      "isSubscribedToVSLA",
    ];
    return activeKeys.filter(
      key => filters[key as keyof ParticipantFiltersType] !== "all"
    ).length;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="space-y-3">
      {/* Single Row Filter Bar */}
      <div className="flex items-center gap-3">
        {/* Search - Takes most space */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search participants by name, contact, or location..."
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Essential Quick Filters - Only the most used ones */}
        <Select
          value={filters.sex}
          onValueChange={value => updateFilter("sex", value)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.project}
          onValueChange={value => updateFilter("project", value)}
        >
          <SelectTrigger className="w-[120px]">
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

        {/* More Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Filter Participants
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Organization & Context */}
              <div className="space-y-4">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Organization & Context
                </h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    value={filters.project}
                    onValueChange={value => updateFilter("project", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.acronym})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization</label>
                  <Select
                    value={filters.organization}
                    onValueChange={value => updateFilter("organization", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.acronym})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Select
                    value={filters.district}
                    onValueChange={value => updateFilter("district", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Demographics */}
              <div className="space-y-4">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Demographics
                </h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <Select
                    value={filters.sex}
                    onValueChange={value => updateFilter("sex", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Age Group</label>
                  <Select
                    value={filters.ageGroup}
                    onValueChange={value => updateFilter("ageGroup", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="young">Youth (15-35)</SelectItem>
                      <SelectItem value="adult">Adults (36-59)</SelectItem>
                      <SelectItem value="older">Elderly (60+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Program Participation */}
              <div className="space-y-4">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Program Participation
                </h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Employment Status
                  </label>
                  <Select
                    value={filters.employmentStatus}
                    onValueChange={value =>
                      updateFilter("employmentStatus", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                      <SelectItem value="self-employed">
                        Self-Employed
                      </SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    VSLA Participation
                  </label>
                  <Select
                    value={filters.isSubscribedToVSLA}
                    onValueChange={value =>
                      updateFilter("isSubscribedToVSLA", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select participation..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Participants</SelectItem>
                      <SelectItem value="yes">VSLA Member</SelectItem>
                      <SelectItem value="no">Not VSLA Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear button when filters are active */}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeCount > 0 && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>
            {activeCount} filter{activeCount > 1 ? "s" : ""} applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
