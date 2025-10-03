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

interface SkillsFiltersProps {
  isLoading?: boolean;
  clusterId?: string;
}

export function SkillsFilters({
  isLoading = false,
  clusterId,
}: SkillsFiltersProps) {
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
        const skills = await getUniqueSkills(clusterId);
        console.log("🎯 Loaded skills for inline filters:", skills);
        setSkillsOptions(skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkills();
  }, [clusterId]);

  const handleFilterUpdate = (
    key: keyof ParticipantFiltersType,
    value: string
  ) => {
    console.log(`🔧 Skills filter update: ${key} = ${value}`);
    updateFilter({ key, value });
  };

  // Helper function to convert skills array to ComboboxOption format
  const convertSkillsToOptions = (skills: string[]): ComboboxOption[] => {
    const sanitizeLabel = (s: string) => s.replace(/["'{}]/g, "").trim();
    const seen = new Set<string>();
    const options: ComboboxOption[] = [{ value: "all", label: "All" }];
    for (const skill of skills) {
      const label = sanitizeLabel(skill);
      const key = label.toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        options.push({ value: skill, label });
      }
    }
    return options;
  };

  const isDisabled = isLoadingSkills || isLoading;

  return (
    <>
      {/* Vocational Skills Filter */}
      <div className="min-w-[180px]">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Vocational Skill
        </label>
        <Combobox
          options={convertSkillsToOptions(skillsOptions.vocationalSkills)}
          value={filters.specificVocationalSkill || "all"}
          onValueChange={value =>
            handleFilterUpdate("specificVocationalSkill", value)
          }
          placeholder={
            isLoadingSkills ? "Loading..." : "Select vocational skill..."
          }
          emptyMessage="No vocational skills found"
          disabled={isDisabled}
          className="h-9"
        />
      </div>

      {/* Soft Skills Filter */}
      <div className="min-w-[180px]">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Soft Skill
        </label>
        <Combobox
          options={convertSkillsToOptions(skillsOptions.softSkills)}
          value={filters.specificSoftSkill || "all"}
          onValueChange={value =>
            handleFilterUpdate("specificSoftSkill", value)
          }
          placeholder={isLoadingSkills ? "Loading..." : "Select soft skill..."}
          emptyMessage="No soft skills found"
          disabled={isDisabled}
          className="h-9"
        />
      </div>

      {/* Business Skills Filter - Only show if there are business skills available */}
      {skillsOptions.businessSkills.length > 0 && (
        <div className="min-w-[180px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Skill
          </label>
          <Combobox
            options={convertSkillsToOptions(skillsOptions.businessSkills)}
            value={filters.specificBusinessSkill || "all"}
            onValueChange={value =>
              handleFilterUpdate("specificBusinessSkill", value)
            }
            placeholder={
              isLoadingSkills ? "Loading..." : "Select business skill..."
            }
            emptyMessage="No business skills found"
            disabled={isDisabled}
            className="h-9"
          />
        </div>
      )}
    </>
  );
}
