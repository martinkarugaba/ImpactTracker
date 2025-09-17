"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import {
  getUniqueSkills,
  type SkillsOptions,
} from "../../actions/get-unique-skills";
import { type ParticipantFilters as ParticipantFiltersType } from "../../types/types";

interface EnhancedSkillsFiltersProps {
  filters: ParticipantFiltersType;
  updateFilter: (key: keyof ParticipantFiltersType, value: string) => void;
}

export function EnhancedSkillsFilters({
  filters,
  updateFilter,
}: EnhancedSkillsFiltersProps) {
  const [skillsOptions, setSkillsOptions] = useState<SkillsOptions>({
    vocationalSkills: [],
    softSkills: [],
    businessSkills: [],
  });
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [skillSearchTerms, setSkillSearchTerms] = useState({
    vocational: "",
    soft: "",
    business: "",
  });

  // Load unique skills on component mount
  useEffect(() => {
    const loadSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const skills = await getUniqueSkills();
        setSkillsOptions(skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkills();
  }, []);

  // Filter skills based on search term
  const filterSkills = (skills: string[], searchTerm: string) => {
    if (!searchTerm) return skills;
    return skills.filter(skill =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveSkillsCount = () => {
    let count = 0;
    if (
      filters.specificVocationalSkill &&
      filters.specificVocationalSkill !== "all"
    )
      count++;
    if (filters.specificSoftSkill && filters.specificSoftSkill !== "all")
      count++;
    if (
      filters.specificBusinessSkill &&
      filters.specificBusinessSkill !== "all"
    )
      count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Header with active filters badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Specific Skills
          </span>
          {getActiveSkillsCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveSkillsCount()} active
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* General Skills Status Filters */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
            General Status
          </h4>

          {/* Vocational Skills Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Vocational Skills
            </label>
            <Select
              value={filters.hasVocationalSkills}
              onValueChange={value =>
                updateFilter("hasVocationalSkills", value)
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="yes">Has Vocational Skills</SelectItem>
                <SelectItem value="no">No Vocational Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Soft Skills Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Soft Skills
            </label>
            <Select
              value={filters.hasSoftSkills}
              onValueChange={value => updateFilter("hasSoftSkills", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="yes">Has Soft Skills</SelectItem>
                <SelectItem value="no">No Soft Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Skills Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Business Skills
            </label>
            <Select
              value={filters.hasBusinessSkills}
              onValueChange={value => updateFilter("hasBusinessSkills", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="yes">Has Business Skills</SelectItem>
                <SelectItem value="no">No Business Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specific Vocational Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Specific Vocational Skills
          </h4>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vocational skills..."
              value={skillSearchTerms.vocational}
              onChange={e =>
                setSkillSearchTerms(prev => ({
                  ...prev,
                  vocational: e.target.value,
                }))
              }
              className="h-9 pl-8 text-sm"
            />
          </div>

          {/* Specific Vocational Skill Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Vocational Skill
            </label>
            <Select
              value={filters.specificVocationalSkill || "all"}
              onValueChange={value =>
                updateFilter("specificVocationalSkill", value)
              }
              disabled={isLoadingSkills}
            >
              <SelectTrigger className="h-9">
                <SelectValue
                  placeholder={
                    isLoadingSkills
                      ? "Loading skills..."
                      : "Select specific skill..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vocational Skills</SelectItem>
                {filterSkills(
                  skillsOptions.vocationalSkills,
                  skillSearchTerms.vocational
                ).map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
                {filterSkills(
                  skillsOptions.vocationalSkills,
                  skillSearchTerms.vocational
                ).length === 0 &&
                  skillSearchTerms.vocational && (
                    <SelectItem value="" disabled>
                      No skills found matching "{skillSearchTerms.vocational}"
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specific Soft Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Specific Soft Skills
          </h4>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search soft skills..."
              value={skillSearchTerms.soft}
              onChange={e =>
                setSkillSearchTerms(prev => ({
                  ...prev,
                  soft: e.target.value,
                }))
              }
              className="h-9 pl-8 text-sm"
            />
          </div>

          {/* Specific Soft Skill Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Soft Skill
            </label>
            <Select
              value={filters.specificSoftSkill || "all"}
              onValueChange={value => updateFilter("specificSoftSkill", value)}
              disabled={isLoadingSkills}
            >
              <SelectTrigger className="h-9">
                <SelectValue
                  placeholder={
                    isLoadingSkills
                      ? "Loading skills..."
                      : "Select specific skill..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Soft Skills</SelectItem>
                {filterSkills(
                  skillsOptions.softSkills,
                  skillSearchTerms.soft
                ).map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
                {filterSkills(skillsOptions.softSkills, skillSearchTerms.soft)
                  .length === 0 &&
                  skillSearchTerms.soft && (
                    <SelectItem value="" disabled>
                      No skills found matching "{skillSearchTerms.soft}"
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>

          {/* Specific Business Skill Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Business Skill
            </label>
            <Select
              value={filters.specificBusinessSkill || "all"}
              onValueChange={value =>
                updateFilter("specificBusinessSkill", value)
              }
              disabled={isLoadingSkills}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select business skill..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Skills</SelectItem>
                {skillsOptions.businessSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {getActiveSkillsCount() > 0 && (
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-blue-800 dark:text-blue-200">
              Active Skill Filters:
            </span>
            <div className="flex flex-wrap gap-1">
              {filters.specificVocationalSkill &&
                filters.specificVocationalSkill !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Vocational: {filters.specificVocationalSkill}
                  </Badge>
                )}
              {filters.specificSoftSkill &&
                filters.specificSoftSkill !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Soft: {filters.specificSoftSkill}
                  </Badge>
                )}
              {filters.specificBusinessSkill &&
                filters.specificBusinessSkill !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Business: {filters.specificBusinessSkill}
                  </Badge>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
