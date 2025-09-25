import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  acronym: z.string().min(1, "Acronym is required"),
  cluster_id: z.string().nullable(),
  project_id: z.string().nullable(),
  country: z.string().min(1, "Country is required"),
  district: z.string().min(1, "District is required"),
  sub_county_id: z.string().nullable(), // Main location subcounty
  operation_sub_counties: z.array(z.string()), // Subcounties of operation
  parish: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
