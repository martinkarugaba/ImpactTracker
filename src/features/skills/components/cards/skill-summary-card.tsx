"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Users, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { SkillSummary } from "../../types/types";
import { cn } from "@/lib/utils";

interface SkillSummaryCardProps {
  skill: SkillSummary;
}

export function SkillSummaryCard({ skill }: SkillSummaryCardProps) {
  const skillTypeColors = {
    vocational: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    soft: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    business:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1 space-y-1">
          <CardTitle className="line-clamp-2 text-base font-semibold">
            {skill.skillName}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs", skillTypeColors[skill.skillType])}
          >
            <Award className="mr-1 h-3 w-3" />
            {skill.skillType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Participant Count */}
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </div>
            <div className="text-2xl font-bold">{skill.totalParticipants}</div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-950">
              <div className="font-semibold text-blue-700 dark:text-blue-300">
                {skill.participationsCount}
              </div>
              <div className="text-muted-foreground">Participated</div>
            </div>
            <div className="rounded-md bg-green-50 p-2 dark:bg-green-950">
              <div className="font-semibold text-green-700 dark:text-green-300">
                {skill.completionsCount}
              </div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div className="rounded-md bg-amber-50 p-2 dark:bg-amber-950">
              <div className="font-semibold text-amber-700 dark:text-amber-300">
                {skill.certificationsCount}
              </div>
              <div className="text-muted-foreground">Certified</div>
            </div>
          </div>

          {/* Rates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="font-medium">{skill.completionRate}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Certification Rate</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-amber-600" />
                <span className="font-medium">{skill.certificationRate}%</span>
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <Link
            href={`/dashboard/skills/${encodeURIComponent(skill.skillName)}`}
            className="w-full"
          >
            <Button variant="outline" size="sm" className="w-full">
              View Details
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
