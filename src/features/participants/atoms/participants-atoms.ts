// atoms/participants-atoms.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type Participant, type ParticipantFilters } from "../types/types";

// Core state atoms
export const participantFiltersAtom = atomWithStorage<ParticipantFilters>(
  "participant-filters",
  {
    search: "",
    project: "all",
    organization: "all",
    district: "all",
    subCounty: "all",
    enterprise: "all",
    sex: "all",
    isPWD: "all",
    ageGroup: "all",
    maritalStatus: "all",
    educationLevel: "all",
    isSubscribedToVSLA: "all",
    ownsEnterprise: "all",
    employmentStatus: "all",
    employmentSector: "all",
    hasVocationalSkills: "all",
    hasSoftSkills: "all",
    hasBusinessSkills: "all",
    specificVocationalSkill: "all",
    specificSoftSkill: "all",
    specificBusinessSkill: "all",
    populationSegment: "all",
    isActiveStudent: "all",
    isTeenMother: "all",
    sourceOfIncome: "all",
    enterpriseSector: "all",
    businessScale: "all",
    nationality: "all",
    locationSetting: "all",
    isRefugee: "all",
    isMother: "all",
  }
);

export const participantPaginationAtom = atom({
  page: 1,
  pageSize: 20,
});

export const participantSearchAtom = atom("");
export const activeTabAtom = atomWithStorage(
  "participants-active-tab",
  "participants"
);

// Loading state for filtering operations
export const isFilteringAtom = atom(false);

// Dialog state atoms
export const createDialogAtom = atom(false);
export const importDialogAtom = atom(false);
export const editingParticipantAtom = atom<Participant | null>(null);
export const deletingParticipantAtom = atom<Participant | null>(null);
export const fixDuplicatesDialogAtom = atom(false);

// Table state atoms
export const tableRowSelectionAtom = atom<Record<string, boolean>>({});
export const columnVisibilityAtom = atomWithStorage("participants-columns", {
  fullName: true,
  sex: true,
  age: true,
  contact: true,
  district: true,
  subCounty: false,
  parish: false,
  village: false,
  organization: true,
  project: true,
  employmentStatus: true,
  isSubscribedToVSLA: true,
  maritalStatus: false,
  educationLevel: true,
  ownsEnterprise: true,
  hasVocationalSkills: false,
  hasBusinessSkills: false,
  isPWD: false,
  populationSegment: false,
  monthlyIncome: false,
  designation: false,
  enterprise: false,
  numberOfChildren: false,
  isActiveStudent: false,
  isTeenMother: false,
});

// Derived atoms
export const hasActiveFiltersAtom = atom(get => {
  const filters = get(participantFiltersAtom);
  return Object.entries(filters).some(([key, value]) => {
    if (key === "search") return false;
    return value !== "" && value !== "all";
  });
});

export const selectedParticipantsAtom = atom(get => {
  const selection = get(tableRowSelectionAtom);
  return Object.keys(selection).filter(key => selection[key]);
});

// Action atoms (write-only)
export const clearFiltersAtom = atom(null, (get, set) => {
  set(participantFiltersAtom, {
    search: "",
    project: "all",
    organization: "all",
    district: "all",
    subCounty: "all",
    enterprise: "all",
    sex: "all",
    isPWD: "all",
    ageGroup: "all",
    maritalStatus: "all",
    educationLevel: "all",
    isSubscribedToVSLA: "all",
    ownsEnterprise: "all",
    employmentStatus: "all",
    employmentSector: "all",
    hasVocationalSkills: "all",
    hasSoftSkills: "all",
    hasBusinessSkills: "all",
    specificVocationalSkill: "all",
    specificSoftSkill: "all",
    specificBusinessSkill: "all",
    populationSegment: "all",
    isActiveStudent: "all",
    isTeenMother: "all",
    sourceOfIncome: "all",
    enterpriseSector: "all",
    businessScale: "all",
    nationality: "all",
    locationSetting: "all",
    isRefugee: "all",
    isMother: "all",
  });
  set(participantPaginationAtom, prev => ({ ...prev, page: 1 }));
});

export const updateFilterAtom = atom(
  null,
  (
    get,
    set,
    { key, value }: { key: keyof ParticipantFilters; value: string }
  ) => {
    const currentFilters = get(participantFiltersAtom);

    // Set filtering state to true when filters change
    set(isFilteringAtom, true);

    set(participantFiltersAtom, {
      ...currentFilters,
      [key]: value,
    });

    // Reset pagination when filters change
    set(participantPaginationAtom, prev => ({ ...prev, page: 1 }));

    // Auto-clear filtering state after a short delay for batched operations
    setTimeout(() => {
      set(isFilteringAtom, false);
    }, 800);
  }
);

export const clearTableSelectionAtom = atom(null, (get, set) => {
  set(tableRowSelectionAtom, {});
});

// Action atom to clear filtering state when data is loaded
export const clearFilteringAtom = atom(null, (get, set) => {
  set(isFilteringAtom, false);
});
