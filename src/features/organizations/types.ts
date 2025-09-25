export interface Organization {
  id: string;
  name: string;
  acronym: string;
  cluster_id: string | null;
  project_id: string | null;
  country: string;
  district: string;
  sub_county_id: string | null; // Main location subcounty
  operation_sub_counties: string[]; // Subcounties of operation
  parish: string;
  village: string;
  address: string;
  created_at: Date | null;
  updated_at: Date | null;
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

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}
