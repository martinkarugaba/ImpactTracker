"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import {
  User,
  Briefcase,
  CreditCard,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
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
    subCounty: z.string().min(2, "Sub-county is required"),
    parish: z.string().min(2, "Parish is required"),
    village: z.string().min(2, "Village is required"),
    sex: z.enum(["male", "female", "other"]),
    age: z.string().optional(),
    dateOfBirth: z.string().optional(),
    isPWD: z.enum(["yes", "no"]),
    disabilityType: z.string().optional(),
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
    wageEmploymentStatus: z.string().optional(),
    wageEmploymentSector: z.string().optional(),
    wageEmploymentScale: z.string().optional(),
    selfEmploymentStatus: z.string().optional(),
    selfEmploymentSector: z.string().optional(),
    businessScale: z.string().optional(),
    secondaryEmploymentStatus: z.string().optional(),
    secondaryEmploymentSector: z.string().optional(),
    secondaryBusinessScale: z.string().optional(),
    accessedLoans: z.enum(["yes", "no"]),
    individualSaving: z.enum(["yes", "no"]),
    groupSaving: z.enum(["yes", "no"]),
    locationSetting: z.enum(["urban", "rural"]).optional(),
    mainChallenge: z.string().optional(),
    skillOfInterest: z.string().optional(),
    expectedImpact: z.string().optional(),
    isWillingToParticipate: z.enum(["yes", "no"]),

    // NEW FIELDS
    // Personal Information
    maritalStatus: z
      .enum(["single", "married", "divorced", "widowed"])
      .optional(),
    educationLevel: z
      .enum(["none", "primary", "secondary", "tertiary", "university"])
      .optional(),
    sourceOfIncome: z
      .enum(["employment", "business", "agriculture", "remittances", "other"])
      .optional(),
    nationality: z.string().default("Ugandan"),
    populationSegment: z
      .enum(["youth", "women", "pwd", "elderly", "refugee", "host"])
      .optional(),
    refugeeLocation: z.string().optional(),
    isActiveStudent: z.enum(["yes", "no"]),

    // VSLA Information
    isSubscribedToVSLA: z.enum(["yes", "no"]),
    vslaName: z.string().optional(),

    // Teen Mother
    isTeenMother: z.enum(["yes", "no"]),

    // Enterprise Information
    ownsEnterprise: z.enum(["yes", "no"]),
    enterpriseName: z.string().optional(),
    enterpriseSector: z
      .enum([
        "agriculture",
        "retail",
        "services",
        "manufacturing",
        "construction",
        "transport",
        "other",
      ])
      .optional(),
    enterpriseSize: z.enum(["micro", "small", "medium", "large"]).optional(),
    enterpriseYouthMale: z.string().default("0"),
    enterpriseYouthFemale: z.string().default("0"),
    enterpriseAdults: z.string().default("0"),

    // Skills Information
    hasVocationalSkills: z.enum(["yes", "no"]),
    vocationalSkillsParticipations: z.string().default("0"),
    vocationalSkillsCompletions: z.string().default("0"),
    vocationalSkillsCertifications: z.string().default("0"),

    hasSoftSkills: z.enum(["yes", "no"]),
    softSkillsParticipations: z.string().default("0"),
    softSkillsCompletions: z.string().default("0"),
    softSkillsCertifications: z.string().default("0"),

    hasBusinessSkills: z.enum(["yes", "no"]),

    // Employment Details (more specific than existing employmentStatus)
    employmentType: z
      .enum(["formal", "informal", "self-employed", "unemployed"])
      .optional(),
    employmentSector: z
      .enum([
        "agriculture",
        "manufacturing",
        "services",
        "trade",
        "education",
        "health",
        "other",
      ])
      .optional(),
  })
  .refine(
    data => {
      const hasAge = data.age && data.age.trim() !== "";
      const hasDateOfBirth = data.dateOfBirth && data.dateOfBirth.trim() !== "";
      return hasAge || hasDateOfBirth;
    },
    {
      message: "Either age or date of birth is required",
      path: ["age"],
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

  // Progress tracking state
  const [formProgress, setFormProgress] = useState(0);

  // Location queries
  const { data: countriesData } = useCountries({});

  const { data: districtsData } = useDistricts({
    countryId: selectedCountryId,
  });

  const { data: subCountiesData } = useSubCounties({
    districtId: selectedDistrictId,
  });

  const { data: parishesData } = useParishes({
    subCountyId: selectedSubCountyId,
  });

  const { data: villagesData } = useVillages({
    parishId: selectedParishId,
  });

  // Organization data query
  const { data: organization } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const result = await getCurrentOrganizationWithCluster("");
      return result.success ? result.data : null;
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      district: "",
      subCounty: "",
      parish: "",
      village: "",
      sex: "male",
      age: "",
      dateOfBirth: "",
      isPWD: "no",
      disabilityType: "",
      isMother: "no",
      isRefugee: "no",
      designation: "",
      enterprise: "",
      contact: "",
      project_id: "",
      cluster_id: propClusterId || organization?.cluster_id || "",
      organization_id: organization?.id || "",
      noOfTrainings: "0",
      isActive: "yes",
      isPermanentResident: "yes",
      areParentsAlive: "yes",
      numberOfChildren: "0",
      employmentStatus: "",
      monthlyIncome: "",
      wageEmploymentStatus: "",
      wageEmploymentSector: "",
      wageEmploymentScale: "",
      selfEmploymentStatus: "",
      selfEmploymentSector: "",
      businessScale: "",
      secondaryEmploymentStatus: "",
      secondaryEmploymentSector: "",
      secondaryBusinessScale: "",
      accessedLoans: "no",
      individualSaving: "no",
      groupSaving: "no",
      locationSetting: "rural",
      mainChallenge: "",
      skillOfInterest: "",
      expectedImpact: "",
      isWillingToParticipate: "yes",

      // NEW FIELDS - Default values
      maritalStatus: undefined,
      educationLevel: undefined,
      sourceOfIncome: undefined,
      nationality: "Ugandan",
      populationSegment: undefined,
      refugeeLocation: "",
      isActiveStudent: "no",
      isSubscribedToVSLA: "no",
      vslaName: "",
      isTeenMother: "no",
      ownsEnterprise: "no",
      enterpriseName: "",
      enterpriseSector: undefined,
      enterpriseSize: undefined,
      enterpriseYouthMale: "0",
      enterpriseYouthFemale: "0",
      enterpriseAdults: "0",
      hasVocationalSkills: "no",
      vocationalSkillsParticipations: "0",
      vocationalSkillsCompletions: "0",
      vocationalSkillsCertifications: "0",
      hasSoftSkills: "no",
      softSkillsParticipations: "0",
      softSkillsCompletions: "0",
      softSkillsCertifications: "0",
      hasBusinessSkills: "no",
      employmentType: undefined,
      employmentSector: undefined,

      ...initialData,
    },
  });

  // Calculate form completion progress
  const calculateProgress = React.useCallback(() => {
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
      // New optional fields
      "maritalStatus",
      "educationLevel",
      "sourceOfIncome",
      "isSubscribedToVSLA",
      "vslaName",
      "ownsEnterprise",
      "enterpriseName",
      "hasVocationalSkills",
      "hasSoftSkills",
      "hasBusinessSkills",
      "employmentType",
      "employmentSector",
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

  // Reset cascading selects when parent changes
  useEffect(() => {
    if (!selectedCountryId) {
      setSelectedDistrictId("");
      setSelectedSubCountyId("");
      setSelectedParishId("");
      form.setValue("district", "");
      form.setValue("subCounty", "");
      form.setValue("parish", "");
      form.setValue("village", "");
    }
  }, [selectedCountryId, form]);

  useEffect(() => {
    if (!selectedDistrictId) {
      setSelectedSubCountyId("");
      setSelectedParishId("");
      form.setValue("subCounty", "");
      form.setValue("parish", "");
      form.setValue("village", "");
    }
  }, [selectedDistrictId, form]);

  useEffect(() => {
    if (!selectedSubCountyId) {
      setSelectedParishId("");
      form.setValue("parish", "");
      form.setValue("village", "");
    }
  }, [selectedSubCountyId, form]);

  useEffect(() => {
    if (!selectedParishId) {
      form.setValue("village", "");
    }
  }, [selectedParishId, form]);

  // Location data type interfaces
  interface LocationItem {
    id: string;
    name: string;
    code?: string;
  }

  interface ExtendedComboboxOption extends ComboboxOption {
    id: string;
  }

  // Convert data to ComboboxOption format with proper null checking
  const countryOptions: ExtendedComboboxOption[] =
    countriesData?.data?.data?.map((country: LocationItem) => ({
      value: country.name,
      label: country.name,
      id: country.id,
    })) || [];

  const districtOptions: ExtendedComboboxOption[] =
    districtsData?.data?.data?.map((district: LocationItem) => ({
      value: district.name,
      label: district.name,
      id: district.id,
    })) || [];

  const subCountyOptions: ExtendedComboboxOption[] =
    subCountiesData?.data?.data?.map((subCounty: LocationItem) => ({
      value: subCounty.name,
      label: subCounty.name,
      id: subCounty.id,
    })) || [];

  const parishOptions: ExtendedComboboxOption[] =
    parishesData?.data?.data?.map((parish: LocationItem) => ({
      value: parish.name,
      label: parish.name,
      id: parish.id,
    })) || [];

  const villageOptions: ExtendedComboboxOption[] =
    villagesData?.data?.data?.map((village: LocationItem) => ({
      value: village.name,
      label: village.name,
      id: village.id,
    })) || [];

  const isPWDValue = form.watch("isPWD");

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              {initialData ? "Update Participant" : "Add New Participant"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{formProgress}% Complete</span>
              <span className="sm:hidden">{formProgress}%</span>
            </div>
          </div>
          <Progress value={formProgress} className="h-2" />
          <p className="mt-2 text-sm text-gray-600">
            Fill in the participant information below. Required fields are
            marked with an asterisk (*).
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 sm:space-y-8"
        >
          {/* Basic Information Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-1))",
              borderLeftWidth: "4px",
            }}
          >
            <div
              className="mb-4 flex items-center gap-3 border-b pb-4 sm:mb-6"
              style={{ borderBottomColor: "oklch(var(--chart-1) / 0.2)" }}
            >
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-1) / 0.1)" }}
              >
                <User
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-1))" }}
                />
              </div>
              <div>
                <h3
                  className="text-base font-semibold sm:text-lg"
                  style={{ color: "oklch(var(--chart-1))" }}
                >
                  Basic Information
                </h3>
                <p className="text-sm text-gray-600">
                  Personal details and contact information
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
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
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
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
                    <FormLabel>Sex *</FormLabel>
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
                      <Input type="number" placeholder="Enter age" {...field} />
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
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter designation" {...field} />
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
                    <FormLabel>Enterprise *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter enterprise" {...field} />
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
              {isPWDValue === "yes" && (
                <FormField
                  control={form.control}
                  name="disabilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disability Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter disability type" {...field} />
                      </FormControl>
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
                    <FormLabel>Is Mother</FormLabel>
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
                    <FormLabel>Is Refugee</FormLabel>
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
                        placeholder="Enter number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Fields */}
            <div
              className="mt-6 border-t pt-6"
              style={{ borderTopColor: "oklch(var(--chart-1) / 0.2)" }}
            >
              <h4
                className="text-md mb-4 font-medium"
                style={{ color: "oklch(var(--chart-1) / 0.8)" }}
              >
                Location Information
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={countryOptions}
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            const option = countryOptions.find(
                              o => o.value === value
                            );
                            if (option) {
                              setSelectedCountryId(option.id);
                            }
                          }}
                          placeholder="Search countries..."
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
                      <FormLabel>District *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={districtOptions}
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            const option = districtOptions.find(
                              o => o.value === value
                            );
                            if (option) {
                              setSelectedDistrictId(option.id);
                            }
                          }}
                          placeholder="Search districts..."
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
                      <FormLabel>Sub-county *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={subCountyOptions}
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            const option = subCountyOptions.find(
                              o => o.value === value
                            );
                            if (option) {
                              setSelectedSubCountyId(option.id);
                            }
                          }}
                          placeholder="Search sub-counties..."
                          emptyMessage="No sub-counties found"
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
                      <FormLabel>Parish *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={parishOptions}
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            const option = parishOptions.find(
                              o => o.value === value
                            );
                            if (option) {
                              setSelectedParishId(option.id);
                            }
                          }}
                          placeholder="Search parishes..."
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
                      <FormLabel>Village *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={villageOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Search villages..."
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

            {/* Project Fields */}
            <div
              className="mt-6 border-t pt-6"
              style={{ borderTopColor: "oklch(var(--chart-1) / 0.2)" }}
            >
              <h4
                className="text-md mb-4 font-medium"
                style={{ color: "oklch(var(--chart-1) / 0.8)" }}
              >
                Project Information
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project *</FormLabel>
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
                              {project.name}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is Active</FormLabel>
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
          </div>

          {/* Employment Tracking Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-2))",
              borderLeftWidth: "4px",
            }}
          >
            <div
              className="mb-4 flex items-center gap-3 border-b pb-4 sm:mb-6"
              style={{ borderBottomColor: "oklch(var(--chart-2) / 0.2)" }}
            >
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-2) / 0.1)" }}
              >
                <Briefcase
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-2))" }}
                />
              </div>
              <div>
                <h3
                  className="text-base font-semibold sm:text-lg"
                  style={{ color: "oklch(var(--chart-2))" }}
                >
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
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter status" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="casual">Casual Worker</SelectItem>
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
                    <FormControl>
                      <Input placeholder="Enter sector" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wageEmploymentScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wage Employment Scale</FormLabel>
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
                        <SelectItem value="small">Small Scale</SelectItem>
                        <SelectItem value="medium">Medium Scale</SelectItem>
                        <SelectItem value="large">Large Scale</SelectItem>
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
                        <SelectItem value="active">Active Business</SelectItem>
                        <SelectItem value="inactive">
                          Inactive Business
                        </SelectItem>
                        <SelectItem value="planning">
                          Planning to Start
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
                    <FormControl>
                      <Input placeholder="Enter sector" {...field} />
                    </FormControl>
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
                        <SelectItem value="yes">
                          Has Secondary Employment
                        </SelectItem>
                        <SelectItem value="no">
                          No Secondary Employment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Financial Inclusion Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-3))",
              borderLeftWidth: "4px",
            }}
          >
            <div
              className="mb-4 flex items-center gap-3 border-b pb-4 sm:mb-6"
              style={{ borderBottomColor: "oklch(var(--chart-3) / 0.2)" }}
            >
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-3) / 0.1)" }}
              >
                <CreditCard
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-3))" }}
                />
              </div>
              <div>
                <h3
                  className="text-base font-semibold sm:text-lg"
                  style={{ color: "oklch(var(--chart-3))" }}
                >
                  Financial Inclusion
                </h3>
                <p className="text-sm text-gray-600">
                  Banking, savings, and loan access information
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
                    <FormLabel>Group Saving</FormLabel>
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

          {/* Additional Information Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-4))",
              borderLeftWidth: "4px",
            }}
          >
            <div
              className="mb-4 flex items-center gap-3 border-b pb-4 sm:mb-6"
              style={{ borderBottomColor: "oklch(var(--chart-4) / 0.2)" }}
            >
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-4) / 0.1)" }}
              >
                <FileText
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-4))" }}
                />
              </div>
              <div>
                <h3
                  className="text-base font-semibold sm:text-lg"
                  style={{ color: "oklch(var(--chart-4))" }}
                >
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
                      <Input placeholder="Enter main challenge" {...field} />
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
                      <Input placeholder="Enter skill" {...field} />
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
                      <Input placeholder="Enter expected impact" {...field} />
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
                    <FormLabel>Parents Alive</FormLabel>
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
                    <FormLabel>Number of Trainings</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Personal Information Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-3))",
              borderLeftWidth: "4px",
            }}
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-3) / 0.1)" }}
              >
                <User
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-3))" }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                <p className="text-sm text-gray-600">
                  Additional personal details and background information
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
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
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          No Formal Education
                        </SelectItem>
                        <SelectItem value="primary">
                          Primary Education
                        </SelectItem>
                        <SelectItem value="secondary">
                          Secondary Education
                        </SelectItem>
                        <SelectItem value="tertiary">
                          Tertiary Education
                        </SelectItem>
                        <SelectItem value="university">University</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sourceOfIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source of Income</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="remittances">Remittances</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter nationality" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="populationSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Population Segment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="pwd">
                          Person with Disability
                        </SelectItem>
                        <SelectItem value="elderly">Elderly</SelectItem>
                        <SelectItem value="refugee">Refugee</SelectItem>
                        <SelectItem value="host">Host Community</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("isRefugee") === "yes" && (
                <FormField
                  control={form.control}
                  name="refugeeLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refugee Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter refugee location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="isActiveStudent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currently a Student</FormLabel>
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
                name="isTeenMother"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teen Mother</FormLabel>
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

          {/* VSLA Information Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-4))",
              borderLeftWidth: "4px",
            }}
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-4) / 0.1)" }}
              >
                <CreditCard
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-4))" }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  VSLA Information
                </h3>
                <p className="text-sm text-gray-600">
                  Village Savings and Loan Association details
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="isSubscribedToVSLA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscribed to VSLA</FormLabel>
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
              {form.watch("isSubscribedToVSLA") === "yes" && (
                <FormField
                  control={form.control}
                  name="vslaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VSLA Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter VSLA name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Enterprise Information Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-1))",
              borderLeftWidth: "4px",
            }}
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-1) / 0.1)" }}
              >
                <Briefcase
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-1))" }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Enterprise Information
                </h3>
                <p className="text-sm text-gray-600">
                  Business ownership and enterprise details
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="ownsEnterprise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owns Enterprise</FormLabel>
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
              {form.watch("ownsEnterprise") === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="enterpriseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enterprise Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter enterprise name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enterpriseSector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enterprise Sector</FormLabel>
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
                            <SelectItem value="agriculture">
                              Agriculture
                            </SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="manufacturing">
                              Manufacturing
                            </SelectItem>
                            <SelectItem value="construction">
                              Construction
                            </SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enterpriseSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enterprise Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
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
                    name="enterpriseYouthMale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Youth Male Employees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enterpriseYouthFemale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Youth Female Employees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enterpriseAdults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adult Employees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>

          {/* Skills Information Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-2))",
              borderLeftWidth: "4px",
            }}
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-2) / 0.1)" }}
              >
                <FileText
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-2))" }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Skills Information
                </h3>
                <p className="text-sm text-gray-600">
                  Vocational, soft skills, and business skills training
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {/* Vocational Skills */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="hasVocationalSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Has Vocational Skills</FormLabel>
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
                {form.watch("hasVocationalSkills") === "yes" && (
                  <>
                    <FormField
                      control={form.control}
                      name="vocationalSkillsParticipations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vocational Participations</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vocationalSkillsCompletions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vocational Completions</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vocationalSkillsCertifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vocational Certifications</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Soft Skills */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="hasSoftSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Has Soft Skills</FormLabel>
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
                {form.watch("hasSoftSkills") === "yes" && (
                  <>
                    <FormField
                      control={form.control}
                      name="softSkillsParticipations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soft Skills Participations</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="softSkillsCompletions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soft Skills Completions</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="softSkillsCertifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soft Skills Certifications</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Business Skills */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hasBusinessSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Has Business Skills</FormLabel>
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
          </div>

          {/* Employment Details Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-5))",
              borderLeftWidth: "4px",
            }}
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "oklch(var(--chart-5) / 0.1)" }}
              >
                <Briefcase
                  className="h-5 w-5"
                  style={{ color: "oklch(var(--chart-5))" }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Employment Details
                </h3>
                <p className="text-sm text-gray-600">
                  Detailed employment type and sector information
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="self-employed">
                          Self-Employed
                        </SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Sector</FormLabel>
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
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="trade">Trade</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Section */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            style={{
              borderLeftColor: "oklch(var(--chart-5))",
              borderLeftWidth: "4px",
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                type="submit"
                className="h-12 w-full text-base font-semibold sm:flex-1"
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
