"use client";

import { useState, useMemo } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type ParticipantFilters as ParticipantFiltersType,
  type Participant,
} from "../../types/types";

interface SimpleParticipantFiltersProps {
  filters: ParticipantFiltersType;
  onFiltersChange: (filters: ParticipantFiltersType) => void;
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  districts?: Array<{ id: string; name: string }>;
  subCounties?: Array<{ id: string; name: string }>;
  participants?: Participant[]; // Add participants data
}

// Function to generate dynamic filter options from actual data
function generateDynamicFilterOptions(participants: Participant[] = []) {
  // Helper function to create options from participant data
  const createDynamicOptions = (
    key: keyof Participant,
    label: string,
    transform?: (value: string) => string
  ) => {
    const uniqueValues = participants
      .map(p => p[key])
      .filter(
        (value, index, arr) =>
          value &&
          value !== "all" &&
          typeof value === "string" &&
          arr.indexOf(value) === index
      )
      .sort();

    return {
      key,
      label,
      values: [
        { value: "all", label: "All" },
        ...uniqueValues.map(value => ({
          value: value as string,
          label: transform
            ? transform(value as string)
            : capitalizeFirst(value as string),
        })),
      ],
    };
  };

  // Helper function to capitalize first letter
  const capitalizeFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_]/g, " ");

  // Core demographic filters
  const sexOptions = createDynamicOptions("sex", "Gender", value =>
    value === "male"
      ? "Male"
      : value === "female"
        ? "Female"
        : capitalizeFirst(value)
  );

  const hasAgeData = participants.some(p => p.age || p.dateOfBirth);
  const ageGroupOptions = hasAgeData
    ? {
        key: "ageGroup",
        label: "Age",
        values: [
          { value: "all", label: "All Ages" },
          { value: "young", label: "Youth (15-35)" },
          { value: "adult", label: "Adults (36-59)" },
          { value: "older", label: "Elderly (60+)" },
        ],
      }
    : null;

  // Employment and enterprise filters
  const employmentTypeOptions = createDynamicOptions(
    "employmentType",
    "Employment Type"
  );
  const employmentSectorOptions = createDynamicOptions(
    "employmentSector",
    "Employment Sector"
  );
  const enterpriseSectorOptions = createDynamicOptions(
    "enterpriseSector",
    "Enterprise Sector"
  );
  const businessScaleOptions = createDynamicOptions(
    "businessScale",
    "Business Scale"
  );

  // Skills filters
  const vocationalSkillsOptions = {
    key: "hasVocationalSkills",
    label: "Vocational Skills",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Has Skills" },
      { value: "no", label: "No Skills" },
    ],
  };

  const softSkillsOptions = {
    key: "hasSoftSkills",
    label: "Soft Skills",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Has Skills" },
      { value: "no", label: "No Skills" },
    ],
  };

  const businessSkillsOptions = {
    key: "hasBusinessSkills",
    label: "Business Skills",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Has Skills" },
      { value: "no", label: "No Skills" },
    ],
  };

  // Education and demographics
  const educationLevelOptions = createDynamicOptions(
    "educationLevel",
    "Education"
  );
  const maritalStatusOptions = createDynamicOptions(
    "maritalStatus",
    "Marital Status"
  );
  const sourceOfIncomeOptions = createDynamicOptions(
    "sourceOfIncome",
    "Income Source"
  );
  const populationSegmentOptions = createDynamicOptions(
    "populationSegment",
    "Population Segment"
  );

  // VSLA and enterprise ownership
  const vslaOptions = {
    key: "isSubscribedToVSLA",
    label: "VSLA",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Member" },
      { value: "no", label: "Non-Member" },
    ],
  };

  const enterpriseOwnershipOptions = {
    key: "ownsEnterprise",
    label: "Enterprise Owner",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Owns Enterprise" },
      { value: "no", label: "No Enterprise" },
    ],
  };

  // Special demographic filters
  const pwdOptions = {
    key: "isPWD",
    label: "PWD",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "PWD" },
      { value: "no", label: "Non-PWD" },
    ],
  };

  const studentOptions = {
    key: "isActiveStudent",
    label: "Student",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Student" },
      { value: "no", label: "Non-Student" },
    ],
  };

  const teenMotherOptions = {
    key: "isTeenMother",
    label: "Teen Mother",
    values: [
      { value: "all", label: "All" },
      { value: "yes", label: "Teen Mother" },
      { value: "no", label: "Not Teen Mother" },
    ],
  };

  // Return organized filter groups
  return {
    quick: [sexOptions, ageGroupOptions, employmentTypeOptions, vslaOptions]
      .filter(Boolean)
      .filter((item): item is NonNullable<typeof item> => item !== null),

    enterprise: [
      enterpriseOwnershipOptions,
      enterpriseSectorOptions,
      businessScaleOptions,
      sourceOfIncomeOptions,
    ].filter(option => option.values.length > 1),

    skills: [
      vocationalSkillsOptions,
      softSkillsOptions,
      businessSkillsOptions,
      studentOptions,
    ],

    demographics: [
      educationLevelOptions,
      maritalStatusOptions,
      populationSegmentOptions,
      pwdOptions,
      teenMotherOptions,
    ].filter(option => option.values.length > 1),

    employment: [employmentTypeOptions, employmentSectorOptions].filter(
      option => option.values.length > 1
    ),
  };
}

