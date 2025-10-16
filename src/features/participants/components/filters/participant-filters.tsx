"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFilterState } from "./use-filter-state";
import { FilterHeader } from "./filter-header";
import { OrganizationFilters } from "./organization-filters";
import { LocationFilters } from "./location-filters";
import { DemographicFilters } from "./demographic-filters";
import { VSLAFilters } from "./vsla-filters";
import { EnterpriseFilters } from "./enterprise-filters";
import { EnhancedSkillsFilters } from "./enhanced-skills-filters";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface ParticipantFiltersProps {
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{
    id: string;
    name: string;
    acronym: string;
  }>;
  _clusters: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  districts?: Array<{ id: string; name: string }>;
  subCounties?: Array<{ id: string; name: string }>;
  counties?: Array<{ id: string; name: string }>;
  parishes?: Array<{ id: string; name: string }>;
  villages?: Array<{ id: string; name: string }>;
  enterprises?: Array<{ id: string; name: string }>;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

interface FilterSection {
  id: string;
  title: string;
  color: string;
  component: React.ReactNode;
  priority: "essential" | "common" | "advanced";
}

export function ParticipantFilters({
  filters,
  onFiltersChange,
  projects,
  _clusters: _,
  organizations = [],
  districts = [],
  subCounties = [],
  counties = [],
  parishes = [],
  villages = [],
  enterprises = [],
  searchTerm: _searchTerm,
  onSearchChange: _onSearchChange,
}: ParticipantFiltersProps) {
  const { updateFilter, clearFilters, removeFilter, hasActiveFilters } =
    useFilterState({
      filters,
      onFiltersChange,
    });

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    organization: true, // Essential - always visible by default
    demographics: true, // Essential - always visible by default
    location: false,
    vsla: false,
    enterprise: false,
    skills: false,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getActiveFiltersCount = (sectionFilters: string[]) => {
    return sectionFilters.filter(key => {
      const value = filters[key as keyof ParticipantFiltersType];
      return value !== "" && value !== "all";
    }).length;
  };

  const filterSections: FilterSection[] = [
    {
      id: "organization",
      title: "Organization & Project",
      color: "bg-blue-500",
      priority: "essential",
      component: (
        <OrganizationFilters
          filters={filters}
          updateFilter={updateFilter}
          projects={projects}
          organizations={organizations}
          enterprises={enterprises}
        />
      ),
    },
    {
      id: "demographics",
      title: "Demographics",
      color: "bg-purple-500",
      priority: "essential",
      component: (
        <DemographicFilters filters={filters} updateFilter={updateFilter} />
      ),
    },
    {
      id: "location",
      title: "Location",
      color: "bg-green-500",
      priority: "common",
      component: (
        <LocationFilters
          filters={filters}
          updateFilter={updateFilter}
          districts={districts}
          subCounties={subCounties}
          counties={counties}
          parishes={parishes}
          villages={villages}
        />
      ),
    },
    {
      id: "vsla",
      title: "VSLA & Financial",
      color: "bg-orange-500",
      priority: "common",
      component: <VSLAFilters filters={filters} updateFilter={updateFilter} />,
    },
    {
      id: "enterprise",
      title: "Business & Employment",
      color: "bg-red-500",
      priority: "advanced",
      component: (
        <EnterpriseFilters filters={filters} updateFilter={updateFilter} />
      ),
    },
    {
      id: "skills",
      title: "Skills & Development",
      color: "bg-teal-500",
      priority: "advanced",
      component: (
        <EnhancedSkillsFilters filters={filters} updateFilter={updateFilter} />
      ),
    },
  ];

  const essentialFilters = filterSections.filter(
    s => s.priority === "essential"
  );
  const commonFilters = filterSections.filter(s => s.priority === "common");
  const advancedFilters = filterSections.filter(s => s.priority === "advanced");

  const FilterSectionComponent = ({ section }: { section: FilterSection }) => {
    const sectionKeys = getSectionFilterKeys(section.id);
    const activeCount = getActiveFiltersCount(sectionKeys);
    const isExpanded = expandedSections[section.id];

    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={() => toggleSection(section.id)}
        className="overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-sm"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between rounded-none p-3 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${section.color}`}></div>
              <span className="text-sm font-medium">{section.title}</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="px-2 py-0 text-xs">
                  {activeCount}
                </Badge>
              )}
            </div>
            <div className="transition-transform duration-200 ease-in-out">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden px-3 pb-3 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {section.component}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const getSectionFilterKeys = (sectionId: string): string[] => {
    switch (sectionId) {
      case "organization":
        return ["project", "organization", "enterprise"];
      case "demographics":
        return ["sex", "ageGroup", "isPWD", "maritalStatus", "educationLevel"];
      case "location":
        return ["district", "county", "subCounty", "parish", "village"];
      case "vsla":
        return ["isSubscribedToVSLA"];
      case "enterprise":
        return ["ownsEnterprise", "employmentType", "employmentSector"];
      case "skills":
        return ["hasVocationalSkills", "hasSoftSkills", "hasBusinessSkills"];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-3">
      {/* Active Filter Header - Only show when there are active filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <FilterHeader
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              filters={filters}
              filterOptions={{
                projects,
                organizations,
                districts,
                subCounties,
                counties,
                parishes,
                villages,
                enterprises,
              }}
              onRemoveFilter={removeFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Essential Filters - Always visible */}
      <div className="space-y-2">
        {essentialFilters.map(section => (
          <FilterSectionComponent key={section.id} section={section} />
        ))}
      </div>

      {/* Common Filters - Grouped and collapsible */}
      {commonFilters.length > 0 && (
        <div className="space-y-2">
          {commonFilters.map(section => (
            <FilterSectionComponent key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* Advanced Filters - Hidden by default */}
      {advancedFilters.length > 0 && (
        <div className="space-y-2">
          <Collapsible
            open={showAdvancedFilters}
            onOpenChange={setShowAdvancedFilters}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-sm transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedFilters
                  ? "Hide Advanced Filters"
                  : "Show Advanced Filters"}
                <div className="transition-transform duration-200 ease-in-out">
                  {showAdvancedFilters ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              {advancedFilters.map(section => (
                <FilterSectionComponent key={section.id} section={section} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
