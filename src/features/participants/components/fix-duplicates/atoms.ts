"use client";

import { atom } from "jotai";
import { type AllDuplicatesResult } from "../../actions/find-all-duplicates";

// State atoms for the fix duplicates dialog
export const duplicatesDataAtom = atom<AllDuplicatesResult | null>(null);
export const selectedForDeletionAtom = atom<string[]>([]);
export const isProcessingAtom = atom(false);
export const isLoadingDuplicatesAtom = atom(false);

// Derived atoms
export const duplicateGroupsAtom = atom(
  get => get(duplicatesDataAtom)?.duplicateGroups || []
);

export const totalDuplicateCountAtom = atom(get => {
  const groups = get(duplicateGroupsAtom);
  return groups.reduce((total, group) => total + group.participants.length, 0);
});

export const allParticipantIdsAtom = atom(get => {
  const groups = get(duplicateGroupsAtom);
  return groups.flatMap(group => group.participants.map(p => p.id));
});

export const isAllSelectedAtom = atom(get => {
  const allIds = get(allParticipantIdsAtom);
  const selected = get(selectedForDeletionAtom);
  return allIds.length > 0 && selected.length === allIds.length;
});

export const hasDuplicatesAtom = atom(
  get => get(duplicateGroupsAtom).length > 0
);
