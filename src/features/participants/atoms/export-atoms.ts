import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Export preferences stored in localStorage
export interface ExportOptions {
  nameFormat: "combined" | "separate"; // Combined: "Name" column, Separate: "First Name" & "Last Name" columns
  includeFullName: boolean; // Whether to include a full name column when separate is selected
}

export const defaultExportOptions: ExportOptions = {
  nameFormat: "combined", // Default to combined format
  includeFullName: false,
};

// Persistent export options
export const exportOptionsAtom = atomWithStorage<ExportOptions>(
  "participant-export-options",
  defaultExportOptions
);

// Export dialog state
export const exportDialogAtom = atom(false);
export const exportFormatAtom = atom<"csv" | "excel">("csv");
