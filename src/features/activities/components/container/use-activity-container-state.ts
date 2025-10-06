"use client";

import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useActivities,
  useActivityMetrics,
  useDeleteMultipleActivities,
} from "../../hooks/use-activities";
import { useOrganizationsByCluster } from "../../hooks/use-organizations";
import { useClusterUsers } from "../../hooks/use-cluster-users";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // Initialize state from URL params on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const organization = searchParams.get("organization");
    const project = searchParams.get("project");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Set tab from URL
    if (
      tab &&
      ["activities", "metrics", "charts", "demographics", "calendar"].includes(
        tab
      )
    ) {
      setActiveTab(
        tab as "activities" | "metrics" | "charts" | "demographics" | "calendar"
      );
    }

    // Set search from URL
    if (search) {
      setSearchValue(search);
    }

    // Set filters from URL
    const urlFilters: Partial<typeof filters> = {};
    if (type) urlFilters.type = type;
    if (status) urlFilters.status = status;
    if (organization) urlFilters.organizationId = organization;
    if (project) urlFilters.projectId = project;
    if (startDate) urlFilters.startDate = new Date(startDate);
    if (endDate) urlFilters.endDate = new Date(endDate);

    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Initialize clusterId in filters if provided
  useEffect(() => {
    if (clusterId && filters.clusterId !== clusterId) {
      setFilters(prev => ({
        ...prev,
        clusterId: clusterId,
      }));
    }
  }, [clusterId, filters.clusterId, setFilters]);

  // Sync URL with state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add tab to URL
    if (activeTab !== "activities") {
      params.set("tab", activeTab);
    }

    // Add search to URL
    if (searchValue) {
      params.set("search", searchValue);
    }

    // Add filters to URL
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.organizationId)
      params.set("organization", filters.organizationId);
    if (filters.projectId) params.set("project", filters.projectId);
    if (filters.startDate)
      params.set("startDate", filters.startDate.toISOString().split("T")[0]);
    if (filters.endDate)
      params.set("endDate", filters.endDate.toISOString().split("T")[0]);

    // Update URL without triggering navigation
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Only update if URL actually changed
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [activeTab, searchValue, filters, pathname, router]);

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

  // Fetch cluster users
  const {
    data: clusterUsersData,
    isLoading: _isClusterUsersLoading,
    error: _clusterUsersError,
  } = useClusterUsers(clusterId);

  // Delete multiple activities mutation
  const deleteMultipleMutation = useDeleteMultipleActivities();

  const activities = activitiesData?.data?.data || [];
  const metricsActivities = activities; // Use the same data for now
  const organizations = organizationsData?.data || [];
  const clusterUsers = clusterUsersData?.data || [];

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

  const handleDeleteMultiple = async (ids: string[]) => {
    try {
      await deleteMultipleMutation.mutateAsync({ ids });
      toast.success(
        `Successfully deleted ${ids.length} ${ids.length === 1 ? "activity" : "activities"}`
      );
    } catch (error) {
      console.error("Error deleting activities:", error);
      toast.error("Failed to delete activities. Please try again.");
    }
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
    clusterUsers,

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

    // Actions
    handleDeleteMultiple,

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
