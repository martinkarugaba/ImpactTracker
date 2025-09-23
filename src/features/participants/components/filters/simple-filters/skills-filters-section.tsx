"use client";

import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  participantFiltersAtom,
  updateFilterAtom,
} from "../../../atoms/participants-atoms";
import { type ParticipantFilters as ParticipantFiltersType } from "../../../types/types";
import {
  getUniqueSkills,
  type SkillsOptions,
} from "../../../actions/get-unique-skills";

interface SkillsFiltersSectionProps {
  isLoading?: boolean;
}

export function SkillsFiltersSection({
  isLoading = false,
}: SkillsFiltersSectionProps) {
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
    updateFilter({ key, value });
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
              options={convertSkillsToOptions(skillsOptions.vocationalSkills)}
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
                isLoadingSkills ? "Loading skills..." : "Select soft skill..."
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
                options={convertSkillsToOptions(skillsOptions.businessSkills)}
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
  );
}
