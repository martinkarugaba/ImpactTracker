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
import { LocationFiltersInline } from "./location-filters-inline";
// import { AdvancedFilters } from "./advanced-filters"; // Disabled for now
import { type SimpleParticipantFiltersProps } from "./types";
import { Separator } from "@/components/ui/separator";

export function SimpleParticipantFilters({
  participants: _participants = [],
  isLoading = false,
  isFiltering: propIsFiltering = false,
  clusterId,
}: SimpleParticipantFiltersProps & { clusterId?: string }) {
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
        <div className="flex items-center gap-2 rounded-lg border border-blue-400 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800 shadow-sm dark:border-blue-600 dark:bg-blue-900/60 dark:text-blue-200">
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
          <Separator className="hidden md:block" orientation="vertical" />

          {/* Location Filters */}
          <LocationFiltersInline
            clusterId={clusterId}
            isLoading={isLoading || isFiltering}
          />

          {/* Separator for visual grouping */}
          <Separator className="hidden md:block" orientation="vertical" />

          {/* Inline Skills Filters */}
          <SkillsFilters
            clusterId={clusterId}
            isLoading={isLoading || isFiltering}
          />
        </div>
      </div>

      {/* Active Filter Badges */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Clear All Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilters()}
            disabled={isFiltering}
            className="h-7 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-900/50 dark:text-emerald-200 dark:ring-emerald-400/30">
              Search: "{filters.search}"
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200 text-emerald-700 hover:bg-emerald-300 dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700"
              >
                <X className="h-2.5 w-2.5" />
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
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 shadow-sm ring-1 ring-blue-600/20 ring-inset dark:bg-blue-900/50 dark:text-blue-200 dark:ring-blue-400/30"
                >
                  {option.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-blue-700 hover:bg-blue-300 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                  >
                    <X className="h-2.5 w-2.5" />
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
                  className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 shadow-sm ring-1 ring-green-600/20 ring-inset dark:bg-green-900/50 dark:text-green-200 dark:ring-green-400/30"
                >
                  {skillType}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-200 text-green-700 hover:bg-green-300 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              );
            }
            return null;
          })}

          {/* Location Filter Badges */}
          {[
            { key: "district", label: "District" },
            { key: "county", label: "County" },
            { key: "subCounty", label: "Sub County" },
            { key: "parish", label: "Parish" },
            { key: "village", label: "Village" },
          ].map(({ key, label }) => {
            const value = (filters as Record<string, string>)[key];
            if (value && value !== "all") {
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-800 shadow-sm ring-1 ring-orange-600/20 ring-inset dark:bg-orange-900/50 dark:text-orange-200 dark:ring-orange-400/30"
                >
                  {label}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-200 text-orange-700 hover:bg-orange-300 dark:bg-orange-800 dark:text-orange-200 dark:hover:bg-orange-700"
                  >
                    <X className="h-2.5 w-2.5" />
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
                  className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-800 shadow-sm ring-1 ring-purple-600/20 ring-inset dark:bg-purple-900/50 dark:text-purple-200 dark:ring-purple-400/30"
                >
                  {label}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-200 text-purple-700 hover:bg-purple-300 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700"
                  >
                    <X className="h-2.5 w-2.5" />
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
