"use client";

// @ts-nocheck
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
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import toast from "react-hot-toast";
import { type Project } from "@/features/projects/types";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentOrganizationWithCluster } from "@/features/organizations/actions/organizations";
import {
  useCountries,
  useDistricts,
  useSubCounties,
  useParishes,
  useVillages,
} from "@/features/locations/hooks/use-locations-query";

// Multi-step participant form component

// Location type definitions
interface Country {
  id: string;
  name: string;
  code?: string;
}

interface District {
  id: string;
  name: string;
  country_id?: string;
}

interface SubCounty {
  id: string;
  name: string;
  district_id?: string;
}

interface Parish {
  id: string;
  name: string;
  sub_county_id?: string;
}

interface _Village {
  id: string;
  name: string;
  parish_id?: string;
}

// Import the existing form schema and types
const formSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    country: z.string().optional(),
    district: z.string().optional(),
    subCounty: z.string().optional(),
    parish: z.string().optional(),
    village: z.string().optional(),
    // Location IDs (optional, used when mapping is successful)
    country_id: z.string().optional(),
    district_id: z.string().optional(),
    subcounty_id: z.string().optional(),
    parish_id: z.string().optional(),
    village_id: z.string().optional(),
    sex: z.enum(["male", "female", "other"]),
    age: z.string().optional(),
    dateOfBirth: z.string().optional(),
    isPWD: z.enum(["yes", "no"]),
    disabilityType: z.string().optional(),
    isMother: z.enum(["yes", "no"]),
    isRefugee: z.enum(["yes", "no"]),
    designation: z.string().optional(),
    enterprise: z.string().optional(),
    contact: z.string().optional(),
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
    vslaId: z.string().optional(),
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
    vocationalSkillsParticipations: z.array(z.string()).default([]),
    vocationalSkillsCompletions: z.array(z.string()).default([]),
    vocationalSkillsCertifications: z.array(z.string()).default([]),
    hasSoftSkills: z.enum(["yes", "no"]),
    softSkillsParticipations: z.array(z.string()).default([]),
    softSkillsCompletions: z.array(z.string()).default([]),
    softSkillsCertifications: z.array(z.string()).default([]),
    hasBusinessSkills: z.enum(["yes", "no"]),
    // Employment Details
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

interface MultiStepParticipantFormProps {
  initialData?: ParticipantFormValues;
  onSubmit: (data: ParticipantFormValues) => Promise<void>;
  isLoading?: boolean;
  projects: Project[];
  clusterId?: string;
}

