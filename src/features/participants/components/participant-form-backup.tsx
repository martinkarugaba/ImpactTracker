"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import toast from "react-hot-toast";
import { type Project } from "@/features/projects/types";
import { Briefcase, CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationId } from "@/features/auth/actions";
import { getCurrentOrganizationWithCluster } from "@/features/organizations/actions/organizations";
import {
  useCountries,
  useDistricts,
  useSubCounties,
  useParishes,
  useVillages,
} from "@/features/locations/hooks/use-locations-query";

const formSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    country: z.string().min(2, "Country is required"),
    district: z.string().min(2, "District is required"),
    subCounty: z.string().min(2, "Sub-county is required"), // We keep this as a single string for the form
    parish: z.string().min(2, "Parish is required"),
    village: z.string().min(2, "Village is required"),
    sex: z.enum(["male", "female", "other"]),
    age: z.string().optional(), // Made optional since it can be calculated from dateOfBirth
    dateOfBirth: z.string().optional(),
    isPWD: z.enum(["yes", "no"]),
    disabilityType: z.string().optional(), // Conditional field for type of disability
    isMother: z.enum(["yes", "no"]),
    isRefugee: z.enum(["yes", "no"]),
    designation: z.string().min(2, "Designation is required"),
    enterprise: z.string().min(2, "Enterprise is required"),
    contact: z.string().min(10, "Contact must be at least 10 characters"),
    project_id: z.string().min(1, "Project is required"),
    cluster_id: z.string().min(1, "Cluster is required"),
    organization_id: z.string().min(1, "Organization is required"),
    noOfTrainings: z.string().min(0),
    isActive: z.enum(["yes", "no"]),
    isPermanentResident: z.enum(["yes", "no"]),
    areParentsAlive: z.enum(["yes", "no"]),
    numberOfChildren: z.string().min(0),
    employmentStatus: z.string(),
    monthlyIncome: z.string(),

    // Employment tracking fields
    wageEmploymentStatus: z.string().optional(),
    wageEmploymentSector: z.string().optional(),
    wageEmploymentScale: z.string().optional(),
    selfEmploymentStatus: z.string().optional(),
    selfEmploymentSector: z.string().optional(),
    businessScale: z.string().optional(),
    secondaryEmploymentStatus: z.string().optional(),
    secondaryEmploymentSector: z.string().optional(),
    secondaryBusinessScale: z.string().optional(),

    // Financial inclusion fields
    accessedLoans: z.enum(["yes", "no"]),
    individualSaving: z.enum(["yes", "no"]),
    groupSaving: z.enum(["yes", "no"]),

    // Location classification
    locationSetting: z.enum(["urban", "rural"]).optional(),

    mainChallenge: z.string().optional(),
    skillOfInterest: z.string().optional(),
    expectedImpact: z.string().optional(),
    isWillingToParticipate: z.enum(["yes", "no"]),
  })
  .refine(
    data => {
      // Require at least one of age or dateOfBirth
      const hasAge = data.age && data.age.trim() !== "";
      const hasDateOfBirth = data.dateOfBirth && data.dateOfBirth.trim() !== "";
      return hasAge || hasDateOfBirth;
    },
    {
      message: "Either age or date of birth is required",
      path: ["age"], // This will show the error on the age field
    }
  );

export type ParticipantFormValues = z.infer<typeof formSchema>;

interface ParticipantFormProps {
  initialData?: ParticipantFormValues;
  onSubmit: (data: ParticipantFormValues) => Promise<void>;
  isLoading?: boolean;
  projects: Project[];
  clusterId?: string;
}

