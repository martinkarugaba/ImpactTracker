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
} from "../../../../atoms/participants-atoms";
import { type ParticipantFilters as ParticipantFiltersType } from "../../../../types/types";
import { type FilterGroups } from "../types";

interface EmploymentSectionProps {
  filterGroups: FilterGroups;
  isLoading?: boolean;
}

export function EmploymentSection({
  filterGroups,
  isLoading = false,
}: EmploymentSectionProps) {
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

  if (filterGroups.employment.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h5 className="border-b pb-1 text-sm font-medium text-muted-foreground">
        Employment
      </h5>
      <div className="grid grid-cols-4 gap-3">
        {filterGroups.employment.map(filter => (
          <div key={filter.key} className="space-y-1">
            <label className="text-xs font-medium">{filter.label}</label>
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
              <SelectTrigger>
                <SelectValue
                  placeholder={`Select ${filter.label.toLowerCase()}...`}
                />
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
      </div>
    </div>
  );
}
