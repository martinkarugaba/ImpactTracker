"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface SkillsFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
}

export function SkillsFilters({ filters, updateFilter }: SkillsFiltersProps) {
  return (
    <>
      {/* Vocational Skills */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Vocational Skills
        </label>
        <Select
          value={filters.hasVocationalSkills}
          onValueChange={value => updateFilter("hasVocationalSkills", value)}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Select skills..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="yes">Has Vocational Skills</SelectItem>
            <SelectItem value="no">No Vocational Skills</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Soft Skills */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Soft Skills
        </label>
        <Select
          value={filters.hasSoftSkills}
          onValueChange={value => updateFilter("hasSoftSkills", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select skills..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="yes">Has Soft Skills</SelectItem>
            <SelectItem value="no">No Soft Skills</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Business Skills */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Business Skills
        </label>
        <Select
          value={filters.hasBusinessSkills}
          onValueChange={value => updateFilter("hasBusinessSkills", value)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Select skills..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="yes">Has Business Skills</SelectItem>
            <SelectItem value="no">No Business Skills</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Population Segment */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Population Segment
        </label>
        <Select
          value={filters.populationSegment}
          onValueChange={value => updateFilter("populationSegment", value)}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Select segment..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="youth">Youth</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="pwd">PWD</SelectItem>
            <SelectItem value="elderly">Elderly</SelectItem>
            <SelectItem value="refugee">Refugee</SelectItem>
            <SelectItem value="host">Host Community</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Student Status */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Student Status
        </label>
        <Select
          value={filters.isActiveStudent}
          onValueChange={value => updateFilter("isActiveStudent", value)}
        >
          <SelectTrigger className="h-9 w-32">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="true">Active Student</SelectItem>
            <SelectItem value="false">Not Student</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
