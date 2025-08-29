"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParticipants } from "../../hooks/use-participants";
import { useParticipantMetrics } from "../../hooks/use-participant-metrics";
import { useLocationNames } from "../../hooks/use-location-names";
import {
  type Participant,
  type ParticipantFilters,
  type ParticipantsResponse,
} from "../../types/types";

interface UseParticipantContainerStateProps {
  clusterId: string;
}

export function useParticipantContainerState({
  clusterId,
}: UseParticipantContainerStateProps) {
  const router = useRouter();

  // State
  const [filters, setFilters] = useState<ParticipantFilters>({
    search: "",
    project: "all",
    organization: "all",
    district: "all",
    subCounty: "all",
    enterprise: "all",
    sex: "all",
    isPWD: "all",
    ageGroup: "all",
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] =
    useState<Participant | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  });
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("participants");

  // Data fetching
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
    },
  });

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useParticipantMetrics(clusterId, filters);

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

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [
    filters.project,
    filters.organization,
    filters.district,
    filters.subCounty,
    filters.enterprise,
    filters.sex,
    filters.isPWD,
    filters.ageGroup,
    searchValue,
  ]);

  // Event handlers
  const handlePaginationChange = (page: number, pageSize: number) => {
    console.log(
      `ParticipantsContainer: Setting pagination to page=${page}, pageSize=${pageSize}`
    );
    setPagination({ page, pageSize });
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
  };

  const handleDelete = (participant: Participant) => {
    setDeletingParticipant(participant);
  };

  const handleView = (participant: Participant) => {
    router.push(`/dashboard/participants/${participant.id}`);
  };

  return {
    // State
    filters,
    setFilters,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingParticipant,
    setEditingParticipant,
    deletingParticipant,
    setDeletingParticipant,
    pagination,
    setPagination,
    searchValue,
    setSearchValue,
    activeTab,
    setActiveTab,

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
  };
}
