// state/use-participant-state.ts
"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  participantFiltersAtom,
  participantPaginationAtom,
  participantSearchAtom,
  activeTabAtom,
  createDialogAtom,
  importDialogAtom,
  editingParticipantAtom,
  deletingParticipantAtom,
  hasActiveFiltersAtom,
  clearFiltersAtom,
  updateFilterAtom,
} from "../atoms/participants-atoms";
import { type ParticipantFilters, type Participant } from "../types/types";

/**
 * Main hook for participant state management using Jotai
 * Replaces the complex useState-based approach with atomic state
 */
export function useParticipantState() {
  // Filter state
  const [filters, setFilters] = useAtom(participantFiltersAtom);
  const hasActiveFilters = useAtomValue(hasActiveFiltersAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);

  // Pagination state
  const [pagination, setPagination] = useAtom(participantPaginationAtom);

  // Search state
  const [searchValue, setSearchValue] = useAtom(participantSearchAtom);

  // Tab state
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useAtom(createDialogAtom);
  const [isImportDialogOpen, setIsImportDialogOpen] = useAtom(importDialogAtom);
  const [editingParticipant, setEditingParticipant] = useAtom(
    editingParticipantAtom
  );
  const [deletingParticipant, setDeletingParticipant] = useAtom(
    deletingParticipantAtom
  );

  // Helper functions
  const handleFilterUpdate = (key: keyof ParticipantFilters, value: string) => {
    updateFilter({ key, value });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
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

  const closeEditDialog = () => {
    setEditingParticipant(null);
  };

  const closeDeleteDialog = () => {
    setDeletingParticipant(null);
  };

  return {
    // State
    filters,
    setFilters,
    pagination,
    setPagination,
    searchValue,
    setSearchValue,
    activeTab,
    setActiveTab,
    hasActiveFilters,

    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingParticipant,
    setEditingParticipant,
    deletingParticipant,
    setDeletingParticipant,

    // Actions
    handleFilterUpdate,
    handleClearFilters,
    handlePaginationChange,
    handleSearchChange,
    handleEdit,
    handleDelete,
    closeEditDialog,
    closeDeleteDialog,
  };
}
