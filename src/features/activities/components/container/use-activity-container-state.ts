"use client";

import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useActivities, useActivityMetrics } from "../../hooks/use-activities";
import { useOrganizationsByCluster } from "../../hooks/use-organizations";
import {
  activeTabAtom,
  searchValueAtom,
  activityFiltersAtom,
  paginationAtom,
  isCreateDialogOpenAtom,
  isImportDialogOpenAtom,
  editingActivityAtom,
  deletingActivityAtom,
  handleSearchChangeAtom,
  updatePaginationAtom,
} from "../../atoms/activities-atoms";

interface UseActivityContainerStateProps {
  clusterId?: string;
}

export function useActivityContainerState({
  clusterId,
}: UseActivityContainerStateProps) {
  // Jotai atoms for state management
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [filters, setFilters] = useAtom(activityFiltersAtom);
  const [pagination] = useAtom(paginationAtom);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useAtom(
    isCreateDialogOpenAtom
  );
  const [isImportDialogOpen, setIsImportDialogOpen] = useAtom(
    isImportDialogOpenAtom
  );
  const [editingActivity, setEditingActivity] = useAtom(editingActivityAtom);
  const [deletingActivity, setDeletingActivity] = useAtom(deletingActivityAtom);

  // Action atoms
  const handleSearchChangeAction = useSetAtom(handleSearchChangeAtom);
  const updatePaginationAction = useSetAtom(updatePaginationAtom);

  // Initialize clusterId in filters if provided
  useEffect(() => {
    if (clusterId && filters.clusterId !== clusterId) {
      setFilters(prev => ({
        ...prev,
        clusterId: clusterId,
      }));
    }
  }, [clusterId, filters.clusterId, setFilters]);

  // Fetch activities with filters for the table
  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
    error: activitiesError,
  } = useActivities(clusterId, {
    search: searchValue || undefined,
    filters: {
      type: filters.type || undefined,
      status: filters.status || undefined,
      organization: filters.organizationId || undefined,
      project: filters.projectId || undefined,
      dateFrom: filters.startDate
        ? new Date(filters.startDate).toISOString()
        : undefined,
      dateTo: filters.endDate
        ? new Date(filters.endDate).toISOString()
        : undefined,
    },
    page: pagination.page,
    limit: pagination.limit,
  });

  // Fetch metrics with current filters
  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useActivityMetrics(clusterId);

  // Fetch organizations for the cluster
  const {
    data: organizationsData,
    isLoading: _isOrganizationsLoading,
    error: _organizationsError,
  } = useOrganizationsByCluster(clusterId);

  const activities = activitiesData?.data?.data || [];
  const metricsActivities = activities; // Use the same data for now
  const organizations = organizationsData?.data || [];

  // Build pagination object from API response
  const paginationData = {
    page: activitiesData?.data?.pagination?.page || pagination.page,
    limit: activitiesData?.data?.pagination?.limit || pagination.limit,
    total: activitiesData?.data?.pagination?.total || 0,
    totalPages:
      activitiesData?.data?.pagination?.totalPages ||
      Math.ceil(
        (activitiesData?.data?.pagination?.total || 0) / pagination.limit
      ),
  };

  // Handler functions using Jotai actions
  const handleSearchChange = (search: string) => {
    handleSearchChangeAction(search);
  };

  const handlePaginationChange = (page: number, limit: number) => {
    updatePaginationAction({ page, limit });
  };

  const handlePageChange = (page: number) => {
    updatePaginationAction({ page });
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Search and filters
    searchValue,
    setSearchValue,
    handleSearchChange,
    filters,
    setFilters,

    // Data
    activities,
    activitiesData,
    metricsActivities,
    metricsData,
    organizations,

    // Loading states
    isActivitiesLoading,
    isMetricsLoading,

    // Error states
    activitiesError,
    metricsError,

    // Pagination
    pagination: paginationData,
    handlePaginationChange,
    handlePageChange,

    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingActivity,
    setEditingActivity,
    deletingActivity,
    setDeletingActivity,
  };
}
