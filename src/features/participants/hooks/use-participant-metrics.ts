"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllParticipantsForMetrics, getParticipants } from "../actions";
import { type ParticipantFilters } from "../types/types";

export function useParticipantMetrics(
  clusterId: string,
  filters?: ParticipantFilters,
  searchValue?: string
) {
  return useQuery({
    queryKey: [
      "participant-metrics",
      clusterId,
      filters ? JSON.stringify(filters) : "all",
      searchValue || "",
    ],
    queryFn: async () => {
      // Use searchValue parameter if provided, otherwise fall back to filters.search
      const effectiveSearch = searchValue || filters?.search || "";

      // Console logs for debugging
      console.log("🔍 useParticipantMetrics queryFn called with:", {
        filters,
        searchValue,
        effectiveSearch,
      });

      // Check if any meaningful filters are applied (excluding 'all' values)
      const hasActiveFilters =
        (filters &&
          Object.entries(filters).some(([key, value]) => {
            if (key === "search") return value && value.trim() !== "";
            return value && value !== "all" && value !== "";
          })) ||
        (effectiveSearch && effectiveSearch.trim() !== "");

      console.log("📊 hasActiveFilters:", hasActiveFilters);

      // If filters are provided and active, use the filtered getParticipants
      if (hasActiveFilters) {
        const result = await getParticipants(clusterId, {
          page: 1,
          limit: 10000, // Get all filtered participants for metrics
          search: effectiveSearch || undefined,
          filters: {
            project: filters?.project !== "all" ? filters?.project : undefined,
            organization:
              filters?.organization !== "all"
                ? filters?.organization
                : undefined,
            district:
              filters?.district !== "all" ? filters?.district : undefined,
            subCounty:
              filters?.subCounty !== "all" ? filters?.subCounty : undefined,
            county: filters?.county !== "all" ? filters?.county : undefined,
            parish: filters?.parish !== "all" ? filters?.parish : undefined,
            village: filters?.village !== "all" ? filters?.village : undefined,
            enterprise:
              filters?.enterprise !== "all" ? filters?.enterprise : undefined,
            sex: filters?.sex !== "all" ? filters?.sex : undefined,
            isPWD: filters?.isPWD !== "all" ? filters?.isPWD : undefined,
            ageGroup:
              filters?.ageGroup !== "all" ? filters?.ageGroup : undefined,
            maritalStatus:
              filters?.maritalStatus !== "all"
                ? filters?.maritalStatus
                : undefined,
            educationLevel:
              filters?.educationLevel !== "all"
                ? filters?.educationLevel
                : undefined,
            isSubscribedToVSLA:
              filters?.isSubscribedToVSLA !== "all"
                ? filters?.isSubscribedToVSLA
                : undefined,
            ownsEnterprise:
              filters?.ownsEnterprise !== "all"
                ? filters?.ownsEnterprise
                : undefined,
            employmentStatus:
              filters?.employmentStatus !== "all"
                ? filters?.employmentStatus
                : undefined,
            employmentSector:
              filters?.employmentSector !== "all"
                ? filters?.employmentSector
                : undefined,
            hasVocationalSkills:
              filters?.hasVocationalSkills !== "all"
                ? filters?.hasVocationalSkills
                : undefined,
            hasSoftSkills:
              filters?.hasSoftSkills !== "all"
                ? filters?.hasSoftSkills
                : undefined,
            hasBusinessSkills:
              filters?.hasBusinessSkills !== "all"
                ? filters?.hasBusinessSkills
                : undefined,
            specificVocationalSkill:
              filters?.specificVocationalSkill !== "all"
                ? filters?.specificVocationalSkill
                : undefined,
            specificSoftSkill:
              filters?.specificSoftSkill !== "all"
                ? filters?.specificSoftSkill
                : undefined,
            specificBusinessSkill:
              filters?.specificBusinessSkill !== "all"
                ? filters?.specificBusinessSkill
                : undefined,
            populationSegment:
              filters?.populationSegment !== "all"
                ? filters?.populationSegment
                : undefined,
            isActiveStudent:
              filters?.isActiveStudent !== "all"
                ? filters?.isActiveStudent
                : undefined,
            isTeenMother:
              filters?.isTeenMother !== "all"
                ? filters?.isTeenMother
                : undefined,
            sourceOfIncome:
              filters?.sourceOfIncome !== "all"
                ? filters?.sourceOfIncome
                : undefined,
            enterpriseSector:
              filters?.enterpriseSector !== "all"
                ? filters?.enterpriseSector
                : undefined,
            businessScale:
              filters?.businessScale !== "all"
                ? filters?.businessScale
                : undefined,
            nationality:
              filters?.nationality !== "all" ? filters?.nationality : undefined,
            locationSetting:
              filters?.locationSetting !== "all"
                ? filters?.locationSetting
                : undefined,
            isRefugee:
              filters?.isRefugee !== "all" ? filters?.isRefugee : undefined,
            isMother:
              filters?.isMother !== "all" ? filters?.isMother : undefined,
            monthlyIncomeRange:
              filters?.monthlyIncomeRange !== "all"
                ? filters?.monthlyIncomeRange
                : undefined,
            numberOfChildrenRange:
              filters?.numberOfChildrenRange !== "all"
                ? filters?.numberOfChildrenRange
                : undefined,
            noOfTrainingsRange:
              filters?.noOfTrainingsRange !== "all"
                ? filters?.noOfTrainingsRange
                : undefined,
            employmentType:
              filters?.employmentType !== "all"
                ? filters?.employmentType
                : undefined,
            accessedLoans:
              filters?.accessedLoans !== "all"
                ? filters?.accessedLoans
                : undefined,
            individualSaving:
              filters?.individualSaving !== "all"
                ? filters?.individualSaving
                : undefined,
            groupSaving:
              filters?.groupSaving !== "all" ? filters?.groupSaving : undefined,
          },
        });
        console.log(
          "🎯 Filtered participants for metrics:",
          result.data?.data?.length || 0
        );
        return result.data?.data || [];
      }

      // Otherwise get all participants for metrics
      console.log("📈 Using all participants for metrics");
      const result = await getAllParticipantsForMetrics(clusterId);
      console.log(
        "📊 All participants for metrics:",
        result.data?.data?.length || 0
      );
      return result.data?.data || [];
    },
    staleTime: 0, // Always fetch fresh data when filters change
  });
}
