import type { userRole } from "@/lib/db/schema";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: (typeof userRole.enumValues)[number];
  created_at: Date;
  updated_at: Date;
  cluster?: {
    id: string;
    name: string;
  } | null;
  organization?: {
    id: string;
    name: string;
    acronym: string;
  } | null;
}
