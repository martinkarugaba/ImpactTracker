import { z } from "zod";

export const createVSLASchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  organization_id: z.string().min(1, "Organization is required"),
  cluster_id: z.string().min(1, "Cluster is required"),
  project_id: z.string().min(1, "Project is required"),
  country: z.string().min(1, "Country is required"),
  district: z.string().min(1, "District is required"),
  sub_county: z.string().min(1, "Sub-county is required"),
  parish: z.string().min(1, "Parish is required"),
  village: z.string().min(1, "Village is required"),
  address: z.string().optional(),
  total_members: z.number().min(0, "Total members must be 0 or greater"),
  total_savings: z.number().min(0, "Total savings must be 0 or greater"),
  total_loans: z.number().min(0, "Total loans must be 0 or greater"),
  meeting_frequency: z.string().min(1, "Meeting frequency is required"),
  meeting_day: z.string().optional(),
  meeting_time: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  formed_date: z.date({
    required_error: "Formed date is required",
  }),
});

export type CreateVSLAInput = z.infer<typeof createVSLASchema>;

export const updateVSLASchema = createVSLASchema.partial();

export type UpdateVSLAInput = z.infer<typeof updateVSLASchema>;