export function SimpleParticipantFilters({
  filters,
  onFiltersChange,
  projects,
  organizations,
  districts = [],
  subCounties = [],
  participants = [],
}: SimpleParticipantFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generate organized filter options based on actual data
  const filterGroups = useMemo(
    () => generateDynamicFilterOptions(participants),
    [participants]
  );

  const updateFilter = (key: keyof ParticipantFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Helper function to safely access filter values
  const getFilterValue = (key: string): string => {
    return (filters as Record<string, string>)[key] || "all";
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      project: "all",
      organization: "all",
      district: "all",
      subCounty: "all",
      enterprise: "all",
      sex: "all",
      isPWD: "all",
      ageGroup: "all",
      maritalStatus: "all",
      educationLevel: "all",
      isSubscribedToVSLA: "all",
      ownsEnterprise: "all",
      employmentType: "all",
      employmentSector: "all",
      hasVocationalSkills: "all",
      hasSoftSkills: "all",
      hasBusinessSkills: "all",
      populationSegment: "all",
      isActiveStudent: "all",
      isTeenMother: "all",
      sourceOfIncome: "all",
      enterpriseSector: "all",
      businessScale: "all",
      nationality: "all",
      locationSetting: "all",
      isRefugee: "all",
      isMother: "all",
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false;
      return value !== "" && value !== "all";
    }).length;
  };

  const getActiveFilterBadges = () => {
    const allFilters = [
      ...filterGroups.quick,
      ...filterGroups.enterprise,
      ...filterGroups.skills,
      ...filterGroups.demographics,
      ...filterGroups.employment,
    ];

    return Object.entries(filters)
      .filter(
        ([key, value]) => key !== "search" && value !== "" && value !== "all"
      )
      .map(([key, value]) => {
        const filterOption = allFilters.find(f => f?.key === key);
        const displayValue = filterOption
          ? filterOption.values.find(v => v.value === value)?.label || value
          : value;

        return (
          <Badge key={key} variant="secondary" className="gap-1 text-xs">
            {filterOption?.label || key}: {displayValue}
            <X
              className="hover:text-destructive h-3 w-3 cursor-pointer"
              onClick={() =>
                updateFilter(key as keyof ParticipantFiltersType, "all")
              }
            />
          </Badge>
        );
      });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[250px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search participants..."
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Filters */}
        {filterGroups.quick.map(filter => (
          <Select
            key={filter.key}
            value={getFilterValue(filter.key)}
            onValueChange={value =>
              updateFilter(filter.key as keyof ParticipantFiltersType, value)
            }
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
        ))}

        {/* More Filters Popover */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
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
            className="animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-[80vh] w-[700px] overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Additional Filters</h4>
              </div>

              {/* Organization & Location Section */}
              <div className="space-y-4">
                <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
                  Organization & Location
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <Select
                      value={filters.project}
                      onValueChange={value => updateFilter("project", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.acronym}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization</label>
                    <Select
                      value={filters.organization}
                      onValueChange={value =>
                        updateFilter("organization", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.acronym}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">District</label>
                    <Select
                      value={filters.district}
                      onValueChange={value => updateFilter("district", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {districts.map(district => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sub County</label>
                    <Select
                      value={filters.subCounty}
                      onValueChange={value => updateFilter("subCounty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub county..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sub Counties</SelectItem>
                        {subCounties.map(subCounty => (
                          <SelectItem key={subCounty.id} value={subCounty.id}>
                            {subCounty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Enterprise & Business Section */}
              {filterGroups.enterprise.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
                    Enterprise & Business
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {filterGroups.enterprise.map(filter => (
                      <div key={filter.key} className="space-y-2">
                        <label className="text-sm font-medium">
                          {filter.label}
                        </label>
                        <Select
                          value={getFilterValue(filter.key)}
                          onValueChange={value =>
                            updateFilter(
                              filter.key as keyof ParticipantFiltersType,
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${filter.label.toLowerCase()}...`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.values.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills & Education Section */}
              <div className="space-y-4">
                <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
                  Skills & Education
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  {filterGroups.skills.map(filter => (
                    <div key={filter.key} className="space-y-2">
                      <label className="text-sm font-medium">
                        {filter.label}
                      </label>
                      <Select
                        value={getFilterValue(filter.key)}
                        onValueChange={value =>
                          updateFilter(
                            filter.key as keyof ParticipantFiltersType,
                            value
                          )
                        }
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

              {/* Demographics & Personal Section */}
              {filterGroups.demographics.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
                    Demographics & Personal
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {filterGroups.demographics.map(filter => (
                      <div key={filter.key} className="space-y-2">
                        <label className="text-sm font-medium">
                          {filter.label}
                        </label>
                        <Select
                          value={getFilterValue(filter.key)}
                          onValueChange={value =>
                            updateFilter(
                              filter.key as keyof ParticipantFiltersType,
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${filter.label.toLowerCase()}...`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.values.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employment Section */}
              {filterGroups.employment.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
                    Employment
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {filterGroups.employment.map(filter => (
                      <div key={filter.key} className="space-y-2">
                        <label className="text-sm font-medium">
                          {filter.label}
                        </label>
                        <Select
                          value={getFilterValue(filter.key)}
                          onValueChange={value =>
                            updateFilter(
                              filter.key as keyof ParticipantFiltersType,
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${filter.label.toLowerCase()}...`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.values.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="animate-in fade-in-0 slide-in-from-top-1 flex flex-wrap items-center gap-2 duration-300">
          <span className="text-muted-foreground text-sm">Active filters:</span>
          {getActiveFilterBadges()}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
