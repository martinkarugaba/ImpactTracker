"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface VSLAFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
}

export function VSLAFilters({ filters, updateFilter }: VSLAFiltersProps) {
  return (
    <>
      {/* VSLA Subscription Status */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          VSLA Participation
        </label>
        <Select
          value={filters.isSubscribedToVSLA}
          onValueChange={value => updateFilter("isSubscribedToVSLA", value)}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Select participation..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="true">VSLA Member</SelectItem>
            <SelectItem value="false">Not VSLA Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teen Mother Status */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Teen Mother
        </label>
        <Select
          value={filters.isTeenMother}
          onValueChange={value => updateFilter("isTeenMother", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="true">Teen Mother</SelectItem>
            <SelectItem value="false">Not Teen Mother</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source of Income */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Income Source
        </label>
        <Select
          value={filters.sourceOfIncome}
          onValueChange={value => updateFilter("sourceOfIncome", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select source..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="employment">Employment</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="agriculture">Agriculture</SelectItem>
            <SelectItem value="remittances">Remittances</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
