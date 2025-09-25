"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useParticipants } from "../hooks/use-participants";
import { useParticipantMetrics } from "../hooks/use-participant-metrics";
import { useLocationNames } from "../hooks/use-location-names";
import {
  participantFiltersAtom,
  participantPaginationAtom,
  participantSearchAtom,
  activeTabAtom,
  createDialogAtom,
  importDialogAtom,
  editingParticipantAtom,
  deletingParticipantAtom,
  updateFilterAtom,
  isFilteringAtom,
  clearFilteringAtom,
} from "../atoms/participants-atoms";
import {
  type Participant,
  type ParticipantsResponse,
  type ParticipantFilters,
} from "../types/types";
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
  const [filters] = useAtom(participantFiltersAtom);
  const [, updateFilter] = useAtom(updateFilterAtom);
  const [pagination, setPagination] = useAtom(participantPaginationAtom);
  const [searchValue, setSearchValue] = useAtom(participantSearchAtom);
  const [activeTab] = useAtom(activeTabAtom);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useAtom(createDialogAtom);
  const [isImportDialogOpen, setIsImportDialogOpen] = useAtom(importDialogAtom);
  const [editingParticipant, setEditingParticipant] = useAtom(
    editingParticipantAtom
  );
  const [deletingParticipant, setDeletingParticipant] = useAtom(
    deletingParticipantAtom
  );
  const [isFiltering] = useAtom(isFilteringAtom);
  const [, clearFiltering] = useAtom(clearFilteringAtom);

  const handleFiltersChange = (newFilters: ParticipantFilters) => {
    // Check if any filters are actually changing
    const hasChanges = Object.entries(newFilters).some(
      ([key, value]) => filters[key as keyof ParticipantFilters] !== value
    );

    if (hasChanges) {
      // Update each filter individually using the updateFilterAtom
      // The updateFilterAtom will automatically set isFiltering to true
      Object.entries(newFilters).forEach(([key, value]) => {
        if (filters[key as keyof ParticipantFilters] !== value) {
          updateFilter({ key: key as keyof ParticipantFilters, value });
        }
      });
    }
  };

  // Event handlers
  const handlePaginationChange = (newPage: number, newPageSize?: number) => {
    setPagination(prev => ({
      page: newPage,
      pageSize: newPageSize || prev.pageSize,
    }));
  };

  const handleSearchChange = (newSearch: string) => {
    // Set filtering state when search changes
    clearFiltering(); // Clear any existing filtering state
    if (newSearch !== searchValue) {
      updateFilter({ key: "search", value: newSearch });
    }
    setSearchValue(newSearch);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
  };

  const handleDelete = (participant: Participant) => {
    setDeletingParticipant(participant);
  };

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
      employmentStatus:
        filters.employmentStatus !== "all"
          ? filters.employmentStatus
          : undefined,
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
      // Specific skills filters
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
      // Phase 1 Enhanced Filters
      monthlyIncomeRange:
        filters.monthlyIncomeRange !== "all"
          ? filters.monthlyIncomeRange
          : undefined,
      numberOfChildrenRange:
        filters.numberOfChildrenRange !== "all"
          ? filters.numberOfChildrenRange
          : undefined,
      noOfTrainingsRange:
        filters.noOfTrainingsRange !== "all"
          ? filters.noOfTrainingsRange
          : undefined,
      employmentType:
        filters.employmentType !== "all" ? filters.employmentType : undefined,
      accessedLoans:
        filters.accessedLoans !== "all" ? filters.accessedLoans : undefined,
      individualSaving:
        filters.individualSaving !== "all"
          ? filters.individualSaving
          : undefined,
      groupSaving:
        filters.groupSaving !== "all" ? filters.groupSaving : undefined,
    },
  });

  // Debug logging for filters being passed to backend
  useEffect(() => {
    const activeFilters = {
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
    };

    const hasActiveSkillsFilters = Object.values(activeFilters).some(
      value => value !== undefined
    );

    if (hasActiveSkillsFilters) {
      console.log(
        "🎯 Active skills filters being sent to backend:",
        activeFilters
      );
      console.log("🎯 Full filters object:", filters);
      console.log("🎯 Query params being sent:", {
        page: pagination.page,
        limit: pagination.pageSize,
        search: searchValue || undefined,
        filters: {
          // Show all filters that would be sent to backend
          specificVocationalSkill: activeFilters.specificVocationalSkill,
          specificSoftSkill: activeFilters.specificSoftSkill,
          specificBusinessSkill: activeFilters.specificBusinessSkill,
        },
      });
    }
  }, [
    filters.specificVocationalSkill,
    filters.specificSoftSkill,
    filters.specificBusinessSkill,
    filters,
    pagination.page,
    pagination.pageSize,
    searchValue,
  ]);

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

  // Enhanced filtering state management
  // The isFilteringAtom is automatically set to true by updateFilterAtom when filters change
  // and cleared when data loading completes below

  // Clear filtering state when data finishes loading
  useEffect(() => {
    if (!isParticipantsLoading && (participantsData || participantsError)) {
      // Add a small delay to ensure smooth UX
      const timeoutId = setTimeout(() => {
        clearFiltering();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [
    isParticipantsLoading,
    participantsData,
    participantsError,
    clearFiltering,
  ]);

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
        employmentStatus:
          filters.employmentStatus !== "all"
            ? filters.employmentStatus
            : undefined,
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
        // Phase 1 Enhanced Filters
        monthlyIncomeRange:
          filters.monthlyIncomeRange !== "all"
            ? filters.monthlyIncomeRange
            : undefined,
        numberOfChildrenRange:
          filters.numberOfChildrenRange !== "all"
            ? filters.numberOfChildrenRange
            : undefined,
        noOfTrainingsRange:
          filters.noOfTrainingsRange !== "all"
            ? filters.noOfTrainingsRange
            : undefined,
        employmentType:
          filters.employmentType !== "all" ? filters.employmentType : undefined,
        accessedLoans:
          filters.accessedLoans !== "all" ? filters.accessedLoans : undefined,
        individualSaving:
          filters.individualSaving !== "all"
            ? filters.individualSaving
            : undefined,
        groupSaving:
          filters.groupSaving !== "all" ? filters.groupSaving : undefined,
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
        try {
          const excelContent = await participantsToExcel(exportParticipants);
          const filename = generateExportFilename(
            "participants",
            exportFilters,
            "excel"
          );
          downloadExcel(excelContent, filename);
          toast.success(
            `Exported ${exportParticipants.length} participants to ${filename}`
          );
        } catch (excelError) {
          console.error("Excel export error:", excelError);
          toast.error(
            "Failed to create Excel file. Please try CSV export instead."
          );
          return;
        }
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
    isFiltering,
    participantsError,
    metricsError,

    // Event handlers
    handlePaginationChange,
    handleSearchChange,
    handleFiltersChange,
    handleEdit,
    handleDelete,
    handleView,
    handleExport,
  };
}
