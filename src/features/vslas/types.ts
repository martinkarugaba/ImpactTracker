export interface VSLA {
  id: string;
  // Basic Information
  name: string; // Group name
  code: string;
  description?: string | null;
  primary_business: string; // Agriculture, Bakery, Basket weaving, Boda-boda, Catering and cookery, Hairdressing and cosmetology, Leather and craft making, Others
  primary_business_other?: string | null; // Specify if "Others" is selected

  // Organization/Project References
  organization_id: string;
  cluster_id: string;
  project_id: string;

  // Location Information
  country: string;
  region?: string | null;
  district: string;
  county?: string | null;
  sub_county: string;
  parish: string;
  village: string;
  address?: string | null;

  // Financial Information
  total_members: number;
  total_savings: number;
  total_loans: number;

  // Meeting Information
  meeting_frequency: string; // weekly, monthly, etc.
  meeting_day?: string | null; // monday, tuesday, etc.
  meeting_time?: string | null;
  meeting_location?: string | null;

  // Dates
  formation_date: Date; // Formation date
  closing_date?: Date | null; // Closing date (optional)

  // Local Leadership
  lc1_chairperson_name?: string | null; // LC1 Chairperson Name
  lc1_chairperson_contact?: string | null; // LC1 Chairperson Contact

  // Governance
  has_constitution: string; // yes/no - VSLA has a constitution
  has_signed_constitution: string; // yes/no - VSLA has a signed constitution

  // Banking Information
  bank_name?: string | null; // Bank name
  bank_branch?: string | null; // Bank branch
  bank_account_number?: string | null; // Bank account number
  registration_certificate_number?: string | null; // Registration certificate number

  // SACCO Information
  sacco_member: string; // yes/no - SACCO Member

  // Additional Information
  notes?: string | null; // Notes

  // System fields
  status: string; // active, inactive, suspended
  created_at: Date | null;
  updated_at: Date | null;

  // Relations (optional)
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

// Primary business options
export const PRIMARY_BUSINESS_OPTIONS = [
  "Agriculture",
  "Bakery",
  "Basket weaving",
  "Boda-boda",
  "Catering and cookery",
  "Hairdressing and cosmetology",
  "Leather and craft making",
  "Others",
] as const;

export type PrimaryBusiness = (typeof PRIMARY_BUSINESS_OPTIONS)[number];

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
