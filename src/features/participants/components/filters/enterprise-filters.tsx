"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface EnterpriseFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
}

export function EnterpriseFilters({
  filters,
  updateFilter,
}: EnterpriseFiltersProps) {
  return (
    <>
      {/* Enterprise Ownership */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Enterprise Ownership
        </label>
        <Select
          value={filters.ownsEnterprise}
          onValueChange={value => updateFilter("ownsEnterprise", value)}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Select ownership..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="true">Owns Enterprise</SelectItem>
            <SelectItem value="false">No Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employment Status */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Employment Status
        </label>
        <Select
          value={filters.employmentStatus}
          onValueChange={value => updateFilter("employmentStatus", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="formal">Formal Employment</SelectItem>
            <SelectItem value="informal">Informal Work</SelectItem>
            <SelectItem value="self-employed">Self-Employed</SelectItem>
            <SelectItem value="unemployed">Unemployed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employment Sector */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Employment Sector
        </label>
        <Select
          value={filters.employmentSector}
          onValueChange={value => updateFilter("employmentSector", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select sector..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="agriculture">Agriculture</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="services">Services</SelectItem>
            <SelectItem value="trade">Trade</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
