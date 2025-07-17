"use client";

import { useState } from "react";
import { type Training } from "../../types/types";
import { TrainingsTable } from "../trainings-table";
import { useTrainingData } from "./training-data-provider";
import { useTrainingFormHandlers } from "./training-form-handlers";
import { extractClusterOrganizations } from "./training-transformer";
import { type TrainingContainerProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainingContainer({
  clusterId,
  projects,
  clusters,
  searchParams,
}: TrainingContainerProps) {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  // Get training data and related state
  const {
    trainingsData,
    isLoadingTrainings,
    trainingsResult,
    filters,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    searchTerm,
    statuses,
  } = useTrainingData({
    clusterId,
    initialSearchParams: searchParams,
  });

  // Get form handling functions
  const { handleSubmit, handleEdit, handleDelete, handleAdd } =
    useTrainingFormHandlers({
      clusterId,
      onSetIsLoading: setIsLoading,
      onSetIsOpen: setIsOpen,
      onSetEditingTraining: setEditingTraining,
    });

  // Get organizations data
  const clusterOrganizations = extractClusterOrganizations(clusterId, clusters);

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="flex flex-col gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Training Analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-center gap-2 rounded-md border p-4">
              <div>
                <div className="text-2xl font-bold">{trainingsData.length}</div>
                <div className="text-muted-foreground text-xs">
                  Total Trainings
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-4">
              <div>
                <div className="text-2xl font-bold">
                  {trainingsData.filter(t => t.status === "completed").length}
                </div>
                <div className="text-muted-foreground text-xs">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-4">
              <div>
                <div className="text-2xl font-bold">
                  {trainingsData.filter(t => t.status === "pending").length}
                </div>
                <div className="text-muted-foreground text-xs">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <TrainingsTable
          data={trainingsData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingTraining={editingTraining}
          handleSubmit={handleSubmit}
          isLoading={isLoading || isLoadingTrainings}
          tableIsLoading={isLoadingTrainings}
          tableError={!trainingsResult?.success ? trainingsResult?.error : ""}
          projects={projects}
          organizations={clusterOrganizations}
          clusterId={clusterId}
          filters={filters}
          setFilters={handleFilterChange}
          pagination={trainingsResult?.data?.pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
          statuses={statuses}
        />
      </div>
    </div>
  );
}
