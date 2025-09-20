"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import {
  duplicatesDataAtom,
  selectedForDeletionAtom,
  isProcessingAtom,
  isLoadingDuplicatesAtom,
  duplicateGroupsAtom,
  allParticipantIdsAtom,
  isAllSelectedAtom,
} from "./atoms";
import {
  findAllDuplicates,
  deleteParticipants,
  type DuplicateGroup,
} from "../../actions/find-all-duplicates";
import toast from "react-hot-toast";

export function useDuplicatesActions() {
  const [duplicatesData, setDuplicatesData] = useAtom(duplicatesDataAtom);
  const [selectedForDeletion, setSelectedForDeletion] = useAtom(
    selectedForDeletionAtom
  );
  const [isProcessing, setIsProcessing] = useAtom(isProcessingAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingDuplicatesAtom);

  const duplicateGroups = useAtomValue(duplicateGroupsAtom);
  const allParticipantIds = useAtomValue(allParticipantIdsAtom);
  const isAllSelected = useAtomValue(isAllSelectedAtom);

  const loadDuplicates = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await findAllDuplicates();
      setDuplicatesData(result);
      setSelectedForDeletion([]); // Reset selection
    } catch (error) {
      console.error("Error loading duplicates:", error);
      toast.error("Failed to load duplicate participants");
    } finally {
      setIsLoading(false);
    }
  }, [setDuplicatesData, setIsLoading, setSelectedForDeletion]);

  const handleRefresh = useCallback(() => {
    setDuplicatesData(null);
    loadDuplicates();
  }, [setDuplicatesData, loadDuplicates]);

  const handleSelectForDeletion = useCallback(
    (participantId: string, checked: boolean) => {
      setSelectedForDeletion(prev => {
        if (checked) {
          return [...prev, participantId];
        } else {
          return prev.filter(id => id !== participantId);
        }
      });
    },
    [setSelectedForDeletion]
  );

  const handleSelectAllInGroup = useCallback(
    (group: DuplicateGroup, checked: boolean) => {
      const groupIds = group.participants.map(p => p.id);
      setSelectedForDeletion(prev => {
        if (checked) {
          const newIds = groupIds.filter(id => !prev.includes(id));
          return [...prev, ...newIds];
        } else {
          return prev.filter(id => !groupIds.includes(id));
        }
      });
    },
    [setSelectedForDeletion]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedForDeletion(allParticipantIds);
      } else {
        setSelectedForDeletion([]);
      }
    },
    [allParticipantIds, setSelectedForDeletion]
  );

  const handleDeleteSelected = useCallback(
    async (onDeleteCompleted?: (count: number) => void) => {
      if (selectedForDeletion.length === 0) {
        toast.error("Please select participants to delete");
        return;
      }

      setIsProcessing(true);
      try {
        await deleteParticipants(selectedForDeletion);
        toast.success(
          `Successfully deleted ${selectedForDeletion.length} duplicate participants`
        );
        setSelectedForDeletion([]);
        onDeleteCompleted?.(selectedForDeletion.length);
        // Refresh the duplicates data
        await loadDuplicates();
      } catch (error) {
        toast.error("Failed to delete participants");
        console.error("Error deleting participants:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      selectedForDeletion,
      setIsProcessing,
      setSelectedForDeletion,
      loadDuplicates,
    ]
  );

  const isGroupFullySelected = useCallback(
    (group: DuplicateGroup) => {
      return group.participants.every(p => selectedForDeletion.includes(p.id));
    },
    [selectedForDeletion]
  );

  const isGroupPartiallySelected = useCallback(
    (group: DuplicateGroup) => {
      return (
        group.participants.some(p => selectedForDeletion.includes(p.id)) &&
        !isGroupFullySelected(group)
      );
    },
    [selectedForDeletion, isGroupFullySelected]
  );

  return {
    // State
    duplicatesData,
    selectedForDeletion,
    isProcessing,
    isLoading,
    duplicateGroups,
    allParticipantIds,
    isAllSelected,

    // Actions
    loadDuplicates,
    handleRefresh,
    handleSelectForDeletion,
    handleSelectAllInGroup,
    handleSelectAll,
    handleDeleteSelected,
    isGroupFullySelected,
    isGroupPartiallySelected,
  };
}
