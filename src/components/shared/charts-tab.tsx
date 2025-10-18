"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ParticipantMetricsCharts } from "../../features/participants/components/metrics/participant-metrics-charts";
import { type Participant } from "../../features/participants/types/types";
import { type Intervention } from "../../features/interventions/types/types";

// Type for data that can be converted to participant metrics
export type ChartsDataSource = Participant[] | Intervention[];

interface SharedChartsTabProps<T extends ChartsDataSource> {
  data: T;
  dataType: "participants" | "interventions";
  isLoading?: boolean;
}

// Helper function to convert interventions to participant-like data for charts
function convertInterventionsToParticipantsForCharts(
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

export function SharedChartsTab<T extends ChartsDataSource>({
  data,
  dataType,
  isLoading = false,
}: SharedChartsTabProps<T>) {
  // Convert data to participants format for charts calculation
  const participants: Participant[] =
    Array.isArray(data) && data.length > 0
      ? dataType === "interventions"
        ? convertInterventionsToParticipantsForCharts(data as Intervention[])
        : (data as Participant[])
      : [];

  return (
    <TabsContent value="charts" className="mt-6">
      {/* Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Visual Analytics
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
        </div>
        <ParticipantMetricsCharts
          participants={participants}
          isLoading={isLoading}
        />
      </div>
    </TabsContent>
  );
}
