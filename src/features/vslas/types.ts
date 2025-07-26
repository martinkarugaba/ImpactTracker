export interface VSLA {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  organization_id: string;
  cluster_id: string;
  project_id: string;
  country: string;
  district: string;
  sub_county: string;
  parish: string;
  village: string;
  address: string | null;
  total_members: number;
  total_savings: number;
  total_loans: number;
  meeting_frequency: string; // weekly, monthly, etc.
  meeting_day?: string | null; // monday, tuesday, etc.
  meeting_time?: string | null;
  status: string; // active, inactive, suspended
  formed_date: Date;
  created_at: Date | null;
  updated_at: Date | null;
  organization?: {
    id: string;
    name: string;
    acronym: string;
  } | null;
  cluster?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
    acronym: string;
  } | null;
}

export interface VSLAMember {
  id: string;
  vsla_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  role: string; // chairperson, secretary, treasurer, member
  joined_date: Date;
  total_savings: number;
  total_loans: number;
  status: string; // active, inactive, suspended
  created_at: Date | null;
  updated_at: Date | null;
}