// Step definitions
const STEPS = [
  {
    id: "personal",
    title: "Personal Information",
    icon: User,
    description: "Basic personal details and identity information",
  },
  {
    id: "location",
    title: "Location Details",
    icon: MapPin,
    description: "Address and geographical information",
  },
  {
    id: "education",
    title: "Education & Skills",
    icon: GraduationCap,
    description: "Education level and skill competencies",
  },
  {
    id: "employment",
    title: "Employment & Enterprise",
    icon: Briefcase,
    description: "Work status, income, and business details",
  },
  {
    id: "organization",
    title: "Organization & Project",
    icon: Building2,
    description: "Project assignment and organizational details",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function MultiStepParticipantForm({
  initialData,
  onSubmit,
  isLoading,
  projects,
  clusterId: propClusterId,
}: MultiStepParticipantFormProps) {
  const [currentStep, setCurrentStep] = useState<StepId>("personal");
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  // Location state for cascading selects
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedSubCountyId, setSelectedSubCountyId] = useState<string>("");
  const [selectedParishId, setSelectedParishId] = useState<string>("");

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

  const form = useForm<ParticipantFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
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
      cluster_id: propClusterId || "",
      organization_id: "",
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
      maritalStatus: "single",
      educationLevel: "primary",
      sourceOfIncome: "employment",
      nationality: "Ugandan",
      populationSegment: "youth",
      refugeeLocation: "",
      isActiveStudent: "no",
      vslaId: "",
      isTeenMother: "no",
      ownsEnterprise: "no",
      enterpriseName: "",
      enterpriseSector: "agriculture",
      enterpriseSize: "micro",
      enterpriseYouthMale: "0",
      enterpriseYouthFemale: "0",
      enterpriseAdults: "0",
      hasVocationalSkills: "no",
      vocationalSkillsParticipations: [],
      vocationalSkillsCompletions: [],
      vocationalSkillsCertifications: [],
      hasSoftSkills: "no",
      softSkillsParticipations: [],
      softSkillsCompletions: [],
      softSkillsCertifications: [],
      hasBusinessSkills: "no",
      employmentType: "unemployed",
      employmentSector: "agriculture",
      ...initialData,
    },
  });

  // Set organization and cluster IDs when data is available
  useEffect(() => {
    if (organization && !initialData) {
      form.setValue("organization_id", organization.id);
      form.setValue(
        "cluster_id",
        organization.cluster_id || propClusterId || ""
      );
    }
  }, [organization, form, initialData, propClusterId]);

  // Handle location selections
  useEffect(() => {
    if (initialData?.country) {
      setSelectedCountryId(initialData.country);
    }
    if (initialData?.district) {
      setSelectedDistrictId(initialData.district);
    }
    if (initialData?.subCounty) {
      setSelectedSubCountyId(initialData.subCounty);
    }
    if (initialData?.parish) {
      setSelectedParishId(initialData.parish);
    }
  }, [initialData]);

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);

  const handleSubmit = async (data: ParticipantFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save participant. Please try again.");
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(
      stepFields as (keyof ParticipantFormValues)[]
    );

    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }

    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const goToStep = async (stepId: StepId) => {
    const targetIndex = STEPS.findIndex(step => step.id === stepId);
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);

    // If going forward, validate current step
    if (targetIndex > currentIndex) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }

    setCurrentStep(stepId);
  };

  // Helper function to get fields for each step
  const getStepFields = (stepId: StepId): (keyof ParticipantFormValues)[] => {
    switch (stepId) {
      case "personal":
        return [
          "firstName",
          "lastName",
          "sex",
          "age",
          "dateOfBirth",
          "contact",
          "maritalStatus",
          "numberOfChildren",
          "isPWD",
          "disabilityType",
          "nationality",
          "populationSegment",
        ];
      case "location":
        return [
          "locationSetting",
          "isPermanentResident",
          "isRefugee",
          "refugeeLocation",
        ];
      case "education":
        return [
          "educationLevel",
          "isActiveStudent",
          "hasVocationalSkills",
          "vocationalSkillsParticipations",
          "vocationalSkillsCompletions",
          "vocationalSkillsCertifications",
          "hasSoftSkills",
          "softSkillsParticipations",
          "softSkillsCompletions",
          "softSkillsCertifications",
          "hasBusinessSkills",
        ];
      case "employment":
        return [
          "employmentStatus",
          "employmentType",
          "employmentSector",
          "monthlyIncome",
          "sourceOfIncome",
          "ownsEnterprise",
          "enterpriseName",
          "enterpriseSector",
          "enterpriseSize",
        ];
      case "organization":
        return [
          "project_id",
          "organization_id",
          "cluster_id",
          "vslaId",
          "isTeenMother",
          "isMother",
          "isWillingToParticipate",
        ];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return <PersonalInfoStep form={form} />;
      case "location":
        return (
          <LocationStep
            form={form}
            countriesData={countriesData}
            districtsData={districtsData}
            subCountiesData={subCountiesData}
            parishesData={parishesData}
            villagesData={villagesData}
            selectedCountryId={selectedCountryId}
            selectedDistrictId={selectedDistrictId}
            selectedSubCountyId={selectedSubCountyId}
            selectedParishId={selectedParishId}
            setSelectedCountryId={setSelectedCountryId}
            setSelectedDistrictId={setSelectedDistrictId}
            setSelectedSubCountyId={setSelectedSubCountyId}
            setSelectedParishId={setSelectedParishId}
          />
        );
      case "education":
        return <EducationStep form={form} />;
      case "employment":
        return <EmploymentStep form={form} />;
      case "organization":
        return <OrganizationStep form={form} projects={projects} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Minimal Step Indicator */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.has(step.id);

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={index > currentStepIndex && !isCompleted}
                  className="group flex shrink-0 items-center gap-2 disabled:opacity-40"
                  type="button"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden h-px w-8 sm:block ${
                      isCompleted ? "bg-green-600" : "bg-border"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <span className="text-muted-foreground text-sm">
          {currentStepIndex + 1} / {STEPS.length}
        </span>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSubmit={form.handleSubmit(handleSubmit as any)}
          className="w-full space-y-4"
        >
          <div className="w-full max-w-full overflow-hidden rounded-lg border p-4 sm:p-6">
            <div className="w-full max-w-none">{renderStepContent()}</div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex gap-3">
              {currentStepIndex === STEPS.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {initialData ? "Update" : "Create"} Participant
                      </span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Individual Step Components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PersonalInfoStep({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-primary/10 rounded-lg p-2">
          <User className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <p className="text-muted-foreground text-sm">
            Basic personal details and identity
          </p>
        </div>
      </div>

      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                <FormControl>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                <FormControl>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="sex">Gender *</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </Field>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="contact">Contact Number</FieldLabel>
                <FormControl>
                  <Input
                    id="contact"
                    placeholder="Enter phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="age">Age</FieldLabel>
                <FormControl>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : null}
                    setDate={(date: Date | null) => {
                      field.onChange(
                        date ? date.toISOString().split("T")[0] : ""
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </div>
  );
}

function LocationStep({
  form,
  countriesData,
  districtsData,
  subCountiesData,
  parishesData,
  villagesData,
  selectedCountryId,
  selectedDistrictId,
  selectedSubCountyId,
  selectedParishId,
  setSelectedCountryId,
  setSelectedDistrictId,
  setSelectedSubCountyId,
  setSelectedParishId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countriesData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  districtsData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subCountiesData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parishesData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  villagesData: any;
  selectedCountryId: string;
  selectedDistrictId: string;
  selectedSubCountyId: string;
  selectedParishId: string;
  setSelectedCountryId: (id: string) => void;
  setSelectedDistrictId: (id: string) => void;
  setSelectedSubCountyId: (id: string) => void;
  setSelectedParishId: (id: string) => void;
}) {
  const countries = countriesData?.data?.data || [];
  const districts = districtsData?.data?.data || [];
  const subCounties = subCountiesData?.data?.data || [];
  const parishes = parishesData?.data?.data || [];
  const villages = villagesData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="rounded-lg bg-green-100 p-2">
          <MapPin className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Location Details</h3>
          <p className="text-sm text-gray-600">
            Address and geographical information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country *</FormLabel>
              <Combobox
                options={countries.map((country: Country) => ({
                  value: country.id,
                  label: country.name,
                }))}
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  setSelectedCountryId(value);
                  setSelectedDistrictId("");
                  setSelectedSubCountyId("");
                  setSelectedParishId("");
                  form.setValue("district", "");
                  form.setValue("subCounty", "");
                  form.setValue("parish", "");
                  form.setValue("village", "");
                }}
                placeholder="Select country"
              />
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
              <Combobox
                options={districts.map((district: District) => ({
                  value: district.id,
                  label: district.name,
                }))}
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  setSelectedDistrictId(value);
                  setSelectedSubCountyId("");
                  setSelectedParishId("");
                  form.setValue("subCounty", "");
                  form.setValue("parish", "");
                  form.setValue("village", "");
                }}
                placeholder="Select district"
                disabled={!selectedCountryId}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subCounty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub County *</FormLabel>
              <Combobox
                options={subCounties.map((subCounty: SubCounty) => ({
                  value: subCounty.id,
                  label: subCounty.name,
                }))}
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  setSelectedSubCountyId(value);
                  setSelectedParishId("");
                  form.setValue("parish", "");
                  form.setValue("village", "");
                }}
                placeholder="Select sub county"
                disabled={!selectedDistrictId}
              />
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
              <Combobox
                options={parishes.map((parish: Parish) => ({
                  value: parish.id,
                  label: parish.name,
                }))}
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  setSelectedParishId(value);
                  form.setValue("village", "");
                }}
                placeholder="Select parish"
                disabled={!selectedSubCountyId}
              />
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
              <Combobox
                options={villages.map(
                  (village: { id: string; name: string }) => ({
                    value: village.id,
                    label: village.name,
                  })
                )}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select village"
                disabled={!selectedParishId}
              />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location setting" />
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

        <FormField
          control={form.control}
          name="isPermanentResident"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permanent Resident</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select residence status" />
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
              <FormLabel>Refugee Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select refugee status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
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
                <FormLabel>Refugee Camp/Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter refugee location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EducationStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="rounded-lg bg-purple-100 p-2">
          <GraduationCap className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Education & Skills</h3>
          <p className="text-sm text-gray-600">
            Education level and skill competencies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="tertiary">Tertiary</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActiveStudent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currently a Student</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasVocationalSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Has Vocational Skills</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vocational skills status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
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
                  <FormLabel>Vocational Skills Participations</FormLabel>
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
                  <FormLabel>Vocational Skills Completions</FormLabel>
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
                  <FormLabel>Vocational Skills Certifications</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="hasSoftSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Has Soft Skills</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soft skills status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
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

        <FormField
          control={form.control}
          name="hasBusinessSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Has Business Skills</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business skills status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmploymentStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="rounded-lg bg-orange-100 p-2">
          <Briefcase className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Employment & Enterprise</h3>
          <p className="text-sm text-gray-600">
            Work status, income, and business details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="employmentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <FormControl>
                <Input placeholder="Enter employment status" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="formal">Formal Employment</SelectItem>
                  <SelectItem value="informal">Informal Employment</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
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

        <FormField
          control={form.control}
          name="monthlyIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Income (UGX)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income source" />
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
          name="ownsEnterprise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owns Enterprise</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select enterprise ownership" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
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
                    <Input placeholder="Enter enterprise name" {...field} />
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
                        <SelectValue placeholder="Select enterprise sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="manufacturing">
                        Manufacturing
                      </SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
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
                        <SelectValue placeholder="Select enterprise size" />
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
          </>
        )}

        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation *</FormLabel>
              <FormControl>
                <Input placeholder="Enter job title/designation" {...field} />
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
              <FormLabel>Enterprise/Company *</FormLabel>
              <FormControl>
                <Input placeholder="Enter enterprise/company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function OrganizationStep({
  form,
  projects,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  projects: Project[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="rounded-lg bg-indigo-100 p-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Organization & Project</h3>
          <p className="text-sm text-gray-600">
            Project assignment and organizational details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.acronym} - {project.name}
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
          name="vslaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VSLA (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select VSLA" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No VSLA</SelectItem>
                  {/* TODO: Add actual VSLA options from database */}
                  <SelectItem value="vsla1">Sample VSLA 1</SelectItem>
                  <SelectItem value="vsla2">Sample VSLA 2</SelectItem>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teen mother status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isMother"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Is Mother</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mother status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select participation willingness" />
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
  );
}