export function ParticipantForm({
  initialData,
  onSubmit,
  isLoading,
  projects,
  clusterId: propClusterId,
}: ParticipantFormProps) {
  // Location state for cascading selects
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedSubCountyId, setSelectedSubCountyId] = useState<string>("");
  const [selectedParishId, setSelectedParishId] = useState<string>("");

  // Search state for filtering by names
  const [countrySearch, setCountrySearch] = useState<string>("");
  const [districtSearch, setDistrictSearch] = useState<string>("");
  const [subCountySearch, setSubCountySearch] = useState<string>("");
  const [parishSearch, setParishSearch] = useState<string>("");
  const [villageSearch, setVillageSearch] = useState<string>("");

  // Progress tracking state
  const [formProgress, setFormProgress] = useState(0);

  // Location queries - use search functionality when available
  const { data: countriesData } = useCountries({
    page: 1,
    limit: 1000,
    search: countrySearch || undefined,
  });

  const { data: districtsData } = useDistricts({
    countryId: selectedCountryId,
    page: 1,
    limit: 1000,
    search: districtSearch || undefined,
  });

  const { data: subCountiesData } = useSubCounties({
    districtId: selectedDistrictId,
  });

  const { data: parishesData } = useParishes({
    subCountyId: selectedSubCountyId,
  });

  const { data: villagesData } = useVillages({
    parishId: selectedParishId,
  }); // Transform data to ComboboxOption format
  const countryOptions: ComboboxOption[] =
    countriesData?.data?.data?.map(country => ({
      value: country.id,
      label: country.name,
    })) || [];

  const districtOptions: ComboboxOption[] =
    districtsData?.data?.data?.map(district => ({
      value: district.id,
      label: district.name,
    })) || [];

  const subCountyOptions: ComboboxOption[] =
    subCountiesData?.data?.data
      ?.filter(
        subCounty =>
          !subCountySearch ||
          subCounty.name.toLowerCase().includes(subCountySearch.toLowerCase())
      )
      ?.map(subCounty => ({
        value: subCounty.id,
        label: subCounty.name,
      })) || [];

  const parishOptions: ComboboxOption[] =
    parishesData?.data?.data
      ?.filter(
        parish =>
          !parishSearch ||
          parish.name.toLowerCase().includes(parishSearch.toLowerCase())
      )
      ?.map(parish => ({
        value: parish.id,
        label: parish.name,
      })) || [];

  const villageOptions: ComboboxOption[] =
    villagesData?.data?.data
      ?.filter(
        village =>
          !villageSearch ||
          village.name.toLowerCase().includes(villageSearch.toLowerCase())
      )
      ?.map(village => ({
        value: village.id,
        label: village.name,
      })) || [];
  const { data: organizationId } = useQuery({
    queryKey: ["organizationId"],
    queryFn: getOrganizationId,
  });

  // Add a local Organization type for use in this file
  interface Organization {
    id: string;
    name: string;
    acronym: string;
    cluster_id: string | null;
    project_id: string | null;
    country: string;
    district: string;
    sub_county_id: string;
    operation_sub_counties?: string[];
    parish: string;
    village: string;
    address: string;
    created_at: Date | null;
    updated_at: Date | null;
    cluster: {
      id: string;
      name: string;
    } | null;
    project: {
      id: string;
      name: string;
      acronym: string;
    } | null;
  }

  const { data: organizationData } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      // Fetch only the current organization with its cluster
      const currentOrgResult =
        await getCurrentOrganizationWithCluster(organizationId);
      if (!currentOrgResult.success || !currentOrgResult.data) {
        console.error("Failed to fetch organization:", currentOrgResult.error);
        return null;
      }

      // Convert to our local Organization type
      const orgData = currentOrgResult.data;
      const currentOrg: Organization = {
        id: orgData.id,
        name: orgData.name,
        acronym: orgData.acronym,
        cluster_id: orgData.cluster_id,
        project_id: orgData.project_id,
        country: orgData.country,
        district: orgData.district,
        sub_county_id: orgData.sub_county_id,
        operation_sub_counties: orgData.operation_sub_counties,
        parish: orgData.parish,
        village: orgData.village,
        address: orgData.address,
        created_at: orgData.created_at,
        updated_at: orgData.updated_at,
        cluster: orgData.cluster,
        project: orgData.project,
      };

      return {
        currentOrg,
        currentClusterId: currentOrg.cluster_id || propClusterId,
      };
    },
    enabled: !!organizationId,
  });

  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      country: "", // Will store country ID
      district: "", // Will store district ID
      subCounty: "", // Will store subCounty ID
      parish: "", // Will store parish ID
      village: "", // Will store village ID
      sex: "male",
      age: "",
      dateOfBirth: "",
      isPWD: "no",
      disabilityType: "",
      isMother: "no",
      isRefugee: "no",
      noOfTrainings: "0",
      isActive: "yes",
      designation: "",
      enterprise: "",
      contact: "",
      project_id: "",
      organization_id: "",
      // Add defaults for new fields
      isPermanentResident: "no",
      areParentsAlive: "no",
      numberOfChildren: "0",
      employmentStatus: "unemployed",
      monthlyIncome: "0",

      // Employment tracking defaults
      wageEmploymentStatus: "",
      wageEmploymentSector: "",
      wageEmploymentScale: "",
      selfEmploymentStatus: "",
      selfEmploymentSector: "",
      businessScale: "",
      secondaryEmploymentStatus: "",
      secondaryEmploymentSector: "",
      secondaryBusinessScale: "",

      // Financial inclusion defaults
      accessedLoans: "no",
      individualSaving: "no",
      groupSaving: "no",

      // Location classification
      locationSetting: undefined,

      mainChallenge: "",
      skillOfInterest: "",
      expectedImpact: "",
      isWillingToParticipate: "yes",
    },
  });

  // Effect to update local state when form values change (for cascading)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "country") {
        setSelectedCountryId(value.country || "");
        // Reset dependent fields and searches
        form.setValue("district", "");
        form.setValue("subCounty", "");
        form.setValue("parish", "");
        form.setValue("village", "");
        setSelectedDistrictId("");
        setSelectedSubCountyId("");
        setSelectedParishId("");
        setDistrictSearch("");
        setSubCountySearch("");
        setParishSearch("");
        setVillageSearch("");
      } else if (name === "district") {
        setSelectedDistrictId(value.district || "");
        // Reset dependent fields and searches
        form.setValue("subCounty", "");
        form.setValue("parish", "");
        form.setValue("village", "");
        setSelectedSubCountyId("");
        setSelectedParishId("");
        setSubCountySearch("");
        setParishSearch("");
        setVillageSearch("");
      } else if (name === "subCounty") {
        setSelectedSubCountyId(value.subCounty || "");
        // Reset dependent fields and searches
        form.setValue("parish", "");
        form.setValue("village", "");
        setSelectedParishId("");
        setParishSearch("");
        setVillageSearch("");
      } else if (name === "parish") {
        setSelectedParishId(value.parish || "");
        // Reset dependent fields and searches
        form.setValue("village", "");
        setVillageSearch("");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Set initial selected values for editing
  useEffect(() => {
    if (initialData) {
      setSelectedCountryId(initialData.country || "");
      setSelectedDistrictId(initialData.district || "");
      setSelectedSubCountyId(initialData.subCounty || "");
      setSelectedParishId(initialData.parish || "");
    }
  }, [initialData]);

  // Set organization_id and cluster_id when organization data is available
  useEffect(() => {
    if (organizationData?.currentOrg) {
      form.setValue("organization_id", organizationData.currentOrg.id);
      if (organizationData.currentOrg.cluster_id) {
        form.setValue("cluster_id", organizationData.currentOrg.cluster_id);
      }
    }
  }, [organizationData, form]);

  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues();
    const requiredFields = [
      "firstName",
      "lastName",
      "country",
      "district",
      "subCounty",
      "parish",
      "village",
      "sex",
      "designation",
      "enterprise",
      "contact",
    ];
    const optionalFields = [
      "age",
      "dateOfBirth",
      "isPWD",
      "isMother",
      "isRefugee",
      "employmentStatus",
      "monthlyIncome",
    ];

    const requiredCompleted = requiredFields.filter(field => {
      const value = values[field as keyof ParticipantFormValues];
      return value && String(value).trim() !== "";
    }).length;

    const optionalCompleted = optionalFields.filter(field => {
      const value = values[field as keyof ParticipantFormValues];
      return value && String(value).trim() !== "";
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = requiredCompleted + optionalCompleted;

    return Math.round((completedFields / totalFields) * 100);
  }, [form]);

  // Update progress when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormProgress(calculateProgress());
    });
    return () => subscription.unsubscribe();
  }, [form, calculateProgress]);

  const handleSubmit = async (data: ParticipantFormValues) => {
    const toastId = toast.loading("Processing...");
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
      toast.success(
        initialData
          ? "Participant updated successfully"
          : "Participant created successfully",
        { id: toastId }
      );
    } catch {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? "Update Participant" : "Add New Participant"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>{formProgress}% Complete</span>
            </div>
          </div>
          <Progress value={formProgress} className="h-2" />
          <p className="mt-2 text-sm text-gray-600">
            Fill in the participant information below. Required fields are
            marked with an asterisk (*).
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => {
                // Directly set values based on current data instead of useEffect
                if (organizationData?.currentOrg && !field.value) {
                  // Use setTimeout to defer the state update
                  setTimeout(() => {
                    field.onChange(organizationData.currentOrg.id);
                    if (organizationData.currentOrg.cluster_id) {
                      form.setValue(
                        "cluster_id",
                        organizationData.currentOrg.cluster_id
                      );
                    }
                  }, 0);
                }

                return (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input
                        value={
                          organizationData?.currentOrg?.name || "Loading..."
                        }
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.acronym}
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Combobox
                      options={countryOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearchChange={setCountrySearch}
                      placeholder="Select country"
                      emptyMessage="No countries found"
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
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Combobox
                      options={districtOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearchChange={setDistrictSearch}
                      placeholder="Select district"
                      emptyMessage="No districts found"
                      disabled={!selectedCountryId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subCounty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub County</FormLabel>
                  <FormControl>
                    <Combobox
                      options={subCountyOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select sub county"
                      emptyMessage="No sub counties found"
                      disabled={!selectedDistrictId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parish</FormLabel>
                  <FormControl>
                    <Combobox
                      options={parishOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearchChange={setParishSearch}
                      placeholder="Select parish"
                      emptyMessage="No parishes found"
                      disabled={!selectedSubCountyId}
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
                      options={villageOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearchChange={setVillageSearch}
                      placeholder="Select village"
                      emptyMessage="No villages found"
                      disabled={!selectedParishId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPWD"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person with Disability</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("isPWD") === "yes" && (
              <FormField
                control={form.control}
                name="disabilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Disability</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select disability type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="hearing">Hearing</SelectItem>
                        <SelectItem value="intellectual">
                          Intellectual
                        </SelectItem>
                        <SelectItem value="mental">Mental</SelectItem>
                        <SelectItem value="multiple">Multiple</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="isMother"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isRefugee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refugee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="noOfTrainings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of Trainings</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of trainings"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Active</SelectItem>
                      <SelectItem value="no">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enterprise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enterprise</FormLabel>
                  <FormControl>
                    <Input placeholder="Enterprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* New fields */}
            <FormField
              control={form.control}
              name="isPermanentResident"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Resident</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="areParentsAlive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Both Parents Alive</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfChildren"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Children</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of children"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">
                        Self-employed
                      </SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income (UGX)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Monthly income"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Employment Tracking Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-lg bg-green-50 p-2">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Employment Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Track employment status and business activities
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="wageEmploymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wage Employment Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="new_job">New Job</SelectItem>
                        <SelectItem value="sustained_job">
                          Sustained Job
                        </SelectItem>
                        <SelectItem value="improved_job">
                          Improved Job
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wageEmploymentSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wage Employment Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petty_trade">Petty Trade</SelectItem>
                        <SelectItem value="food_drinks">
                          Food & Drinks
                        </SelectItem>
                        <SelectItem value="manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="agribusiness">
                          Agribusiness
                        </SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wageEmploymentScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Scale</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="micro">Micro</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selfEmploymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Self Employment Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="self_employed">
                          Self Employed
                        </SelectItem>
                        <SelectItem value="new_business">
                          New Business
                        </SelectItem>
                        <SelectItem value="sustained_business">
                          Sustained Business
                        </SelectItem>
                        <SelectItem value="improved_business">
                          Improved Business
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selfEmploymentSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Self Employment Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petty_trade">Petty Trade</SelectItem>
                        <SelectItem value="food_drinks">
                          Food & Drinks
                        </SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="crafts">Crafts</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Scale</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="micro">Micro</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryEmploymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Employment Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="secondary_employed">
                          Secondary Employed
                        </SelectItem>
                        <SelectItem value="new_secondary_job">
                          New Secondary Job
                        </SelectItem>
                        <SelectItem value="sustained_secondary_job">
                          Sustained Secondary Job
                        </SelectItem>
                        <SelectItem value="improved_secondary_job">
                          Improved Secondary Job
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryEmploymentSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Employment Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryBusinessScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Business Scale</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="micro">Micro</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Financial Inclusion Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-lg bg-purple-50 p-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Financial Inclusion
                </h3>
                <p className="text-sm text-gray-600">
                  Banking, savings, and loan access information
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="accessedLoans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessed Loans</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="individualSaving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Individual Saving</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupSaving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Saving (VSLA)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationSetting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Setting</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select setting" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="urban">Urban</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-lg bg-orange-50 p-2">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Information
                </h3>
                <p className="text-sm text-gray-600">
                  Optional details and preferences
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mainChallenge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Challenge</FormLabel>
                    <FormControl>
                      <Input placeholder="Main challenge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillOfInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill of Interest</FormLabel>
                    <FormControl>
                      <Input placeholder="Skill of interest" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Impact</FormLabel>
                    <FormControl>
                      <Input placeholder="Expected impact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isWillingToParticipate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Willing to Participate</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                type="submit"
                className="h-12 flex-1 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {initialData ? "Update Participant" : "Add Participant"}
                    </span>
                  </div>
                )}
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500">
              By submitting this form, you confirm that the information provided
              is accurate and complete.
            </p>
          </div>
        </form>
      </div>
    </Form>
  );
}
