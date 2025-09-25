"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Cluster } from "@/features/clusters/components/clusters-table";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type InferSelectModel } from "drizzle-orm";
import { type countries, type districts } from "@/lib/db/schema";
import { getAllCountries } from "@/features/locations/actions/countries";
import { getAllDistrictsForCountry } from "@/features/locations/actions/districts";
import { getSubCounties } from "@/features/locations/actions/subcounties";
import { Project } from "@/features/projects/types";
import { getProjects } from "@/features/projects/actions/projects";
import {
  createOrganization,
  updateOrganization,
} from "@/features/organizations/actions/organizations";
import { MultiSelectCombobox } from "./location/MultiSelectCombobox";
import { Organization } from "@/features/organizations/types";

interface OrganizationFormProps {
  clusters: Cluster[];
  defaultClusterId?: string;
  organization?: Organization | null;
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

type Country = InferSelectModel<typeof countries>;
type District = InferSelectModel<typeof districts>;
type SubCounty = {
  id: string;
  code: string;
  name: string;
  type?: "subcounty" | "municipality";
};

export function OrganizationForm({
  clusters,
  defaultClusterId,
  organization,
  onSuccess,
  isLoading,
  setIsLoading,
}: OrganizationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [loading, setLoading] = useState({
    projects: false,
    locations: false,
  });

  // Define form schema with only essential fields
  const formSchema = z.object({
    name: z.string().min(2, { message: "Organization name is required" }),
    acronym: z.string().min(1, { message: "Acronym is required" }),
    cluster_id: z.string().min(1, { message: "Please select a cluster" }),
    project_id: z.string().nullable(),
    country: z.string().min(1, { message: "Country is required" }),
    district: z.string().min(1, { message: "District is required" }),
    operation_sub_counties: z.array(z.string()).default([]).optional(),
    address: z.string().min(1, { message: "Address is required" }),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize form with default values
  const defaultFormValues: FormValues = {
    name: organization?.name || "",
    acronym: organization?.acronym || "",
    cluster_id: organization?.cluster_id || defaultClusterId || "",
    project_id: organization?.project_id || "none",
    country: "",
    district: "",
    operation_sub_counties: [],
    address: organization?.address || "",
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(prev => ({ ...prev, projects: true }));
        const result = await getProjects();
        if (result.success && result.data) {
          setProjects(result.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(prev => ({ ...prev, projects: false }));
      }
    };
    fetchProjects();
  }, []);

  // Load countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(prev => ({ ...prev, locations: true }));
        const response = await getAllCountries();
        if (response.success && response.data?.data) {
          setCountries(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    };
    loadCountries();
  }, []);

  // Convert organization data to form values when data is loaded
  useEffect(() => {
    if (!organization || countries.length === 0) return;

    // Convert country code to name
    if (organization.country) {
      const country = countries.find(c => c.code === organization.country);
      if (country && form.getValues("country") !== country.name) {
        form.setValue("country", country.name);
      }
    }

    // Convert district code to name
    if (organization.district && districts.length > 0) {
      const district = districts.find(d => d.code === organization.district);
      if (district && form.getValues("district") !== district.name) {
        form.setValue("district", district.name);
      }
    }

    // Convert operation subcounty codes to names
    if (
      organization.operation_sub_counties &&
      organization.operation_sub_counties.length > 0 &&
      subCounties.length > 0
    ) {
      const operationSubCountyNames = organization.operation_sub_counties
        .map(code => {
          const subCounty = subCounties.find(s => s.code === code);
          return subCounty ? subCounty.name : code;
        })
        .filter(Boolean);

      if (operationSubCountyNames.length > 0) {
        form.setValue("operation_sub_counties", operationSubCountyNames);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, countries, districts, subCounties]);

  // Handle country change
  const handleCountryChange = async (countryId: string) => {
    form.setValue("district", "");
    form.setValue("operation_sub_counties", []);
    setDistricts([]);
    setSubCounties([]);

    if (countryId && countryId !== "none") {
      setLoading(prev => ({ ...prev, locations: true }));
      try {
        const response = await getAllDistrictsForCountry(countryId);
        if (response.success && response.data?.data) {
          setDistricts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    }
  };

  // Handle district change
  const handleDistrictChange = async (
    districtId: string,
    countryId: string
  ) => {
    form.setValue("operation_sub_counties", []);
    setSubCounties([]);

    setLoading(prev => ({ ...prev, locations: true }));
    try {
      const subCountiesResponse = await getSubCounties({
        countryId: countryId,
        districtId: districtId,
      });

      const combinedUnits = (
        (subCountiesResponse.success && subCountiesResponse.data?.data) ||
        []
      ).map(unit => ({
        ...unit,
        type: "subcounty" as const,
      }));

      setSubCounties(combinedUnits);
    } catch (error) {
      console.error("Error fetching subcounties:", error);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Convert names to codes for backend API
    const countryName = values.country;
    const countryMatch = countries.find(c => c.name === countryName);
    if (countryMatch) {
      values.country = countryMatch.code;
    }

    const districtName = values.district;
    const districtMatch = districts.find(d => d.name === districtName);
    if (districtMatch) {
      values.district = districtMatch.code;
    }

    // Convert operation subcounty names to codes
    const operationSubCountyNames = values.operation_sub_counties || [];
    const operationSubCountyCodes = operationSubCountyNames
      .map(name => {
        const match = subCounties.find(s => s.name === name);
        return match ? match.code : name;
      })
      .filter(Boolean);

    values.operation_sub_counties = operationSubCountyCodes;

    setIsLoading(true);
    setError(null);

    try {
      const organizationData = {
        ...values,
        project_id: values.project_id === "none" ? null : values.project_id,
        sub_county_id: values.operation_sub_counties?.[0] || null,
        operation_sub_counties: values.operation_sub_counties || [],
      };

      let result;
      if (organization) {
        result = await updateOrganization(organization.id, organizationData);
      } else {
        result = await createOrganization(organizationData);
      }

      if (!result.success) {
        throw new Error(
          result.error ||
            `Failed to ${organization ? "update" : "create"} organization`
        );
      }

      router.refresh();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acronym"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Acronym <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter acronym" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cluster_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Cluster <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cluster" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clusters.map(cluster => (
                      <SelectItem key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Project (optional)</FormLabel>
                <FormControl>
                  <Combobox
                    options={[
                      { value: "none", label: "No Project" },
                      ...projects.map(project => ({
                        value: project.id,
                        label: project.acronym || project.name,
                      })),
                    ]}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Search and select a project"
                    emptyMessage="No matching projects found"
                    disabled={loading.projects}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Information */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Location Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={countries.map(country => ({
                        value: country.name,
                        label: country.name,
                      }))}
                      value={field.value || ""}
                      onValueChange={value => {
                        field.onChange(value);
                        const selectedCountry = countries.find(
                          c => c.name === value
                        );
                        if (selectedCountry) {
                          handleCountryChange(selectedCountry.id);
                        }
                      }}
                      placeholder="Select a country"
                      emptyMessage="No matching countries found"
                      disabled={loading.locations}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    District <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={districts.map(district => ({
                        value: district.name,
                        label: district.name,
                      }))}
                      value={field.value || ""}
                      onValueChange={value => {
                        field.onChange(value);
                        const district = districts.find(d => d.name === value);
                        const countryName = form.getValues("country");
                        const selectedCountry = countries.find(
                          c => c.name === countryName
                        );
                        if (district && selectedCountry) {
                          handleDistrictChange(district.id, selectedCountry.id);
                        }
                      }}
                      placeholder={
                        districts.length > 0
                          ? "Select a district"
                          : "Select a country first"
                      }
                      emptyMessage="No matching districts found"
                      disabled={!form.getValues("country") || loading.locations}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Operation sub-counties field - Only show for Uganda */}
          {form.getValues("country") === "Uganda" && (
            <FormField
              control={form.control}
              name="operation_sub_counties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation Sub Counties</FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={subCounties.map(subCounty => ({
                        value: subCounty.name,
                        label: subCounty.name,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={
                        subCounties.length > 0
                          ? "Select operation sub-counties"
                          : "Select a district first"
                      }
                      emptyText="No matching sub-counties found"
                      disabled={subCounties.length === 0 || loading.locations}
                      allowCustom={true}
                      customOptionLabel={(input: string) =>
                        `Add "${input}" as custom subcounty`
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Select the sub-counties where this organization operates in
                    Uganda.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Physical Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter physical address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? organization
                ? "Updating..."
                : "Creating..."
              : organization
                ? "Update Organization"
                : "Create Organization"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
