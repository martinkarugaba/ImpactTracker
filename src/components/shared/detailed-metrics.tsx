"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, UserCircle, Briefcase, Store, Layers } from "lucide-react";
import { useCalculatedParticipantMetrics } from "../../features/participants/hooks/use-calculated-participant-metrics";
import {
  DemographicsMetrics,
  YouthEmploymentMetrics,
  WageEmploymentMetrics,
  SelfEmploymentMetrics,
  SecondaryEmploymentMetrics,
} from "../../features/participants/components/metrics/detailed-metrics";
import { type Participant } from "../../features/participants/types/types";
import { type Intervention } from "../../features/interventions/types/types";

// Type for data that can be converted to participant metrics
export type MetricsDataSource = Participant[] | Intervention[];

interface DetailedMetricsProps<T extends MetricsDataSource> {
  data: T;
  isLoading?: boolean;
  dataType: "participants" | "interventions";
}

// Helper function to convert interventions to participant-like data for metrics
function convertInterventionsToParticipants(
  interventions: Intervention[]
): Participant[] {
  return interventions.map(intervention => ({
    // Required fields from Participant type
    id: intervention.participantId,
    firstName: intervention.participantName.split(" ")[0] || "",
    lastName: intervention.participantName.split(" ").slice(1).join(" ") || "",
    contact: intervention.participantContact || null,
    sex: (intervention.sex as "male" | "female" | "other") || null,
    age: intervention.age || null,
    isPWD: "no", // Default to "no" as per schema
    isMother: "no", // Default to "no" as per schema
    isRefugee: "no", // Default to "no" as per schema
    isActive: "yes", // Default to "yes" as per schema
    isPermanentResident: "no", // Default to "no" as per schema
    areParentsAlive: "no", // Default to "no" as per schema
    isWillingToParticipate: "yes", // Default to "yes" as per schema
    isActiveStudent: "no", // Default to "no" as per schema
    isTeenMother: "no", // Default to "no" as per schema
    ownsEnterprise: "no", // Default to "no" as per schema
    accessedLoans: "no", // Default to "no" as per schema
    individualSaving: "no", // Default to "no" as per schema
    groupSaving: "no", // Default to "no" as per schema
    hasVocationalSkills: "no", // Default to "no" as per schema
    hasSoftSkills: "no", // Default to "no" as per schema
    hasBusinessSkills: "no", // Default to "no" as per schema
    isSubscribedToVSLA: "no", // Default to "no" as per schema
    employmentStatus: "unemployed", // Default to "unemployed" as per schema
    locationSetting: null,
    nationality: "Ugandan", // Default to "Ugandan" as per schema

    // Optional fields that might be available
    dateOfBirth: null,
    country: null,
    district: null,
    subCounty: intervention.subcounty || null,
    parish: null,
    village: null,
    designation: null,
    enterprise: null,
    project_id: "",
    cluster_id: "",
    organization_id: "",
    noOfTrainings: 0,
    numberOfChildren: 0,
    monthlyIncome: 0,
    mainChallenge: null,
    skillOfInterest: null,
    expectedImpact: null,
    maritalStatus: null,
    educationLevel: null,
    sourceOfIncome: null,
    populationSegment: null,
    refugeeLocation: null,
    enterpriseName: null,
    enterpriseSector: null,
    enterpriseSize: null,
    employmentType: null,
    employmentSector: null,
    enterpriseYouthMale: 0,
    enterpriseYouthFemale: 0,
    enterpriseAdults: 0,
    vocationalSkillsParticipations: [],
    vocationalSkillsCompletions: [],
    vocationalSkillsCertifications: [],
    softSkillsParticipations: [],
    softSkillsCompletions: [],
    softSkillsCertifications: [],
    disabilityType: null,
    wageEmploymentStatus: null,
    wageEmploymentSector: null,
    wageEmploymentScale: null,
    selfEmploymentStatus: null,
    selfEmploymentSector: null,
    businessScale: null,
    secondaryEmploymentStatus: null,
    secondaryEmploymentSector: null,
    secondaryBusinessScale: null,

    // Location IDs
    country_id: null,
    district_id: null,
    subcounty_id: null,
    parish_id: null,
    village_id: null,

    // Legacy VSLA fields
    vslaId: null,
    vslaName: null,

    // Timestamps
    created_at: new Date(),
    updated_at: new Date(),

    // Additional computed fields that might be added by the system
    organizationName: undefined,
    projectName: undefined,
    projectAcronym: undefined,
    clusterName: undefined,
    districtName: undefined,
    subCountyName: undefined,
    countyName: undefined,
  }));
}

function DetailedParticipantMetrics<T extends MetricsDataSource>({
  data,
  isLoading = false,
  dataType,
}: DetailedMetricsProps<T>) {
  // Convert data to participants format for metrics calculation
  const participants: Participant[] =
    Array.isArray(data) && data.length > 0
      ? dataType === "interventions"
        ? convertInterventionsToParticipants(data as Intervention[])
        : (data as Participant[])
      : [];

  const metrics = useCalculatedParticipantMetrics(participants);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 w-96 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="demographics" className="w-full">
      <TabsList className="bg-muted">
        <TabsTrigger
          value="demographics"
          className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-500"
        >
          <Users className="h-4 w-4" />
          Demographics
        </TabsTrigger>
        <TabsTrigger
          value="youth-employment"
          className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-500"
        >
          <UserCircle className="h-4 w-4" />
          Youth in Work
        </TabsTrigger>
        <TabsTrigger
          value="wage-employment"
          className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-500"
        >
          <Briefcase className="h-4 w-4" />
          Wage Employment
        </TabsTrigger>
        <TabsTrigger
          value="self-employment"
          className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-500"
        >
          <Store className="h-4 w-4" />
          Self Employment
        </TabsTrigger>
        <TabsTrigger
          value="secondary-employment"
          className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-500"
        >
          <Layers className="h-4 w-4" />
          Secondary Employment
        </TabsTrigger>
      </TabsList>

      {/* Demographics Tab */}
      <TabsContent value="demographics" className="mt-6">
        <DemographicsMetrics metrics={metrics} />
      </TabsContent>

      {/* Youth Employment Tab */}
      <TabsContent value="youth-employment" className="mt-6">
        <YouthEmploymentMetrics metrics={metrics} />
      </TabsContent>

      {/* Wage Employment Tab */}
      <TabsContent value="wage-employment" className="mt-6">
        <WageEmploymentMetrics metrics={metrics} />
      </TabsContent>

      {/* Self Employment Tab */}
      <TabsContent value="self-employment" className="mt-6">
        <SelfEmploymentMetrics metrics={metrics} />
      </TabsContent>

      {/* Secondary Employment Tab */}
      <TabsContent value="secondary-employment" className="mt-6">
        <SecondaryEmploymentMetrics metrics={metrics} />
      </TabsContent>
    </Tabs>
  );
}

export { DetailedParticipantMetrics };
