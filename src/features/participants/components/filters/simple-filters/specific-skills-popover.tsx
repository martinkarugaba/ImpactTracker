"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  participantFiltersAtom,
  updateFilterAtom,
} from "../../../atoms/participants-atoms";
import { type ParticipantFilters as ParticipantFiltersType } from "../../../types/types";
import {
  getUniqueSkills,
  type SkillsOptions,
} from "../../../actions/get-unique-skills";

interface SpecificSkillsPopoverProps {
  activeFiltersCount: number;
  isLoading?: boolean;
}

export function SpecificSkillsPopover({
  activeFiltersCount,
  isLoading = false,
}: SpecificSkillsPopoverProps) {
  const [showSkillsFilters, setShowSkillsFilters] = useState(false);
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const [skillsOptions, setSkillsOptions] = useState<SkillsOptions>({
    vocationalSkills: [],
    softSkills: [],
    businessSkills: [],
  });
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Load unique skills on component mount
  useEffect(() => {
    const loadSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const skills = await getUniqueSkills();
        console.log("🎯 Loaded skills:", skills);
        setSkillsOptions(skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkills();
  }, []);

  const handleFilterUpdate = (
    key: keyof ParticipantFiltersType,
    value: string
  ) => {
    console.log(`🔧 Skills filter update: ${key} = ${value}`);
    console.log("🔧 Current filters before update:", filters);

    // Update the filter
    updateFilter({ key, value });

    // Debug: Check the updated state after a brief delay
    setTimeout(() => {
      console.log("🔧 Filters after update should include:", { [key]: value });
      // Force console log to check if the filter was actually applied
      console.log("🔧 Skills filters state check:", {
        specificVocationalSkill: filters.specificVocationalSkill,
        specificSoftSkill: filters.specificSoftSkill,
        specificBusinessSkill: filters.specificBusinessSkill,
      });
    }, 200);
  };

  // Helper function to convert skills array to ComboboxOption format
  const convertSkillsToOptions = (skills: string[]): ComboboxOption[] => {
    return [
      { value: "all", label: "All Skills" },
      ...skills.map(skill => ({
        value: skill,
        label: skill,
      })),
    ];
  };

  return (
    <div className="min-w-[140px]">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Skills Filters
      </label>
      <Popover open={showSkillsFilters} onOpenChange={setShowSkillsFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="default" className="w-[140px] gap-2">
            <Filter className="h-4 w-4" />
            Skills
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showSkillsFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[600px] max-w-[90vw] overflow-y-auto"
        >
          <div className="relative space-y-4">
            {/* Loading Overlay */}
            {(isLoading || isLoadingSkills) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Loading skills...
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Specific Skills Filters</h4>
            </div>

            {/* Skills Filters Section */}
            <div className="space-y-4">
              <div>
                <h6 className="mb-3 text-xs font-medium tracking-wide text-gray-600 uppercase">
                  Specific Skills
                </h6>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Specific Vocational Skills */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">
                      Vocational Skill
                    </label>
                    <Combobox
                      options={convertSkillsToOptions(
                        skillsOptions.vocationalSkills
                      )}
                      value={filters.specificVocationalSkill || "all"}
                      onValueChange={value =>
                        handleFilterUpdate("specificVocationalSkill", value)
                      }
                      placeholder={
                        isLoadingSkills
                          ? "Loading skills..."
                          : "Select vocational skill..."
                      }
                      emptyMessage="No vocational skills found"
                      disabled={isLoadingSkills || isLoading}
                      className="h-9"
                    />
                  </div>

                  {/* Specific Soft Skills */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">
                      Soft Skill
                    </label>
                    <Combobox
                      options={convertSkillsToOptions(skillsOptions.softSkills)}
                      value={filters.specificSoftSkill || "all"}
                      onValueChange={value =>
                        handleFilterUpdate("specificSoftSkill", value)
                      }
                      placeholder={
                        isLoadingSkills
                          ? "Loading skills..."
                          : "Select soft skill..."
                      }
                      emptyMessage="No soft skills found"
                      disabled={isLoadingSkills || isLoading}
                      className="h-9"
                    />
                  </div>

                  {/* Business Skills - Only show if there are business skills available */}
                  {skillsOptions.businessSkills.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Business Skill
                      </label>
                      <Combobox
                        options={convertSkillsToOptions(
                          skillsOptions.businessSkills
                        )}
                        value={filters.specificBusinessSkill || "all"}
                        onValueChange={value =>
                          handleFilterUpdate("specificBusinessSkill", value)
                        }
                        placeholder={
                          isLoadingSkills
                            ? "Loading skills..."
                            : "Select business skill..."
                        }
                        emptyMessage="No business skills found"
                        disabled={isLoadingSkills || isLoading}
                        className="h-9"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
