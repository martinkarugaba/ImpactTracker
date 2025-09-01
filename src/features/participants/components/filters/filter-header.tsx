"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { type ParticipantFilters } from "../../types/types";

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filters: ParticipantFilters;
  filterOptions?: {
    projects: Array<{ id: string; name: string; acronym: string }>;
    organizations: Array<{ id: string; name: string }>;
    districts: Array<{ id: string; name: string }>;
    subCounties: Array<{ id: string; name: string }>;
    enterprises: Array<{ id: string; name: string }>;
  };
  onRemoveFilter: (key: keyof ParticipantFilters) => void;
}

export function FilterHeader({
  hasActiveFilters,
  onClearFilters,
  filters,
  filterOptions,
  onRemoveFilter,
}: FilterHeaderProps) {
  // Function to get display name for filter values
  const getFilterDisplayName = (
    key: keyof ParticipantFilters,
    value: string
  ): string => {
    if (!value || value === "all") return "";

    switch (key) {
      case "project":
        return (
          filterOptions?.projects.find(p => p.id === value)?.acronym || value
        );
      case "organization":
        return (
          filterOptions?.organizations.find(o => o.id === value)?.name || value
        );
      case "district":
        return (
          filterOptions?.districts.find(d => d.id === value)?.name || value
        );
      case "subCounty":
        return (
          filterOptions?.subCounties.find(s => s.id === value)?.name || value
        );
      case "enterprise":
        return (
          filterOptions?.enterprises.find(e => e.id === value)?.name || value
        );
      case "sex":
        return value === "M" ? "Male" : value === "F" ? "Female" : value;
      case "isPWD":
        return value === "yes" ? "PWD" : value === "no" ? "Not PWD" : value;
      case "ageGroup":
        return value.replace("_", "-") + " years";
      default:
        return value;
    }
  };

  // Get active filters for badges
  const activeFilters = Object.entries(filters)
    .filter(
      ([key, value]) => key !== "search" && value !== "" && value !== "all"
    )
    .map(([key, value]) => ({
      key: key as keyof ParticipantFilters,
      value,
      displayName: getFilterDisplayName(key as keyof ParticipantFilters, value),
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));

  return (
    <div className="border-border/40 bg-muted/30 flex items-center justify-between space-y-0 rounded-lg border p-3">
      {/* Active Filter Badges Container - Uses transform for zero layout shift */}
      <div className="flex-1 overflow-hidden">
        <div
          className={`transform transition-all duration-300 ease-in-out ${
            activeFilters.length > 0
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          style={{
            height: activeFilters.length > 0 ? "auto" : "0",
            marginBottom: activeFilters.length > 0 ? "0" : "0",
          }}
        >
          <div className="flex min-h-[2rem] flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Active filters:
            </span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={filter.key}
                variant="outline"
                className="bg-background border-border hover:bg-muted/50 animate-in fade-in-0 slide-in-from-left-1 flex items-center gap-1 px-2 py-1 text-xs duration-200"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span className="font-medium">{filter.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/20 hover:text-destructive h-3.5 w-3.5 cursor-pointer rounded-full p-0 transition-colors"
                  onClick={() => onRemoveFilter(filter.key)}
                >
                  <X className="h-2.5 w-2.5" />
                  <span className="sr-only">Remove {filter.label} filter</span>
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Clear All Button - Slides in smoothly when needed */}
      <div className="ml-4 overflow-hidden">
        <div
          className={`transform transition-all duration-300 ease-in-out ${
            hasActiveFilters
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          style={{
            height: hasActiveFilters ? "auto" : "0",
          }}
        >
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground h-8 px-3 text-sm transition-colors"
            >
              Clear all
              <X className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
