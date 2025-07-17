"use client";

import { useCallback, useEffect, useState } from "react";
import { type Training } from "../../types/types";
import { getTrainings } from "../../actions";
import {
  type TrainingDataHookResult,
  type TrainingFilters,
  type SearchParams,
} from "./types";

const DEFAULT_STATUSES = [
  { value: "all_statuses", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function useTrainingData({
  clusterId,
  initialSearchParams,
}: {
  clusterId: string;
  initialSearchParams?: SearchParams;
}): TrainingDataHookResult {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trainingsResult, setTrainingsResult] =
    useState<TrainingDataHookResult["trainingsResult"]>(null);
  const [filters, setFilters] = useState<TrainingFilters>({
    project: initialSearchParams?.project || "all_projects",
    status: initialSearchParams?.status || "all_statuses",
    organization: initialSearchParams?.organization || "all_organizations",
  });
  const [searchTerm, setSearchTerm] = useState(
    initialSearchParams?.search || ""
  );
  const [pagination, setPagination] = useState({
    page: initialSearchParams?.page || 1,
    perPage: initialSearchParams?.per_page || 10,
  });

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTrainings(clusterId);

      if (result.success && result.data) {
        // Apply filters and search
        let filteredTrainings = [...result.data];

        if (filters.project && filters.project !== "all_projects") {
          filteredTrainings = filteredTrainings.filter(
            training => training.project_id === filters.project
          );
        }

        if (filters.status && filters.status !== "all_statuses") {
          filteredTrainings = filteredTrainings.filter(
            training => training.status === filters.status
          );
        }

        if (
          filters.organization &&
          filters.organization !== "all_organizations"
        ) {
          filteredTrainings = filteredTrainings.filter(
            training => training.organization_id === filters.organization
          );
        }

        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredTrainings = filteredTrainings.filter(
            training =>
              training.name.toLowerCase().includes(search) ||
              (training.description &&
                training.description.toLowerCase().includes(search)) ||
              training.venue.toLowerCase().includes(search)
          );
        }

        // Apply pagination
        const startIndex = (pagination.page - 1) * pagination.perPage;
        const endIndex = startIndex + pagination.perPage;
        const paginatedTrainings = filteredTrainings.slice(
          startIndex,
          endIndex
        );

        setTrainings(paginatedTrainings);

        setTrainingsResult({
          success: true,
          data: {
            trainings: paginatedTrainings,
            pagination: {
              total: filteredTrainings.length,
              page: pagination.page,
              perPage: pagination.perPage,
              pageCount: Math.ceil(
                filteredTrainings.length / pagination.perPage
              ),
            },
          },
        });
      } else {
        setTrainingsResult({
          success: false,
          error: result.error || "Failed to fetch trainings",
        });
      }
    } catch (_error) {
      setTrainingsResult({
        success: false,
        error: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [clusterId, filters, searchTerm, pagination]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleFilterChange = useCallback(
    (name: keyof TrainingFilters, value: string) => {
      setFilters(prev => ({ ...prev, [name]: value }));
      setPagination(prev => ({ ...prev, page: 1 }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, perPage: size, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    trainingsData: trainings,
    isLoadingTrainings: isLoading,
    trainingsResult,
    filters,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    searchTerm,
    statuses: DEFAULT_STATUSES,
  };
}
