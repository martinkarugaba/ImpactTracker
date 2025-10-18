"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type Activity, type ActivityFilters } from "../types/types";
import type { DemographicsData } from "../components/details/demographics/types/demographics";
import type { Participant } from "../../participants/types/types";

// ========================================
// Core State Atoms
// ========================================

// Tab navigation state
export const activeTabAtom = atom<
  "activities" | "metrics" | "charts" | "demographics" | "targets"
>("activities");

// Search state
export const searchValueAtom = atom("");

// Filters state with localStorage persistence
export const activityFiltersAtom = atomWithStorage<ActivityFilters>(
  "activity-filters",
  {
    search: "",
    type: "",
    status: "",
    organizationId: "",
    clusterId: "",
    projectId: "",
    startDate: undefined,
    endDate: undefined,
  }
);

// Pagination state
export const paginationAtom = atom({
  page: 1,
  limit: 50,
});

// ========================================
// Dialog State Atoms
// ========================================

// Create dialog state
export const isCreateDialogOpenAtom = atom(false);

// Import dialog state
export const isImportDialogOpenAtom = atom(false);

// Editing activity state
export const editingActivityAtom = atom<Activity | null>(null);

// Deleting activity state
export const deletingActivityAtom = atom<Activity | null>(null);

// ========================================
// Table State Atoms
// ========================================

// Table search state
export const tableSearchAtom = atom("");

// Selected rows state
export const selectedRowsAtom = atom<string[]>([]);

// ========================================
// Filter Component State Atoms
// ========================================

// Filter panel open/closed state
export const isFilterOpenAtom = atom(false);

// ========================================
// Column Visibility State Atoms
// ========================================

// Activities table column visibility
export const columnVisibilityAtom = atomWithStorage(
  "activities-column-visibility",
  {
    title: true,
    type: true,
    status: true,
    startDate: true,
    endDate: true,
    venue: true,
    budget: true,
    organization: true,
    participantCount: true,
    actions: true,
  }
);

// ========================================
// Participant Selection State Atoms
// ========================================

// Selected participants for activity
export const selectedParticipantsAtom = atom<Array<Participant>>([]);

// Participant search term
export const participantSearchTermAtom = atom("");

// Debounced participant search term
export const debouncedParticipantSearchTermAtom = atom("");

// Show create participant form
export const showCreateParticipantFormAtom = atom(false);

// Participant form submission state
export const isParticipantSubmittingAtom = atom(false);

// ========================================
// Detail Component State Atoms
// ========================================

// Demographics tab loading state
export const demographicsLoadingAtom = atom(false);

// Demographics data state
export const demographicsDataAtom = atom<DemographicsData | null>(null);

// Edit participant dialog state
export const editParticipantLoadingAtom = atom(false);

// Edit participant form data
export const editParticipantFormDataAtom = atom({
  participantName: "",
  participantContact: "",
  sex: "",
  age: "",
  enterprise: "",
  employment: "",
  incomeLevel: "",
  attendance_status: "pending" as "attended" | "absent" | "pending",
  role: "participant" as const,
});

// Session deletion state
export const deletingSessionIdAtom = atom<string | null>(null);

// ========================================
// Action Atoms (Write-only atoms for complex state updates)
// ========================================

// Clear all filters action
export const clearFiltersAtom = atom(null, (get, set) => {
  set(activityFiltersAtom, {
    search: "",
    type: "",
    status: "",
    organizationId: "",
    clusterId: get(activityFiltersAtom).clusterId, // Preserve clusterId
    projectId: "",
    startDate: undefined,
    endDate: undefined,
  });
  set(searchValueAtom, "");
});

// Update individual filter action
export const updateActivityFilterAtom = atom(
  null,
  (get, set, update: { key: keyof ActivityFilters; value: unknown }) => {
    const currentFilters = get(activityFiltersAtom);
    set(activityFiltersAtom, {
      ...currentFilters,
      [update.key]: update.value,
    });
  }
);

// Handle search change with pagination reset
export const handleSearchChangeAtom = atom(null, (get, set, search: string) => {
  set(searchValueAtom, search);
  // Reset pagination when search changes
  const currentPagination = get(paginationAtom);
  set(paginationAtom, { ...currentPagination, page: 1 });
});

// Update pagination action
export const updatePaginationAtom = atom(
  null,
  (get, set, update: { page?: number; limit?: number }) => {
    const currentPagination = get(paginationAtom);
    set(paginationAtom, {
      ...currentPagination,
      ...update,
    });
  }
);

// Clear selected rows action
export const clearSelectedRowsAtom = atom(null, (get, set) => {
  set(selectedRowsAtom, []);
});

// Toggle row selection action
export const toggleRowSelectionAtom = atom(null, (get, set, rowId: string) => {
  const currentSelected = get(selectedRowsAtom);
  if (currentSelected.includes(rowId)) {
    set(
      selectedRowsAtom,
      currentSelected.filter(id => id !== rowId)
    );
  } else {
    set(selectedRowsAtom, [...currentSelected, rowId]);
  }
});

// Set all selected rows action
export const setSelectedRowsAtom = atom(null, (get, set, rows: string[]) => {
  set(selectedRowsAtom, rows);
});

// Close all dialogs action
export const closeAllDialogsAtom = atom(null, (get, set) => {
  set(isCreateDialogOpenAtom, false);
  set(isImportDialogOpenAtom, false);
  set(editingActivityAtom, null);
  set(deletingActivityAtom, null);
});

// ========================================
// Computed/Read-only Atoms
// ========================================

// Active filters count
export const activeFiltersCountAtom = atom(get => {
  const filters = get(activityFiltersAtom);
  let count = 0;
  if (filters.search) count++;
  if (filters.type) count++;
  if (filters.status) count++;
  if (filters.organizationId) count++;
  if (filters.projectId) count++;
  if (filters.startDate) count++;
  if (filters.endDate) count++;
  return count;
});

// Has active filters
export const hasActiveFiltersAtom = atom(get => {
  return get(activeFiltersCountAtom) > 0;
});

// Has selected rows
export const hasSelectedRowsAtom = atom(get => {
  return get(selectedRowsAtom).length > 0;
});

// Selected rows count
export const selectedRowsCountAtom = atom(get => {
  return get(selectedRowsAtom).length;
});
