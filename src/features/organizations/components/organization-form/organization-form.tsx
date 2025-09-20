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
import {
  type countries,
  type districts,
  type subCounties,
} from "@/lib/db/schema";
import { getAllCountries } from "@/features/locations/actions/countries";
import { getAllDistrictsForCountry } from "@/features/locations/actions/districts";
import { getSubCounties } from "@/features/locations/actions/subcounties";
import { getVillages } from "@/features/locations/actions/villages";
import { getMunicipalities } from "@/features/locations/actions/municipalities";
import { getCities } from "@/features/locations/actions/cities";
import { getParishes } from "@/features/locations/actions/parishes";
import {
  getWards,
  getDivisions,
} from "@/features/locations/actions/administrative-units";
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
  organization?: Organization | null; // For editing existing organization
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

// Add type definitions
type Country = InferSelectModel<typeof countries>;
type District = InferSelectModel<typeof districts>;
type SubCounty = InferSelectModel<typeof subCounties> & {
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
  const [parishes, setParishes] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [villages, setVillages] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [municipalities, setMunicipalities] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [cities, setCities] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [wards, setWards] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [divisions, setDivisions] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState({
    projects: false,
    locations: false,
  });

  // Fetch projects using server action
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(prev => ({ ...prev, projects: true }));
        const result = await getProjects();
        if (result.success && result.data) {
          setProjects(result.data);
        } else {
          console.error(
            "Error fetching projects:",
            result.error || "No projects data returned"
          );
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(prev => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, []);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(prev => ({ ...prev, locations: true }));
        const response = await getAllCountries();
        if (response.success && response.data?.data) {
          setCountries(response.data.data);
        } else {
          console.error("Error loading countries:", response.error);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    };

    loadCountries();
  }, []);

  // Pre-load location data when editing an existing organization
  useEffect(() => {
    const preLoadLocationData = async () => {
      if (!organization || !organization.country) return;

      console.log(
        "Pre-loading location data for existing organization:",
        organization
      );

      setLoading(prev => ({ ...prev, locations: true }));

      try {
        // Find the country ID from the organization's country code/name
        const countryRecord = countries.find(
          c =>
            c.code === organization.country || c.name === organization.country
        );

        if (countryRecord) {
          // Load districts for the organization's country
          const districtsResponse = await getAllDistrictsForCountry(
            countryRecord.id
          );
          if (districtsResponse.success && districtsResponse.data?.data) {
            setDistricts(districtsResponse.data.data);
            console.log(
              `Loaded ${districtsResponse.data.data.length} districts for country ${organization.country}`
            );
          }
        } else {
          console.warn(`Country not found: ${organization.country}`);
        }

        // Load subcounties for the organization's district
        if (organization.district) {
          const [subCountiesResponse, municipalitiesResponse] =
            await Promise.all([
              getSubCounties({
                countryId: organization.country,
                districtId: organization.district,
              }),
              getMunicipalities({
                districtId: organization.district,
              }),
            ]);

          // Combine administrative units
          const combinedUnits = [
            ...(
              (subCountiesResponse.success && subCountiesResponse.data?.data) ||
              []
            ).map(unit => ({
              ...unit,
              type: "subcounty" as const,
            })),
            ...(
              (municipalitiesResponse.success &&
                municipalitiesResponse.data?.data) ||
              []
            ).map(unit => ({
              ...unit,
              type: "municipality" as const,
            })),
          ];

          setSubCounties(combinedUnits);
          console.log(
            `Loaded ${combinedUnits.length} administrative units for district ${organization.district}`
          );
        }

        // Load parishes if organization has a subcounty that supports parishes
        if (organization.sub_county_id && organization.parish) {
          const parishesResponse = await getParishes({
            subCountyId: organization.sub_county_id,
          });
          if (parishesResponse.success && parishesResponse.data?.data) {
            setParishes(parishesResponse.data.data);
            console.log(
              `Loaded ${parishesResponse.data.data.length} parishes for subcounty ${organization.sub_county_id}`
            );
          }

          // Load villages if organization has a parish
          if (organization.parish) {
            const villagesResponse = await getVillages({
              parishId: organization.parish,
            });
            if (villagesResponse.success && villagesResponse.data?.data) {
              setVillages(villagesResponse.data.data);
              console.log(
                `Loaded ${villagesResponse.data.data.length} villages for parish ${organization.parish}`
              );
            }
          }
        }
      } catch (error) {
        console.error("Error pre-loading location data:", error);
      } finally {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    };

    preLoadLocationData();
  }, [organization, countries]);

  // Load districts when country changes
  const handleCountryChange = async (countryId: string) => {
    console.log(`handleCountryChange called with countryId: ${countryId}`);

    // Reset dependent fields for all cases
    form.setValue("district", "");
    form.setValue("sub_county_id", "");
    form.setValue("operation_sub_counties", []);
    form.setValue("parish", "");
    form.setValue("village", "");
    setDistricts([]);
    setSubCounties([]);
    setParishes([]);
    setVillages([]);

    // Only load districts if a valid country (not 'none') is selected
    if (countryId && countryId !== "none") {
      console.log(`Loading districts for country ID ${countryId}`);
      // Set loading state
      setLoading(prev => ({ ...prev, locations: true }));

      // Load districts for this country
      try {
        const response = await getAllDistrictsForCountry(countryId);
        console.log(`Districts returned for ${countryId}:`, response);

        if (response.success && response.data?.data) {
          setDistricts(response.data.data);
          console.log(
            `${response.data.data.length} districts set for ${countryId}`
          );
        } else {
          console.warn(`No districts found for country ${countryId}`);
        }
      } catch (error) {
        console.error(
          `Error fetching districts for country ${countryId}:`,
          error
        );
      } finally {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    } else {
      console.log("No valid country ID provided, skipping district loading");
    }
  };

  // Load sub-counties when district changes
  const handleDistrictChange = async (
    districtCode: string,
    countryId: string
  ) => {
    console.log(
      `handleDistrictChange called with districtCode: ${districtCode}, countryId: ${countryId}`
    );

    // Set the form value
    form.setValue("district", districtCode);

    // Reset dependent fields
    form.setValue("sub_county_id", "");
    form.setValue("operation_sub_counties", []);
    setSubCounties([]);
    setParishes([]);
    setVillages([]);

    // Set loading state
    setLoading(prev => ({ ...prev, locations: true }));

    try {
      // Fetch all administrative units for this district
      const [subCountiesResponse, municipalitiesResponse] = await Promise.all([
        getSubCounties({
          countryId: countryId,
          districtId: districtCode,
        }),
        getMunicipalities({
          districtId: districtCode,
        }),
      ]);

      // Combine administrative units into a single array with type information
      const combinedUnits = [
        ...(
          (subCountiesResponse.success && subCountiesResponse.data?.data) ||
          []
        ).map(unit => ({
          ...unit,
          type: "subcounty" as const,
        })),
        ...(
          (municipalitiesResponse.success &&
            municipalitiesResponse.data?.data) ||
          []
        ).map(unit => ({
          ...unit,
          type: "municipality" as const,
        })),
      ];

      console.log(`Combined administrative units:`, combinedUnits);
      setSubCounties(combinedUnits);
    } catch (error) {
      console.error(
        `Error fetching administrative units for district ${districtCode}:`,
        error
      );
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const handleSubCountyChange = async (
    unitCode: string,
    unitName: string,
    unitType: string
  ) => {
    console.log(
      `handleSubCountyChange called with unitCode: ${unitCode}, name: ${unitName}, type: ${unitType}`
    );

    if (!unitCode || unitCode === "none") {
      console.log("No valid unit code provided, skipping data fetch");
      return;
    }

    // Reset dependent fields
    form.setValue("parish", "");
    form.setValue("village", "");
    form.setValue("municipality_id", "");
    form.setValue("city_id", "");
    form.setValue("ward_id", "");
    form.setValue("division_id", "");
    setParishes([]);
    setVillages([]);
    setMunicipalities([]);
    setCities([]);
    setWards([]);
    setDivisions([]);

    // Set loading state
    setLoading(prev => ({ ...prev, locations: true }));

    try {
      if (unitType === "subcounty") {
        // For sub-counties, fetch parishes
        const response = await getParishes({ subCountyId: unitCode });
        if (response.success && response.data?.data) {
          setParishes(response.data.data);
        }
      } else if (unitType === "city") {
        // For cities, fetch wards and divisions
        const [wardsResponse, divisionsResponse] = await Promise.all([
          getWards(unitCode),
          getDivisions(unitCode),
        ]);
        if (wardsResponse.success && wardsResponse.data) {
          setWards(
            wardsResponse.data.map(ward => ({
              id: ward.id,
              code: ward.code,
              name: ward.name,
            }))
          );
        }
        if (divisionsResponse.success && divisionsResponse.data) {
          setDivisions(
            divisionsResponse.data.map(division => ({
              id: division.id,
              code: division.code,
              name: division.name,
            }))
          );
        }
      } else if (unitType === "municipality") {
        // For municipalities, fetch cities, wards, and divisions
        const [citiesResponse, wardsResponse, divisionsResponse] =
          await Promise.all([
            getCities(unitCode),
            getWards(unitCode),
            getDivisions(unitCode),
          ]);
        if (citiesResponse.success && citiesResponse.data) {
          setCities(
            citiesResponse.data.map(city => ({
              id: city.id,
              code: city.code,
              name: city.name,
            }))
          );
        }
        if (wardsResponse.success && wardsResponse.data) {
          setWards(wardsResponse.data);
        }
        if (divisionsResponse.success && divisionsResponse.data) {
          setDivisions(divisionsResponse.data);
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${unitType} ${unitCode}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const handleMunicipalityChange = async (municipalityId: string) => {
    console.log(
      `handleMunicipalityChange called with municipalityId: ${municipalityId}`
    );

    if (!municipalityId || municipalityId === "none") {
      console.log("No valid municipality ID provided, skipping data fetch");
      return;
    }

    // Reset dependent fields
    form.setValue("city_id", "");
    form.setValue("ward_id", "");
    form.setValue("division_id", "");
    setCities([]);
    setWards([]);
    setDivisions([]);

    // Set loading state
    setLoading(prev => ({ ...prev, locations: true }));

    try {
      // Fetch cities for municipality
      const citiesForMunicipality = await getCities(
        municipalityId // Using the municipality code directly
      );
      if (citiesForMunicipality.success && citiesForMunicipality.data) {
        setCities(
          citiesForMunicipality.data.map(city => ({
            id: city.id,
            code: city.code,
            name: city.name,
          }))
        );
      }

      // Fetch wards for municipality
      const wardsForMunicipality = await getWards(
        municipalityId // Using the municipality code directly
      );
      if (wardsForMunicipality.success && wardsForMunicipality.data) {
        setWards(
          wardsForMunicipality.data.map(ward => ({
            id: ward.id,
            code: ward.code,
            name: ward.name,
          }))
        );
      }
    } catch (error) {
      console.error(
        `Error fetching data for municipality ${municipalityId}:`,
        error
      );
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const handleCityChange = async (cityId: string) => {
    console.log(`handleCityChange called with cityId: ${cityId}`);

    if (!cityId || cityId === "none") {
      console.log("No valid city ID provided, skipping data fetch");
      return;
    }

    // Reset dependent fields
    form.setValue("ward_id", "");
    form.setValue("division_id", "");
    setWards([]);
    setDivisions([]);

    // Set loading state
    setLoading(prev => ({ ...prev, locations: true }));

    try {
      // Fetch wards for city directly using the city code
      const wardsForCity = await getWards(
        cityId // Using the city code directly
      );
      if (wardsForCity.success && wardsForCity.data) {
        setWards(
          wardsForCity.data.map(ward => ({
            id: ward.id,
            code: ward.code,
            name: ward.name,
          }))
        );
      }
    } catch (error) {
      console.error(`Error fetching data for city ${cityId}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const handleWardChange = async (wardId: string) => {
    console.log(`handleWardChange called with wardId: ${wardId}`);

    if (!wardId || wardId === "none") {
      console.log("No valid ward ID provided, skipping data fetch");
      return;
    }

    // Reset dependent fields
    form.setValue("division_id", "");
    setDivisions([]);

    // Set loading state
    setLoading(prev => ({ ...prev, locations: true }));

    try {
      // Fetch divisions for ward directly using the ward code
      const divisionsForWard = await getDivisions(
        wardId // Using ward code directly - all other params are inferred from this
      );
      if (divisionsForWard.success && divisionsForWard.data) {
        setDivisions(
          divisionsForWard.data.map(division => ({
            id: division.id,
            code: division.code,
            name: division.name,
          }))
        );
      }
    } catch (error) {
      console.error(`Error fetching data for ward ${wardId}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const handleParishChange = async (parishCode: string, parishName: string) => {
    console.log(
      `handleParishChange called with parishCode: ${parishCode}, name: ${parishName}`
    );

    // Reset villages
    form.setValue("village", "");
    setVillages([]);

    // Set loading state
    setLoading(prev => ({ ...prev, locations: true }));

    try {
      console.log(`Fetching villages for parish: ${parishCode}`);
      const response = await getVillages({ parishId: parishCode });
      console.log(`Villages returned:`, response);
      if (response.success && response.data?.data) {
        setVillages(response.data.data);
      }
    } catch (error) {
      console.error(`Error fetching villages for parish ${parishCode}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  // Initialize form with default values
  // const defaultValues = {
  //   name: '',
  //   acronym: '',
  //   cluster_id: defaultClusterId || '',
  //   project_id: null,
  //   country: '',
  //   district: '',
  //   sub_county_id: '',
  //   municipality_id: '',
  //   city_id: '',
  //   ward_id: '',
  //   division_id: '',
  //   operation_sub_counties: [],
  //   parish: '',
  //   village: '',
  //   address: '',
  // };

  // Define form schema with required and optional fields
  const formSchema = z.object({
    name: z.string().min(2, { message: "Organization name is required" }),
    acronym: z.string().min(1, { message: "Acronym is required" }),
    cluster_id: z.string().min(1, { message: "Please select a cluster" }),
    project_id: z.string().nullable(),
    country: z.string().min(1, { message: "Country is required" }),
    district: z.string().min(1, { message: "District is required" }),
    sub_county_id: z
      .string()
      .min(1, { message: "Organization subcounty is required" }),
    municipality_id: z.string().optional(),
    city_id: z.string().optional(),
    ward_id: z.string().optional(),
    division_id: z.string().optional(),
    operation_sub_counties: z.array(z.string()).default([]).optional(),
    parish: z.string().optional(),
    village: z.string().optional(),
    address: z.string().min(1, { message: "Address is required" }),
  });

  // Infer form values type from schema
  type FormValues = z.infer<typeof formSchema>;

  // Initialize form with default values that match the schema
  const defaultFormValues = {
    name: organization?.name || "",
    acronym: organization?.acronym || "",
    cluster_id: organization?.cluster_id || defaultClusterId || "",
    project_id: organization?.project_id || "none",
    country: "", // Will be set by useEffect when countries load
    district: "", // Will be set by useEffect when districts load
    sub_county_id: "", // Will be set by useEffect when subcounties load
    municipality_id: "", // TODO: Add these fields to Organization type if needed
    city_id: "",
    ward_id: "",
    division_id: "",
    operation_sub_counties: [], // Will be set by useEffect when subcounties load
    parish: organization?.parish || "",
    village: organization?.village || "",
    address: organization?.address || "",
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  // Convert organization data from codes to names for form when data is loaded
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

    // Convert sub_county code to name
    if (organization.sub_county_id && subCounties.length > 0) {
      const subCounty = subCounties.find(
        s => s.code === organization.sub_county_id
      );
      if (subCounty && form.getValues("sub_county_id") !== subCounty.name) {
        form.setValue("sub_county_id", subCounty.name);
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
          return subCounty ? subCounty.name : code; // fallback to code if no match
        })
        .filter(Boolean);

      if (operationSubCountyNames.length > 0) {
        form.setValue("operation_sub_counties", operationSubCountyNames);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, countries, districts, subCounties]);

  const onSubmit = async (values: FormValues) => {
    console.log("Form values being submitted:", values);

    // Transform project_id to null if it's 'none' or to undefined if empty
    if (values.project_id === "none" || values.project_id === "") {
      values.project_id = null;
    }

    // Make sure country is not 'none'
    if (values.country === "none") {
      // This should be caught by the schema validation already
      form.setError("country", {
        message: "Country is required",
      });
      return;
    }

    // Make sure sub_county_id is not empty or 'none'
    if (!values.sub_county_id || values.sub_county_id === "none") {
      form.setError("sub_county_id", {
        message: "Organization subcounty is required",
      });
      return;
    }

    // Convert names to codes for backend API
    // Country: convert name to code
    const countryName = values.country;
    const countryMatch = countries.find(c => c.name === countryName);
    if (countryMatch) {
      console.log(
        `Converting country from "${values.country}" to code "${countryMatch.code}"`
      );
      values.country = countryMatch.code;
    }

    // District: convert name to code
    const districtName = values.district;
    const districtMatch = districts.find(d => d.name === districtName);
    if (districtMatch) {
      console.log(
        `Converting district from "${values.district}" to code "${districtMatch.code}"`
      );
      values.district = districtMatch.code;
    }

    // Sub-county: convert name to code
    const subCountyName = values.sub_county_id;
    const subCountyMatch = subCounties.find(s => s.name === subCountyName);
    if (subCountyMatch) {
      console.log(
        `Converting sub_county from "${values.sub_county_id}" to code "${subCountyMatch.code}"`
      );
      values.sub_county_id = subCountyMatch.code;
    }

    // Operation subcounties: convert names to codes
    const operationSubCountyNames = values.operation_sub_counties || [];
    const operationSubCountyCodes = operationSubCountyNames
      .map(name => {
        const match = subCounties.find(s => s.name === name);
        return match ? match.code : name; // fallback to name if no match
      })
      .filter(Boolean);

    console.log(
      `Converting operation subcounties from names:`,
      operationSubCountyNames,
      `to codes:`,
      operationSubCountyCodes
    );
    values.operation_sub_counties = operationSubCountyCodes;

    setIsLoading(true);
    setError(null);

    try {
      // Use server action to create or update the organization
      // Prepare data to match the CreateOrganizationInput type
      const organizationData = {
        ...values,
        sub_county_id: values.sub_county_id,
        operation_sub_counties: values.operation_sub_counties || [],
      };

      let result;
      if (organization) {
        // Update existing organization
        result = await updateOrganization(organization.id, organizationData);
      } else {
        // Create new organization
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
                    onValueChange={value => {
                      console.log("Project selected:", value);
                      field.onChange(value);
                    }}
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
                      options={[
                        { value: "none", label: "Select a country" },
                        ...countries.map(country => ({
                          value: country.name,
                          label: country.name,
                        })),
                      ]}
                      value={field.value || ""}
                      onValueChange={value => {
                        console.log("Country selected:", value);
                        field.onChange(value);
                        // Find country ID for API calls
                        const selectedCountry = countries.find(
                          c => c.name === value
                        );
                        if (selectedCountry) {
                          console.log("Found country:", selectedCountry);
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
                      options={[
                        { value: "none", label: "Select a district" },
                        ...districts.map(district => ({
                          value: district.name,
                          label: district.name,
                        })),
                      ]}
                      value={field.value || ""}
                      onValueChange={value => {
                        field.onChange(value);
                        // Find district code and country ID for API calls
                        const district = districts.find(d => d.name === value);
                        const countryName = form.getValues("country");
                        const selectedCountry = countries.find(
                          c => c.name === countryName
                        );
                        if (district && selectedCountry) {
                          handleDistrictChange(
                            district.code,
                            selectedCountry.id
                          );
                        }
                      }}
                      placeholder={
                        districts.length > 0
                          ? "Select a district"
                          : form.getValues("country") &&
                              form.getValues("country") !== "none"
                            ? `No districts available for ${form.getValues("country")}`
                            : "Select a country first"
                      }
                      emptyMessage="No matching districts found"
                      disabled={
                        !form.getValues("country") ||
                        form.getValues("country") === "none" ||
                        (form.getValues("country") && districts.length === 0) ||
                        loading.locations
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sub-counties fields - 2 column layout */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Sub-county location field */}
            <FormField
              control={form.control}
              name="sub_county_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Location (Optional)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: "none", label: "Select a location" },
                        ...subCounties.map(unit => ({
                          value: unit.name,
                          label: `${unit.name} (${unit.type})`,
                        })),
                      ]}
                      value={field.value || ""}
                      onValueChange={value => {
                        field.onChange(value);
                        const unit = subCounties.find(s => s.name === value);
                        if (unit) {
                          handleSubCountyChange(
                            unit.code,
                            unit.name,
                            unit.type || "subcounty"
                          );
                        }
                      }}
                      placeholder={
                        subCounties.length > 0
                          ? "Select location"
                          : "Select a district first"
                      }
                      emptyMessage="No matching locations found"
                      disabled={subCounties.length === 0 || loading.locations}
                    />
                  </FormControl>
                  <FormDescription>
                    The location where this organization is physically located
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        onChange={selected => {
                          console.log(
                            "Operation subcounties selected:",
                            selected
                          );
                          field.onChange(selected);
                        }}
                        placeholder={
                          subCounties.length > 0
                            ? "Select operation sub-counties"
                            : "Select a district first"
                        }
                        emptyText="No matching sub-counties found"
                        disabled={subCounties.length === 0 || loading.locations}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the sub-counties where this organization operates
                      in Uganda.
                      {field.value && field.value.length > 0 && (
                        <span className="mt-1 block text-sm">
                          <strong>Selected:</strong> {field.value.length}{" "}
                          sub-counties
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Information message for non-Uganda countries */}
            {form.getValues("country") &&
              form.getValues("country") !== "none" &&
              form.getValues("country") !== "Uganda" && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Operation Areas
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          The operation sub-counties selection is currently
                          available only for organizations in Uganda. For
                          organizations in other countries, please specify your
                          operation areas in the address field.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Municipalities and Cities - Only show if sub-county has municipalities */}
          {municipalities.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="municipality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipality</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "none", label: "Select a municipality" },
                          ...municipalities.map(municipality => ({
                            value: municipality.code,
                            label: municipality.name,
                          })),
                        ]}
                        value={field.value || ""}
                        onValueChange={value => {
                          field.onChange(value);
                          handleMunicipalityChange(value);
                        }}
                        placeholder={
                          municipalities.length > 0
                            ? "Select a municipality"
                            : "No municipalities available"
                        }
                        emptyMessage="No matching municipalities found"
                        disabled={
                          municipalities.length === 0 || loading.locations
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "none", label: "Select a city" },
                          ...cities.map(city => ({
                            value: city.code,
                            label: city.name,
                          })),
                        ]}
                        value={field.value || ""}
                        onValueChange={value => {
                          field.onChange(value);
                          handleCityChange(value);
                        }}
                        placeholder={
                          cities.length > 0
                            ? "Select a city"
                            : "No cities available"
                        }
                        emptyMessage="No matching cities found"
                        disabled={cities.length === 0 || loading.locations}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Wards and Divisions - Only show if municipality or city is selected */}
          {(form.getValues("municipality_id") || form.getValues("city_id")) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ward_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "none", label: "Select a ward" },
                          ...wards.map(ward => ({
                            value: ward.code,
                            label: ward.name,
                          })),
                        ]}
                        value={field.value || ""}
                        onValueChange={value => {
                          field.onChange(value);
                          handleWardChange(value);
                        }}
                        placeholder={
                          wards.length > 0
                            ? "Select a ward"
                            : "No wards available"
                        }
                        emptyMessage="No matching wards found"
                        disabled={wards.length === 0 || loading.locations}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="division_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "none", label: "Select a division" },
                          ...divisions.map(division => ({
                            value: division.code,
                            label: division.name,
                          })),
                        ]}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder={
                          divisions.length > 0
                            ? "Select a division"
                            : "No divisions available"
                        }
                        emptyMessage="No matching divisions found"
                        disabled={divisions.length === 0 || loading.locations}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Parishes and Villages - Only show for sub-counties */}
          {form.getValues("sub_county_id") &&
            subCounties.find(s => s.code === form.getValues("sub_county_id"))
              ?.type === "subcounty" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parish</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "none", label: "Select a parish" },
                            ...parishes.map(parish => ({
                              value: parish.code,
                              label: parish.name,
                            })),
                          ]}
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            const parishObj = parishes.find(
                              p => p.code === value
                            );
                            if (parishObj) {
                              handleParishChange(
                                parishObj.code,
                                parishObj.name
                              );
                            }
                          }}
                          placeholder={
                            parishes.length > 0
                              ? "Select a parish"
                              : "No parishes available"
                          }
                          emptyMessage="No matching parishes found"
                          disabled={parishes.length === 0 || loading.locations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "none", label: "Select a village" },
                            ...villages.map(village => ({
                              value: village.code,
                              label: village.name,
                            })),
                          ]}
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          placeholder={
                            villages.length > 0
                              ? "Select a village"
                              : form.getValues("parish")
                                ? "No villages available"
                                : "Select a parish first"
                          }
                          emptyMessage="No matching villages found"
                          disabled={
                            !form.getValues("parish") || loading.locations
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

          {/* Cities, Wards, and Divisions - Only show for cities and municipalities */}
          {form.getValues("sub_county_id") &&
            ["city", "municipality"].includes(
              subCounties.find(s => s.code === form.getValues("sub_county_id"))
                ?.type || ""
            ) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Cities - Only show for municipalities */}
                {subCounties.find(
                  s => s.code === form.getValues("sub_county_id")
                )?.type === "municipality" && (
                  <FormField
                    control={form.control}
                    name="city_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Combobox
                            options={[
                              { value: "none", label: "Select a city" },
                              ...cities.map(city => ({
                                value: city.code,
                                label: city.name,
                              })),
                            ]}
                            value={field.value || ""}
                            onValueChange={value => {
                              field.onChange(value);
                              handleCityChange(value);
                            }}
                            placeholder={
                              cities.length > 0
                                ? "Select a city"
                                : "No cities available"
                            }
                            emptyMessage="No matching cities found"
                            disabled={cities.length === 0 || loading.locations}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Wards */}
                <FormField
                  control={form.control}
                  name="ward_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "none", label: "Select a ward" },
                            ...wards.map(ward => ({
                              value: ward.code,
                              label: ward.name,
                            })),
                          ]}
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            handleWardChange(value);
                          }}
                          placeholder={
                            wards.length > 0
                              ? "Select a ward"
                              : "No wards available"
                          }
                          emptyMessage="No matching wards found"
                          disabled={wards.length === 0 || loading.locations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Divisions */}
                <FormField
                  control={form.control}
                  name="division_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "none", label: "Select a division" },
                            ...divisions.map(division => ({
                              value: division.code,
                              label: division.name,
                            })),
                          ]}
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          placeholder={
                            divisions.length > 0
                              ? "Select a division"
                              : "No divisions available"
                          }
                          emptyMessage="No matching divisions found"
                          disabled={divisions.length === 0 || loading.locations}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
