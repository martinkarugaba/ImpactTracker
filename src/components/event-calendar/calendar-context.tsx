"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { etiquettes } from "@/components/big-calendar";

// Core calendar state atoms
export const currentDateAtom = atom<Date>(new Date());

// Color visibility state with localStorage persistence
export const visibleColorsAtom = atomWithStorage<string[]>(
  "calendar-visible-colors",
  // Initialize with active etiquettes
  etiquettes
    .filter(etiquette => etiquette.isActive)
    .map(etiquette => etiquette.color)
);

// Derived atom to check if a color is visible
export const isColorVisibleAtom = atom(
  null,
  (get, _set, color: string | undefined) => {
    if (!color) return true; // Events without a color are always visible
    const visibleColors = get(visibleColorsAtom);
    return visibleColors.includes(color);
  }
);

// Action atom to toggle color visibility
export const toggleColorVisibilityAtom = atom(
  null,
  (get, set, color: string) => {
    const currentColors = get(visibleColorsAtom);
    if (currentColors.includes(color)) {
      set(
        visibleColorsAtom,
        currentColors.filter(c => c !== color)
      );
    } else {
      set(visibleColorsAtom, [...currentColors, color]);
    }
  }
);

// Hook for current date management
export function useCurrentDate() {
  return useAtom(currentDateAtom);
}

// Hook for color visibility management
export function useColorVisibility() {
  const visibleColors = useAtomValue(visibleColorsAtom);
  const toggleColorVisibility = useSetAtom(toggleColorVisibilityAtom);

  const isColorVisible = (color: string | undefined) => {
    if (!color) return true;
    return visibleColors.includes(color);
  };

  return {
    visibleColors,
    toggleColorVisibility,
    isColorVisible,
  };
}

// Legacy hook for backward compatibility
export function useCalendarContext() {
  const [currentDate, setCurrentDate] = useCurrentDate();
  const { visibleColors, toggleColorVisibility, isColorVisible } =
    useColorVisibility();

  return {
    currentDate,
    setCurrentDate,
    visibleColors,
    toggleColorVisibility,
    isColorVisible,
  };
}

// Provider is no longer needed with Jotai, but keeping for backward compatibility
export function CalendarProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
