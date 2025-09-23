"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { EmploymentSection } from "./sections/employment-section";
import { type FilterGroups } from "./types";
import { OrganizationLocationSection } from "./sections/organization-location-section";
import { EnterpriseBusinessSection } from "./sections/enterprise-business-section";
import { SkillsEducationSection } from "./sections/skills-education-section";
import { DemographicsSection } from "./sections/demographics-section";

interface MoreFiltersPopoverProps {
  filterGroups: FilterGroups;
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  districts: Array<{ id: string; name: string }>;
  subCounties: Array<{ id: string; name: string }>;
  activeFiltersCount: number;
  isLoading?: boolean;
}

export function MoreFiltersPopover({
  filterGroups,
  projects,
  organizations,
  districts = [],
  subCounties = [],
  activeFiltersCount,
  isLoading = false,
}: MoreFiltersPopoverProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-w-[140px]">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Additional Filters
      </label>
      <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="default" className="w-[140px] gap-2">
            <Filter className="h-4 w-4" />
            More
            {activeFiltersCount > 4 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                +{activeFiltersCount - 4}
              </Badge>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 h-[500px] w-[800px] max-w-[90vw] overflow-y-auto"
        >
          <div className="relative space-y-4">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Applying filters...
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Additional Filters</h4>
            </div>

            <OrganizationLocationSection
              projects={projects}
              organizations={organizations}
              districts={districts}
              subCounties={subCounties}
              isLoading={isLoading}
            />

            <EnterpriseBusinessSection
              filterGroups={filterGroups}
              isLoading={isLoading}
            />

            <SkillsEducationSection
              filterGroups={filterGroups}
              isLoading={isLoading}
            />

            <DemographicsSection
              filterGroups={filterGroups}
              isLoading={isLoading}
            />

            <EmploymentSection
              filterGroups={filterGroups}
              isLoading={isLoading}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
