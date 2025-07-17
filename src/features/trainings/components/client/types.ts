import { type Training } from "../../types/types";
import { type Project } from "@/features/projects/types";

export interface ClusterWithOrganizations {
  id: string;
  name: string;
  organizations?: { id: string; name: string }[];
}

export interface TrainingFilters {
  project: string;
  status: string;
  organization: string;
}

export interface SearchParams {
  page?: number;
  per_page?: number;
  search?: string;
  project?: string;
  status?: string;
  organization?: string;
}

export interface TrainingContainerProps {
  clusterId: string;
  projects: Project[];
  clusters: ClusterWithOrganizations[];
  searchParams?: SearchParams;
}

export interface TrainingDataHookResult {
  trainingsData: Training[];
  isLoadingTrainings: boolean;
  trainingsResult: {
    success: boolean;
    data?: {
      trainings: Training[];
      pagination: {
        total: number;
        page: number;
        perPage: number;
        pageCount: number;
      };
    };
    error?: string;
  } | null;
  filters: TrainingFilters;
  handleFilterChange: (name: keyof TrainingFilters, value: string) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleSearchChange: (search: string) => void;
  searchTerm: string;
  statuses: { value: string; label: string }[];
}

export interface TrainingFormValues {
  id?: string;
  name: string;
  description: string | null;
  conceptNote: string | null;
  activityReport: string | null;
  trainingDate: string;
  venue: string;
  budget: string | null;
  organization_id: string;
  cluster_id: string;
  project_id: string;
  status: "pending" | "completed" | "cancelled";
}

export interface TrainingFormHandlersHookResult {
  handleSubmit: (data: TrainingFormValues) => Promise<void>;
  handleEdit: (training: Training) => void;
  handleDelete: (training: Training) => void;
  handleAdd: () => void;
}
