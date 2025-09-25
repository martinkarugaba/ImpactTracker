"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  participantFiltersAtom,
  updateFilterAtom,
  clearFiltersAtom,
  isFilteringAtom,
} from "../../../atoms/participants-atoms";
import { SearchFilter } from "./search-filter";
import { QuickFilters } from "./quick-filters";
import { SkillsFilters } from "./skills-filters";
// import { AdvancedFilters } from "./advanced-filters"; // Disabled for now
import { type SimpleParticipantFiltersProps } from "./types";

export function SimpleParticipantFilters({
  participants: _participants = [],
  isLoading = false,
  isFiltering: propIsFiltering = false,
}: SimpleParticipantFiltersProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);
  const isFiltering = useAtomValue(isFilteringAtom) || propIsFiltering;
  const [_showAdvancedFilters, _setShowAdvancedFilters] = useState(false); // Disabled for now

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

  // Skills filter count is now handled by the badge display logic below

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
      {/* Filtering Status Indicator */}
      {isFiltering && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Filtering participants...</span>
        </div>
      )}

      {/* Main Filter Bar */}
      <div
        className={`relative space-y-4 transition-opacity ${
          isFiltering ? "opacity-75" : "opacity-100"
        }`}
      >
        {/* Top Row: Search */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchFilter isLoading={isLoading || isFiltering} />
        </div>

        {/* Bottom Row: All Other Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Filters */}
          <QuickFilters
            quickFilters={quickFilters}
            isLoading={isLoading || isFiltering}
          />

          {/* Separator for visual grouping */}
          <div className="hidden h-8 w-px bg-gray-200 md:block" />

          {/* Inline Skills Filters */}
          <SkillsFilters isLoading={isLoading || isFiltering} />
        </div>
      </div>

      {/* Advanced Filters Toggle - Disabled for now */}
      {/* <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="h-8 px-3 text-sm text-gray-600 hover:text-gray-800"
        >
          {showAdvancedFilters ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Hide Advanced Filters
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show Advanced Filters
            </>
          )}
        </Button>
      </div> */}

      {/* Advanced Filters Section - Disabled for now */}
      {/* {showAdvancedFilters && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <AdvancedFilters isLoading={isLoading || isFiltering} />
        </div>
      )} */}

      {/* Active Filter Badges */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Clear All Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilters()}
            disabled={isFiltering}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFiltering ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Clearing...
              </>
            ) : (
              "Clear all"
            )}
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

          {/* Phase 1 Advanced Filter Badges */}
          {[
            { key: "monthlyIncomeRange", label: "Income" },
            { key: "numberOfChildrenRange", label: "Children" },
            { key: "noOfTrainingsRange", label: "Trainings" },
            { key: "employmentType", label: "Employment Type" },
            { key: "accessedLoans", label: "Loans" },
            { key: "individualSaving", label: "Individual Saving" },
            { key: "groupSaving", label: "Group Saving" },
          ].map(({ key, label }) => {
            const value = (filters as Record<string, string>)[key];
            if (value && value !== "all") {
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-700/10 ring-inset"
                >
                  {label}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-purple-200 text-purple-600 hover:bg-purple-300"
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
