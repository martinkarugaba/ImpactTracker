"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  participantFiltersAtom,
  updateFilterAtom,
  clearFiltersAtom,
} from "../../../atoms/participants-atoms";
import { SearchFilter } from "./search-filter";
import { QuickFilters } from "./quick-filters";
import { type SimpleParticipantFiltersProps } from "./types";

export function SimpleParticipantFilters({
  participants: _participants = [],
  isLoading = false,
  isFiltering = false,
}: SimpleParticipantFiltersProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);

  // Static quick filters - only the essential ones
  const quickFilters = [
    {
      key: "sex",
      label: "Gender",
      values: [
        { value: "all", label: "All" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    {
      key: "ageGroup",
      label: "Age",
      values: [
        { value: "all", label: "All Ages" },
        { value: "young", label: "Youth (15-35)" },
        { value: "adult", label: "Adults (36-59)" },
        { value: "older", label: "Elderly (60+)" },
      ],
    },
    {
      key: "employmentStatus",
      label: "Employment",
      values: [
        { value: "all", label: "All" },
        { value: "employed", label: "Employed" },
        { value: "unemployed", label: "Unemployed" },
        { value: "self-employed", label: "Self-Employed" },
      ],
    },
    {
      key: "isSubscribedToVSLA",
      label: "VSLA",
      values: [
        { value: "all", label: "All" },
        { value: "yes", label: "Member" },
        { value: "no", label: "Non-Member" },
      ],
    },
  ];

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return value !== "";
      return value !== "" && value !== "all";
    }).length;
  };

  // Function to remove individual filters
  const removeFilter = (key: string) => {
    if (key === "search") {
      updateFilter({ key: "search", value: "" });
    } else {
      updateFilter({ key: key as keyof typeof filters, value: "all" });
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="relative flex flex-wrap items-center gap-3">
        {/* Ultra-minimalistic Loading Indicator */}
        {isFiltering && (
          <div className="absolute -top-0.5 -right-0.5 z-10">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></div>
          </div>
        )}

        <SearchFilter isLoading={isLoading} />
        <QuickFilters quickFilters={quickFilters} isLoading={isLoading} />
      </div>

      {/* Active Filter Badges */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Clear All Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilters()}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>

          {/* Search Badge */}
          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-300/10 ring-inset">
              Search: "{filters.search}"
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                <X className="h-2 w-2" />
              </button>
            </span>
          )}

          {/* Quick Filter Badges */}
          {quickFilters.map(filter => {
            const currentValue = (filters as Record<string, string>)[
              filter.key
            ];
            if (currentValue && currentValue !== "all") {
              const option = filter.values.find(v => v.value === currentValue);
              return option ? (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset"
                >
                  {option.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </span>
              ) : null;
            }
            return null;
          })}

          {/* Skills Filter Badges */}
          {[
            "specificVocationalSkill",
            "specificSoftSkill",
            "specificBusinessSkill",
          ].map(key => {
            const value = (filters as Record<string, string>)[key];
            if (value && value !== "all") {
              const skillType = key
                .replace("specific", "")
                .replace("Skill", "");
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-700/10 ring-inset"
                >
                  {skillType}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-green-200 text-green-600 hover:bg-green-300"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </span>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
