import { z } from "zod";

export const createVSLASchema = z.object({
  // Basic Information
  name: z.string().min(1, "Group name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  primary_business: z.enum(
    [
      "Agriculture",
      "Bakery",
      "Basket weaving",
      "Boda-boda",
      "Catering and cookery",
      "Hairdressing and cosmetology",
      "Leather and craft making",
      "Others",
    ],
    {
      required_error: "Primary business is required",
    }
  ),
  primary_business_other: z.string().optional(),

  // Organization/Project References
  organization_id: z.string().min(1, "Organization is required"),
  cluster_id: z.string().min(1, "Cluster is required"),
  project_id: z.string().min(1, "Project is required"),

  // Location Information
  country: z.string().min(1, "Country is required"),
  region: z.string().optional(),
  district: z.string().min(1, "District is required"),
  county: z.string().optional(),
  sub_county: z.string().min(1, "Sub-county is required"),
  parish: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),

  // Financial Information
  total_members: z.number().min(0, "Total members must be 0 or greater"),
  total_savings: z.number().min(0, "Total savings must be 0 or greater"),
  total_loans: z.number().min(0, "Total loans must be 0 or greater"),

  // Meeting Information
  meeting_frequency: z.string().min(1, "Meeting frequency is required"),
  meeting_day: z.string().optional(),
  meeting_time: z.string().optional(),
  meeting_location: z.string().optional(),

  // Dates
  formation_date: z.date({
    required_error: "Formation date is required",
  }),
  closing_date: z.date().optional(),

  // Local Leadership
  lc1_chairperson_name: z.string().optional(),
  lc1_chairperson_contact: z.string().optional(),

  // Governance
  has_constitution: z.enum(["yes", "no"], {
    required_error: "Please specify if VSLA has a constitution",
  }),
  has_signed_constitution: z.enum(["yes", "no"], {
    required_error: "Please specify if VSLA has a signed constitution",
  }),

  // Banking Information
  bank_name: z.string().optional(),
  bank_branch: z.string().optional(),
  bank_account_number: z.string().optional(),
  registration_certificate_number: z.string().optional(),

  // SACCO Information
  sacco_member: z.enum(["yes", "no"], {
    required_error: "Please specify if VSLA is a SACCO member",
  }),

  // Additional Information
  notes: z.string().optional(),

  // System fields
  status: z.string().min(1, "Status is required"),
});

export type CreateVSLAInput = z.infer<typeof createVSLASchema>;

export const updateVSLASchema = createVSLASchema.partial();

export type UpdateVSLAInput = z.infer<typeof updateVSLASchema>;
