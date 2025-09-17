"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useParticipants } from "../hooks/use-participants";
import { useParticipantMetrics } from "../hooks/use-participant-metrics";
import { useLocationNames } from "../hooks/use-location-names";
import { useParticipantState } from "./use-participant-state";
import { type Participant, type ParticipantsResponse } from "../types/types";
import { getAllFilteredParticipantsForExport } from "../actions";
import {
  participantsToCSV,
  downloadCSV,
  participantsToExcel,
  downloadExcel,
  generateExportFilename,
} from "../lib/export-utils";
import toast from "react-hot-toast";

interface UseParticipantContainerJotaiProps {
  clusterId: string;
}

/**
 * Jotai-based container hook that replaces the old useState-based approach
 * Integrates Jotai state management with data fetching
 */
export function useParticipantContainerJotai({
  clusterId,
}: UseParticipantContainerJotaiProps) {
  const router = useRouter();

  // Get all state from Jotai atoms
  const {
    filters,
    pagination,
    searchValue,
    activeTab,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingParticipant,
    setEditingParticipant,
    deletingParticipant,
    setDeletingParticipant,
    handlePaginationChange,
    handleSearchChange,
    handleEdit,
    handleDelete,
  } = useParticipantState();

  // Data fetching with Jotai state
  const {
    data: participantsData,
    isLoading: isParticipantsLoading,
    error: participantsError,
  } = useParticipants(clusterId, {
    page: pagination.page,
    limit: pagination.pageSize,
    search: searchValue || undefined,
    filters: {
      project: filters.project !== "all" ? filters.project : undefined,
      organization:
        filters.organization !== "all" ? filters.organization : undefined,
      district: filters.district !== "all" ? filters.district : undefined,
      subCounty: filters.subCounty !== "all" ? filters.subCounty : undefined,
      enterprise: filters.enterprise !== "all" ? filters.enterprise : undefined,
      sex: filters.sex !== "all" ? filters.sex : undefined,
      isPWD: filters.isPWD !== "all" ? filters.isPWD : undefined,
      ageGroup: filters.ageGroup !== "all" ? filters.ageGroup : undefined,
      maritalStatus:
        filters.maritalStatus !== "all" ? filters.maritalStatus : undefined,
      educationLevel:
        filters.educationLevel !== "all" ? filters.educationLevel : undefined,
      isSubscribedToVSLA:
        filters.isSubscribedToVSLA !== "all"
          ? filters.isSubscribedToVSLA
          : undefined,
      ownsEnterprise:
        filters.ownsEnterprise !== "all" ? filters.ownsEnterprise : undefined,
      employmentType:
        filters.employmentType !== "all" ? filters.employmentType : undefined,
      employmentSector:
        filters.employmentSector !== "all"
          ? filters.employmentSector
          : undefined,
      hasVocationalSkills:
        filters.hasVocationalSkills !== "all"
          ? filters.hasVocationalSkills
          : undefined,
      hasSoftSkills:
        filters.hasSoftSkills !== "all" ? filters.hasSoftSkills : undefined,
      hasBusinessSkills:
        filters.hasBusinessSkills !== "all"
          ? filters.hasBusinessSkills
          : undefined,
      populationSegment:
        filters.populationSegment !== "all"
          ? filters.populationSegment
          : undefined,
      isActiveStudent:
        filters.isActiveStudent !== "all" ? filters.isActiveStudent : undefined,
      isTeenMother:
        filters.isTeenMother !== "all" ? filters.isTeenMother : undefined,
      sourceOfIncome:
        filters.sourceOfIncome !== "all" ? filters.sourceOfIncome : undefined,
      enterpriseSector:
        filters.enterpriseSector !== "all"
          ? filters.enterpriseSector
          : undefined,
      businessScale:
        filters.businessScale !== "all" ? filters.businessScale : undefined,
      nationality:
        filters.nationality !== "all" ? filters.nationality : undefined,
      locationSetting:
        filters.locationSetting !== "all" ? filters.locationSetting : undefined,
      isRefugee: filters.isRefugee !== "all" ? filters.isRefugee : undefined,
      isMother: filters.isMother !== "all" ? filters.isMother : undefined,
    },
  });

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useParticipantMetrics(
    clusterId,
    {
      ...filters,
      search: searchValue || filters.search,
    },
    searchValue
  );

  // Computed values
  const participants = useMemo(() => {
    const data = participantsData as ParticipantsResponse;
    return data?.success ? data.data?.data || [] : [];
  }, [participantsData]);

  const metricsParticipants = metricsData || [];

  // Extract unique location IDs for batch fetching
  const locationIds = useMemo(() => {
    const districtIds = [
      ...new Set(
        participants.map((p: Participant) => p.district).filter(Boolean)
      ),
    ] as string[];
    const subCountyIds = [
      ...new Set(
        participants.map((p: Participant) => p.subCounty).filter(Boolean)
      ),
    ] as string[];
    const countryIds = [
      ...new Set(
        participants.map((p: Participant) => p.country).filter(Boolean)
      ),
    ] as string[];

    return { districtIds, subCountyIds, countryIds };
  }, [participants]);

  // Batch fetch all location names
  const locationNames = useLocationNames(
    locationIds.districtIds,
    locationIds.subCountyIds,
    locationIds.countryIds
  );

  const handleView = (participant: Participant) => {
    router.push(`/dashboard/participants/${participant.id}`);
  };

  // Export functionality
  const handleExport = async (format: "csv" | "excel" = "csv") => {
    try {
      toast.loading("Preparing export...");

      // Create export filters from current filters (only include non-"all" values)
      const exportFilters = {
        project: filters.project !== "all" ? filters.project : undefined,
        organization:
          filters.organization !== "all" ? filters.organization : undefined,
        district: filters.district !== "all" ? filters.district : undefined,
        subCounty: filters.subCounty !== "all" ? filters.subCounty : undefined,
        enterprise:
          filters.enterprise !== "all" ? filters.enterprise : undefined,
        sex: filters.sex !== "all" ? filters.sex : undefined,
        isPWD: filters.isPWD !== "all" ? filters.isPWD : undefined,
        ageGroup: filters.ageGroup !== "all" ? filters.ageGroup : undefined,
        maritalStatus:
          filters.maritalStatus !== "all" ? filters.maritalStatus : undefined,
        educationLevel:
          filters.educationLevel !== "all" ? filters.educationLevel : undefined,
        isSubscribedToVSLA:
          filters.isSubscribedToVSLA !== "all"
            ? filters.isSubscribedToVSLA
            : undefined,
        ownsEnterprise:
          filters.ownsEnterprise !== "all" ? filters.ownsEnterprise : undefined,
        employmentType:
          filters.employmentType !== "all" ? filters.employmentType : undefined,
        employmentSector:
          filters.employmentSector !== "all"
            ? filters.employmentSector
            : undefined,
        hasVocationalSkills:
          filters.hasVocationalSkills !== "all"
            ? filters.hasVocationalSkills
            : undefined,
        hasSoftSkills:
          filters.hasSoftSkills !== "all" ? filters.hasSoftSkills : undefined,
        hasBusinessSkills:
          filters.hasBusinessSkills !== "all"
            ? filters.hasBusinessSkills
            : undefined,
        specificVocationalSkill:
          filters.specificVocationalSkill !== "all"
            ? filters.specificVocationalSkill
            : undefined,
        specificSoftSkill:
          filters.specificSoftSkill !== "all"
            ? filters.specificSoftSkill
            : undefined,
        specificBusinessSkill:
          filters.specificBusinessSkill !== "all"
            ? filters.specificBusinessSkill
            : undefined,
        populationSegment:
          filters.populationSegment !== "all"
            ? filters.populationSegment
            : undefined,
        isActiveStudent:
          filters.isActiveStudent !== "all"
            ? filters.isActiveStudent
            : undefined,
        isTeenMother:
          filters.isTeenMother !== "all" ? filters.isTeenMother : undefined,
        sourceOfIncome:
          filters.sourceOfIncome !== "all" ? filters.sourceOfIncome : undefined,
        enterpriseSector:
          filters.enterpriseSector !== "all"
            ? filters.enterpriseSector
            : undefined,
        businessScale:
          filters.businessScale !== "all" ? filters.businessScale : undefined,
        nationality:
          filters.nationality !== "all" ? filters.nationality : undefined,
        locationSetting:
          filters.locationSetting !== "all"
            ? filters.locationSetting
            : undefined,
        isRefugee: filters.isRefugee !== "all" ? filters.isRefugee : undefined,
        isMother: filters.isMother !== "all" ? filters.isMother : undefined,
      };

      // Get all filtered participants for export
      const exportData = await getAllFilteredParticipantsForExport(
        clusterId,
        exportFilters,
        searchValue || undefined
      );

      toast.dismiss();

      if (!exportData.success || !exportData.data) {
        toast.error("Failed to export participants data");
        return;
      }

      const exportParticipants = exportData.data.data;

      if (exportParticipants.length === 0) {
        toast.error("No participants found with current filters");
        return;
      }

      // Convert and download based on format
      if (format === "excel") {
        const excelContent = participantsToExcel(exportParticipants);
        const filename = generateExportFilename(
          "participants",
          exportFilters,
          "excel"
        );
        downloadExcel(excelContent, filename);
        toast.success(
          `Exported ${exportParticipants.length} participants to ${filename}`
        );
      } else {
        const csvContent = participantsToCSV(exportParticipants);
        const filename = generateExportFilename(
          "participants",
          exportFilters,
          "csv"
        );
        downloadCSV(csvContent, filename);
        toast.success(
          `Exported ${exportParticipants.length} participants to ${filename}`
        );
      }
    } catch (error) {
      toast.dismiss();
      console.error("Export error:", error);
      toast.error("Failed to export participants data");
    }
  };

  return {
    // State (from Jotai atoms)
    filters,
    pagination,
    searchValue,
    activeTab,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingParticipant,
    setEditingParticipant,
    deletingParticipant,
    setDeletingParticipant,

    // Data
    participants,
    metricsParticipants,
    participantsData,
    locationNames,

    // Loading & Error states
    isParticipantsLoading,
    isMetricsLoading,
    participantsError,
    metricsError,

    // Event handlers
    handlePaginationChange,
    handleSearchChange,
    handleEdit,
    handleDelete,
    handleView,
    handleExport,
  };
}
