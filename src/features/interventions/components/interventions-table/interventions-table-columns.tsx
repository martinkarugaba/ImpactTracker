import type { Intervention } from "../../types/types";

export const interventionsColumns = [
  { key: "participantName", label: "Participant" },
  { key: "participantContact", label: "Contact" },
  { key: "activityTitle", label: "Activity" },
  { key: "skillCategory", label: "Skill Category" },
  { key: "outcomes", label: "Outcomes" },
  { key: "source", label: "Source" },
] as const;

export type InterventionColumnKey = keyof Intervention;
