import type { Cluster } from "@/features/clusters/types";
import type { Project } from "@/features/projects/types";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  acronym: z.string().optional(),
  cluster_id: z.string().nullable(),
  selected_cluster_ids: z.array(z.string()),
  project_id: z.string().nullable(),
  country: z.array(z.string()).min(1, "Country is required"),
  district: z.array(z.string()).min(1, "District is required"),
  sub_county_id: z.string().min(1, "Sub-county is required"),
  operation_sub_counties: z.array(z.string()).optional(),
  parish: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export interface OrganizationData {
  id: string;
  name: string;
  acronym?: string | null;
  cluster_id?: string | null;
  project_id?: string | null;
  country?: string;
  district?: string;
  sub_county_id?: string;
  operation_sub_counties?: string[];
  parish?: string | null;
  village?: string | null;
  address?: string | null;
}

export interface LocationInfo {
  code: string;
  name: string;
}

export interface OrganizationFormContextType {
  form: UseFormReturn<OrganizationFormValues>;
  isLoading: boolean;
  projects: Project[];
  clusters: Cluster[];
  countries: LocationInfo[];
  districts: LocationInfo[];
  availableSubCounties: string[];
  currentCountry: LocationInfo | null;
  currentDistrict: LocationInfo | null;
  districtSubCounties: Record<string, string[]>;
  selectedClusterIds: string[];
  setSelectedClusterIds: (ids: string[]) => void;
  handleCountrySelect: (
    countryCode: string,
    countryName: string
  ) => Promise<void>;
  handleDistrictSelect: (
    districtCode: string,
    districtName: string
  ) => Promise<void>;
  handleSubCountySelect: (subCountyName: string) => Promise<void>;
  handleFinishCountry: () => Promise<void>;
  handleAddDistrict: () => Promise<void>;
  setDistrictSubCounties: (value: Record<string, string[]>) => void;
}
