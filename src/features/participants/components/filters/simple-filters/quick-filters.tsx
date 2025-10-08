"use client";

import { useAtomValue, useSetAtom } from "jotai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  participantFiltersAtom,
  updateFilterAtom,
} from "../../../atoms/participants-atoms";
import { type ParticipantFilters as ParticipantFiltersType } from "../../../types/types";
import { type FilterGroup } from "./types";

interface QuickFiltersProps {
  quickFilters: FilterGroup[];
  isLoading?: boolean;
}

export function QuickFilters({
  quickFilters,
  isLoading = false,
}: QuickFiltersProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);

  // Helper function to safely access filter values
  const getFilterValue = (key: string): string => {
    return (filters as unknown as Record<string, string>)[key] || "all";
  };

  const handleFilterUpdate = (
    key: keyof ParticipantFiltersType,
    value: string
  ) => {
    updateFilter({ key, value });
  };

  return (
    <>
      {quickFilters.map(filter => (
        <div key={filter.key} className="min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {filter.label}
          </label>
          <Select
            value={getFilterValue(filter.key)}
            onValueChange={value =>
              handleFilterUpdate(
                filter.key as keyof ParticipantFiltersType,
                value
              )
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.values.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </>
  );
}
