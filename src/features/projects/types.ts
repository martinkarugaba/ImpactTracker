import type { Organization } from "../organizations/types";

export interface Project {
  id: string;
  name: string;
  acronym: string;
  description: string | null;
  status: "active" | "completed" | "on-hold";
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  organizations?: Organization[];
}
