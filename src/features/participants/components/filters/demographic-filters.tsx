"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface DemographicFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
}

export function DemographicFilters({
  filters,
  updateFilter,
}: DemographicFiltersProps) {
  return (
    <>
      {/* Gender Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Gender
        </label>
        <Select
          value={filters.sex}
          onValueChange={value => updateFilter("sex", value)}
        >
          <SelectTrigger className="h-9 w-32">
            <SelectValue placeholder="Select gender..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Age Group Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Age Group
        </label>
        <Select
          value={filters.ageGroup}
          onValueChange={value => updateFilter("ageGroup", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select age..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="young">Youth (15-35)</SelectItem>
            <SelectItem value="adult">Adults (36-59)</SelectItem>
            <SelectItem value="older">Elderly (60+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PWD Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Disability Status
        </label>
        <Select
          value={filters.isPWD}
          onValueChange={value => updateFilter("isPWD", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="true">Person with Disability</SelectItem>
            <SelectItem value="false">No Disability</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Marital Status Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Marital Status
        </label>
        <Select
          value={filters.maritalStatus}
          onValueChange={value => updateFilter("maritalStatus", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="divorced">Divorced</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Education Level Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Education Level
        </label>
        <Select
          value={filters.educationLevel}
          onValueChange={value => updateFilter("educationLevel", value)}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Select education..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="none">No Formal Education</SelectItem>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="tertiary">Tertiary</SelectItem>
            <SelectItem value="university">University</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
