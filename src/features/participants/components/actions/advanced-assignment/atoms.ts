import { atom } from "jotai";
import type { AssignmentLevel } from "../../advanced-assignment/types";

// State atoms for advanced assignment
export const assignmentLevelAtom = atom<AssignmentLevel>("subcounty");
export const selectedSubCountiesAtom = atom<string[]>([]);
export const selectedParishesAtom = atom<string[]>([]);
export const selectedOrganizationAtom = atom<string>("");

// Action atoms
export const clearSelectionAtom = atom(null, (get, set) => {
  set(selectedSubCountiesAtom, []);
  set(selectedParishesAtom, []);
  set(selectedOrganizationAtom, "");
});

export const switchAssignmentLevelAtom = atom(
  null,
  (get, set, level: AssignmentLevel) => {
    set(assignmentLevelAtom, level);
    // Clear selections when switching levels
    set(selectedSubCountiesAtom, []);
    set(selectedParishesAtom, []);
  }
);

export const toggleSubCountyAtom = atom(
  null,
  (get, set, subCountyName: string) => {
    const current = get(selectedSubCountiesAtom);
    const updated = current.includes(subCountyName)
      ? current.filter(sc => sc !== subCountyName)
      : [...current, subCountyName];
    set(selectedSubCountiesAtom, updated);
  }
);

export const toggleParishAtom = atom(null, (get, set, parishName: string) => {
  const current = get(selectedParishesAtom);
  const updated = current.includes(parishName)
    ? current.filter(p => p !== parishName)
    : [...current, parishName];
  set(selectedParishesAtom, updated);
});

export const removeSubCountyAtom = atom(
  null,
  (get, set, subCountyName: string) => {
    const current = get(selectedSubCountiesAtom);
    set(
      selectedSubCountiesAtom,
      current.filter(sc => sc !== subCountyName)
    );
  }
);

export const removeParishAtom = atom(null, (get, set, parishName: string) => {
  const current = get(selectedParishesAtom);
  set(
    selectedParishesAtom,
    current.filter(p => p !== parishName)
  );
});

export const selectAllSubCountiesAtom = atom(
  null,
  (get, set, subCounties: Array<{ id: string; name: string }>) => {
    const current = get(selectedSubCountiesAtom);
    const allSelected = current.length === subCounties.length;

    if (allSelected) {
      set(selectedSubCountiesAtom, []);
    } else {
      set(
        selectedSubCountiesAtom,
        subCounties.map(sc => sc.name)
      );
    }
  }
);

export const selectAllParishesAtom = atom(
  null,
  (get, set, parishes: Array<{ id: string; name: string }>) => {
    const current = get(selectedParishesAtom);
    const allSelected = current.length === parishes.length;

    if (allSelected) {
      set(selectedParishesAtom, []);
    } else {
      set(
        selectedParishesAtom,
        parishes.map(p => p.name)
      );
    }
  }
);
