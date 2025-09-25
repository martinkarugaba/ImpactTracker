"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ParticipantFormValues } from "../components/participant-form";
import {
  getParticipants,
  getAllParticipantsForMetrics,
  getAllFilteredParticipantsForExport,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from "../actions";
import { importParticipants } from "../actions/import-participants";
import { type NewParticipant } from "../types/types";

export function useParticipants(
  clusterId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      cluster?: string;
      project?: string;
      organization?: string;
      district?: string;
      subCounty?: string;
      enterprise?: string;
      sex?: string;
      isPWD?: string;
      ageGroup?: string;
      maritalStatus?: string;
      educationLevel?: string;
      isSubscribedToVSLA?: string;
      ownsEnterprise?: string;
      employmentStatus?: string;
      employmentSector?: string;
      hasVocationalSkills?: string;
      hasSoftSkills?: string;
      hasBusinessSkills?: string;
      populationSegment?: string;
      isActiveStudent?: string;
      isTeenMother?: string;
      sourceOfIncome?: string;
      // Enterprise specific filters
      enterpriseSector?: string;
      businessScale?: string;
      // Additional demographic filters
      nationality?: string;
      locationSetting?: string;
      isRefugee?: string;
      isMother?: string;
      // Specific skills filters
      specificVocationalSkill?: string;
      specificSoftSkill?: string;
      specificBusinessSkill?: string;
      // Phase 1 Enhanced Filters
      monthlyIncomeRange?: string;
      numberOfChildrenRange?: string;
      noOfTrainingsRange?: string;
      employmentType?: string;
      accessedLoans?: string;
      individualSaving?: string;
      groupSaving?: string;
    };
  }
) {
  // Create a stable serialized key for filters to ensure React Query detects changes
  const filtersKey = params?.filters ? JSON.stringify(params.filters) : null;

  // Additional key for specific skills to ensure they trigger refetch
  const skillsKey = params?.filters
    ? [
        params.filters.specificVocationalSkill,
        params.filters.specificSoftSkill,
        params.filters.specificBusinessSkill,
      ].join("|")
    : null;

  return useQuery({
    queryKey: [
      "participants",
      clusterId,
      params?.page,
      params?.limit, // used as pageSize in the API call
      params?.search,
      filtersKey, // Use serialized filters
      skillsKey, // Specific key for skills to ensure refetch
    ],
    queryFn: () => {
      console.log("🚀 React Query executing getParticipants with params:", {
        clusterId,
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        filters: params?.filters,
      });
      return getParticipants(clusterId, params);
    },
    staleTime: 0, // Always fetch fresh data when parameters change
    placeholderData: prevData => prevData, // This will keep the previous data while loading new data
  });
}

export function useParticipantsMetrics(
  clusterId: string,
  params?: {
    filters?: {
      cluster?: string;
      project?: string;
      organization?: string;
      district?: string;
      subCounty?: string;
      enterprise?: string;
      sex?: string;
      isPWD?: string;
      ageGroup?: string;
      maritalStatus?: string;
      educationLevel?: string;
      isSubscribedToVSLA?: string;
      ownsEnterprise?: string;
      employmentStatus?: string;
      employmentSector?: string;
      hasVocationalSkills?: string;
      hasSoftSkills?: string;
      hasBusinessSkills?: string;
      populationSegment?: string;
      isActiveStudent?: string;
      isTeenMother?: string;
      sourceOfIncome?: string;
      // Enterprise specific filters
      enterpriseSector?: string;
      businessScale?: string;
      // Additional demographic filters
      nationality?: string;
      locationSetting?: string;
      isRefugee?: string;
      isMother?: string;
      // Specific skills filters
      specificVocationalSkill?: string;
      specificSoftSkill?: string;
      specificBusinessSkill?: string;
    };
    applyFilters: boolean;
  }
) {
  return useQuery({
    queryKey: [
      "participants-metrics",
      clusterId,
      params?.applyFilters ? JSON.stringify(params?.filters) : "all",
    ],
    queryFn: () =>
      params?.applyFilters
        ? getParticipants(clusterId, { filters: params?.filters })
        : getAllParticipantsForMetrics(clusterId),
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewParticipant) => createParticipant(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", variables.cluster_id],
      });
    },
  });
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewParticipant }) =>
      updateParticipant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", variables.data.cluster_id],
      });
    },
  });
}

export function useDeleteParticipant(clusterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteParticipant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["participants", clusterId],
      });
    },
  });
}

export function useBulkCreateParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participants: ParticipantFormValues[]) => {
      const result = await importParticipants(participants);
      if (!result.success) {
        throw new Error(result.error || "Failed to import participants");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Assuming all participants are for the same cluster
      if (variables[0]) {
        queryClient.invalidateQueries({
          queryKey: ["participants", variables[0].cluster_id],
        });
      }
    },
  });
}

export function useExportParticipants() {
  return useMutation({
    mutationFn: async (params: {
      clusterId: string;
      filters?: {
        cluster?: string;
        project?: string;
        organization?: string;
        district?: string;
        subCounty?: string;
        enterprise?: string;
        sex?: string;
        isPWD?: string;
        ageGroup?: string;
        maritalStatus?: string;
        educationLevel?: string;
        isSubscribedToVSLA?: string;
        ownsEnterprise?: string;
        employmentStatus?: string;
        employmentSector?: string;
        hasVocationalSkills?: string;
        hasSoftSkills?: string;
        hasBusinessSkills?: string;
        populationSegment?: string;
        isActiveStudent?: string;
        isTeenMother?: string;
        sourceOfIncome?: string;
        // Enterprise specific filters
        enterpriseSector?: string;
        businessScale?: string;
        // Additional demographic filters
        nationality?: string;
        locationSetting?: string;
        isRefugee?: string;
        isMother?: string;
        // Specific skills filters
        specificVocationalSkill?: string;
        specificSoftSkill?: string;
        specificBusinessSkill?: string;
      };
      search?: string;
    }) => {
      const result = await getAllFilteredParticipantsForExport(
        params.clusterId,
        params.filters,
        params.search
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to export participants");
      }
      return result.data?.data || [];
    },
  });
}
