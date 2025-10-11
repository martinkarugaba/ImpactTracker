"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { useSkillsSummary } from "../../hooks/use-skills";
import { SkillSummaryCard } from "../cards/skill-summary-card";
import type { SkillType } from "../../types/types";

interface SkillsContainerProps {
  clusterId?: string;
}

export function SkillsContainer({ clusterId }: SkillsContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillType, setSkillType] = useState<SkillType | "all">("all");

  const { data: response, isLoading } = useSkillsSummary(
    clusterId,
    skillType === "all" ? undefined : skillType
  );

  const skills = response?.data || [];

  // Filter skills by search query
  const filteredSkills = skills.filter(skill =>
    skill.skillName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search Skills</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search"
                  placeholder="Search by skill name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillType">Skill Type</Label>
              <Select
                value={skillType}
                onValueChange={value =>
                  setSkillType(value as SkillType | "all")
                }
              >
                <SelectTrigger id="skillType">
                  <SelectValue placeholder="Select skill type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="vocational">Vocational Skills</SelectItem>
                  <SelectItem value="soft">Soft Skills</SelectItem>
                  <SelectItem value="business">Business Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSkills.map(skill => (
            <SkillSummaryCard key={skill.skillName} skill={skill} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="text-muted-foreground/50 h-12 w-12" />
            <h4 className="mt-4 text-lg font-semibold">No skills found</h4>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              {searchQuery
                ? `No skills match your search for "${searchQuery}"`
                : "No skills have been recorded yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
