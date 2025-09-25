import { atom } from "jotai";

export interface ImportProgress {
  current: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  percentage: number;
  status: "idle" | "importing" | "completed" | "error";
  message?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

// Global import progress state
export const importProgressAtom = atom<ImportProgress>({
  current: 0,
  total: 0,
  currentBatch: 0,
  totalBatches: 0,
  percentage: 0,
  status: "idle",
});

// Derived atom to check if import is active
export const isImportingAtom = atom(get => {
  const progress = get(importProgressAtom);
  return progress.status === "importing";
});

// Action atom to start import
export const startImportAtom = atom(null, (get, set, total: number) => {
  set(importProgressAtom, {
    current: 0,
    total,
    currentBatch: 0,
    totalBatches: Math.ceil(total / 25), // Using same batch size as import
    percentage: 0,
    status: "importing",
    startTime: new Date(),
    message: `Starting import of ${total} participants...`,
  });
});

// Action atom to update progress
export const updateImportProgressAtom = atom(
  null,
  (get, set, update: Partial<ImportProgress>) => {
    const current = get(importProgressAtom);
    set(importProgressAtom, {
      ...current,
      ...update,
    });
  }
);

// Action atom to complete import
export const completeImportAtom = atom(
  null,
  (
    get,
    set,
    result: { success: boolean; imported?: number; error?: string }
  ) => {
    const current = get(importProgressAtom);
    set(importProgressAtom, {
      ...current,
      status: result.success ? "completed" : "error",
      percentage: 100,
      current: result.imported || current.total,
      endTime: new Date(),
      message: result.success
        ? `Successfully imported ${result.imported || current.total} participants`
        : "Import failed",
      error: result.error,
    });
  }
);

// Action atom to reset import state
export const resetImportAtom = atom(null, (get, set) => {
  set(importProgressAtom, {
    current: 0,
    total: 0,
    currentBatch: 0,
    totalBatches: 0,
    percentage: 0,
    status: "idle",
  });
});
