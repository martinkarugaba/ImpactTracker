// state/use-participant-table.ts
"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  tableRowSelectionAtom,
  columnVisibilityAtom,
  selectedParticipantsAtom,
  clearTableSelectionAtom,
} from "../atoms/participants-atoms";

/**
 * Hook for managing participant table state with Jotai
 * Handles row selection, column visibility, and table interactions
 */
export function useParticipantTable() {
  // Selection state
  const [rowSelection, setRowSelection] = useAtom(tableRowSelectionAtom);
  const selectedParticipants = useAtomValue(selectedParticipantsAtom);
  const clearSelection = useSetAtom(clearTableSelectionAtom);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useAtom(columnVisibilityAtom);

  // Helper functions
  const handleRowSelectionChange = (selection: Record<string, boolean>) => {
    setRowSelection(selection);
  };

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: visible,
    }));
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId as keyof typeof prev],
    }));
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  const getSelectedCount = () => selectedParticipants.length;

  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId as keyof typeof columnVisibility] ?? true;
  };

  return {
    // State
    rowSelection,
    setRowSelection,
    selectedParticipants,
    columnVisibility,
    setColumnVisibility,

    // Actions
    handleRowSelectionChange,
    handleColumnVisibilityChange,
    toggleColumnVisibility,
    handleClearSelection,

    // Computed values
    getSelectedCount,
    isColumnVisible,
  };
}
