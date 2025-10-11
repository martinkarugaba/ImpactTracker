"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSkillsMetrics,
  getSkillsSummary,
  getSkillDetails,
} from "../actions";
import type { SkillType, SkillStatus } from "../types/types";

export function useSkillsMetrics(clusterId?: string) {
  return useQuery({
    queryKey: ["skills-metrics", clusterId],
    queryFn: () => getSkillsMetrics(clusterId),
  });
}

export function useSkillsSummary(clusterId?: string, skillType?: SkillType) {
  return useQuery({
    queryKey: ["skills-summary", clusterId, skillType],
    queryFn: () => getSkillsSummary(clusterId, skillType),
  });
}

export function useSkillDetails(
  skillName: string,
  status?: SkillStatus,
  clusterId?: string
) {
  return useQuery({
    queryKey: ["skill-details", skillName, status, clusterId],
    queryFn: () => getSkillDetails(skillName, status, clusterId),
    enabled: !!skillName,
  });
}
