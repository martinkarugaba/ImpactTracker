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

interface DemographicsSectionProps {
  filterGroups: FilterGroups;
  isLoading?: boolean;
}

export function DemographicsSection({
  filterGroups,
  isLoading = false,
}: DemographicsSectionProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);

  // Helper function to safely access filter values
  const getFilterValue = (key: string): string => {
    return (filters as Record<string, string>)[key] || "all";
  };

  const handleFilterUpdate = (
    key: keyof ParticipantFiltersType,
    value: string
  ) => {
    updateFilter({ key, value });
  };

  if (filterGroups.demographics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
        Demographics & Personal
      </h5>
      <div className="grid grid-cols-4 gap-3">
        {filterGroups.demographics.map(filter => (
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
