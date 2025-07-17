"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createTraining, deleteTraining, updateTraining } from "../../actions";
import { type Training } from "../../types/types";
import {
  type TrainingFormHandlersHookResult,
  type TrainingFormValues,
} from "./types";

export function useTrainingFormHandlers({
  clusterId,
  onSetIsLoading,
  onSetIsOpen,
  onSetEditingTraining,
}: {
  clusterId: string;
  onSetIsLoading: (isLoading: boolean) => void;
  onSetIsOpen: (isOpen: boolean) => void;
  onSetEditingTraining: (training: Training | null) => void;
}): TrainingFormHandlersHookResult {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: TrainingFormValues) => {
      onSetIsLoading(true);
      try {
        // Convert string date to Date object and handle budget
        const trainingData = {
          ...data,
          trainingDate: new Date(data.trainingDate),
          budget: data.budget ? parseFloat(data.budget) : null,
        };

        // If editing
        if (data.id) {
          const result = await updateTraining(data.id, trainingData);
          if (result.success) {
            toast.success("Training updated successfully");
            onSetIsOpen(false);
            onSetEditingTraining(null);
            router.refresh();
          } else {
            toast.error(result.error || "Failed to update training");
          }
        } else {
          // We're creating a new training
          const result = await createTraining({
            ...trainingData,
            cluster_id: clusterId,
          });
          if (result.success) {
            toast.success("Training created successfully");
            onSetIsOpen(false);
            router.refresh();
          } else {
            toast.error(result.error || "Failed to create training");
          }
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Error submitting training:", error);
      } finally {
        onSetIsLoading(false);
      }
    },
    [clusterId, router, onSetIsLoading, onSetIsOpen, onSetEditingTraining]
  );

  const handleEdit = useCallback(
    (training: Training) => {
      onSetEditingTraining(training);
      onSetIsOpen(true);
    },
    [onSetEditingTraining, onSetIsOpen]
  );

  const handleDelete = useCallback(
    async (training: Training) => {
      if (window.confirm("Are you sure you want to delete this training?")) {
        onSetIsLoading(true);
        try {
          const result = await deleteTraining(training.id);
          if (result.success) {
            toast.success("Training deleted successfully");
            router.refresh();
          } else {
            toast.error(result.error || "Failed to delete training");
          }
        } catch (error) {
          toast.error("An unexpected error occurred");
          console.error("Error deleting training:", error);
        } finally {
          onSetIsLoading(false);
        }
      }
    },
    [router, onSetIsLoading]
  );

  const handleAdd = useCallback(() => {
    onSetEditingTraining(null);
    onSetIsOpen(true);
  }, [onSetEditingTraining, onSetIsOpen]);

  return {
    handleSubmit,
    handleEdit,
    handleDelete,
    handleAdd,
  };
}
