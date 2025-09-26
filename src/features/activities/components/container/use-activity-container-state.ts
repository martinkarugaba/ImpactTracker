"use client";

import { useState } from "react";
import { useActivities, useActivityMetrics } from "../../hooks/use-activities";
import { useOrganizationsByCluster } from "../../hooks/use-organizations";
import { type Activity, type ActivityFilters } from "../../types/types";

interface UseActivityContainerStateProps {
  clusterId?: string;
}

export function useActivityContainerState({
  clusterId,
}: UseActivityContainerStateProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "activities">(
    "metrics"
  );
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    type: "",
    status: "",
    organizationId: "",
    clusterId: clusterId || "",
    projectId: "",
    startDate: undefined,
    endDate: undefined,
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(
    null
  );

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
  });

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
      dateFrom: filters.startDate?.toISOString(),
      dateTo: filters.endDate?.toISOString(),
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

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    // Reset pagination when search changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePaginationChange = (page: number, limit: number) => {
    setPagination({ page, limit });
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
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
