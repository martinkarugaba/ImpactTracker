"use client";

import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface UseFilterStateProps {
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
}

export function useFilterState({
  filters,
  onFiltersChange,
}: UseFilterStateProps) {
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
      organization: "all",
      district: "all",
      subCounty: "all",
      enterprise: "all",
      sex: "all",
      isPWD: "all",
      ageGroup: "all",
      // New filter fields
      maritalStatus: "all",
      educationLevel: "all",
      isSubscribedToVSLA: "all",
      ownsEnterprise: "all",
      employmentType: "all",
      employmentSector: "all",
      hasVocationalSkills: "all",
      hasSoftSkills: "all",
      hasBusinessSkills: "all",
      // Specific skill filters
      specificVocationalSkill: "all",
      specificSoftSkill: "all",
      specificBusinessSkill: "all",
      populationSegment: "all",
      isActiveStudent: "all",
      isTeenMother: "all",
      sourceOfIncome: "all",
      // Enterprise specific filters
      enterpriseSector: "all",
      businessScale: "all",
      // Additional demographic filters
      nationality: "all",
      locationSetting: "all",
      isRefugee: "all",
      isMother: "all",
    });
  };

  const removeFilter = (key: keyof ParticipantFiltersType) => {
    const newFilters = {
      ...filters,
      [key]: key === "search" ? "" : "all",
    };
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "search") return false; // Exclude search from this check
    return value !== "" && value !== "all";
  });

  return {
    updateFilter,
    clearFilters,
    removeFilter,
    hasActiveFilters,
  };
}
