import { atom } from "jotai";

// State atoms for advanced assignment
export const selectedSubCountiesAtom = atom<string[]>([]);
export const selectedOrganizationAtom = atom<string>("");

// Action atoms
export const clearSelectionAtom = atom(null, (get, set) => {
  set(selectedSubCountiesAtom, []);
  set(selectedOrganizationAtom, "");
});

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
