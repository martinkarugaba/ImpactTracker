"use client";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  UserCircle,
  Briefcase,
  Building,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type Participant } from "../../features/participants/types/types";
import { type Intervention } from "../../features/interventions/types/types";

// Type for data that can be converted to participant metrics
export type TargetsDataSource = Participant[] | Intervention[];

interface SharedTargetsTabProps<T extends TargetsDataSource> {
  data: T;
  dataType: "participants" | "interventions";
  isLoading?: boolean;
}

// Helper function to convert interventions to participant-like data for targets
function convertInterventionsToParticipantsForTargets(
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

export function SharedTargetsTab<T extends TargetsDataSource>({
  data,
  dataType,
  isLoading = false,
}: SharedTargetsTabProps<T>) {
  // Convert data to participants format for targets calculation
  const participants: Participant[] =
    Array.isArray(data) && data.length > 0
      ? dataType === "interventions"
        ? convertInterventionsToParticipantsForTargets(data as Intervention[])
        : (data as Participant[])
      : [];

  if (isLoading) {
    return (
      <TabsContent value="targets" className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mx-auto h-[250px] w-[250px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    );
  }

  const total = participants.length;
  const target = 10000; // Target enrollment
  const femaleCount = participants.filter(
    p => p.sex?.toLowerCase() === "female"
  ).length;
  const femalePercentage = total > 0 ? (femaleCount / total) * 100 : 0;
  const femaleTarget = 60; // Target 60% female

  const employedCount = participants.filter(
    p =>
      p.employmentStatus?.toLowerCase() === "employed" ||
      p.employmentStatus?.toLowerCase() === "self-employed"
  ).length;
  const employmentPercentage = total > 0 ? (employedCount / total) * 100 : 0;
  const employmentTarget = 70; // Target 70% employment

  const youthCount = participants.filter(
    p => p.age && p.age >= 15 && p.age <= 35
  ).length;
  const youthPercentage = total > 0 ? (youthCount / total) * 100 : 0;
  const youthTarget = 80; // Target 80% youth

  const enrollmentPercentage = (total / target) * 100;

  // Chart configs with custom colors
  const enrollmentConfig = {
    participants: { label: "Participants" },
    total: { label: "Total", color: "#3b82f6" }, // blue-500
  } satisfies ChartConfig;

  const femaleConfig = {
    percentage: { label: "Percentage" },
    female: { label: "Female", color: "#ec4899" }, // pink-500
  } satisfies ChartConfig;

  const employmentConfig = {
    percentage: { label: "Percentage" },
    employed: { label: "Employed", color: "#10b981" }, // emerald-500
  } satisfies ChartConfig;

  const youthConfig = {
    percentage: { label: "Percentage" },
    youth: { label: "Youth", color: "#f59e0b" }, // amber-500
  } satisfies ChartConfig;

  const enrollmentData = [
    {
      metric: "total",
      value: total,
      fill: "var(--color-total)",
    },
  ];

  const femaleData = [
    {
      metric: "female",
      value: femalePercentage,
      fill: "var(--color-female)",
    },
  ];

  const employmentData = [
    {
      metric: "employed",
      value: employmentPercentage,
      fill: "var(--color-employed)",
    },
  ];

  const youthData = [
    {
      metric: "youth",
      value: youthPercentage,
      fill: "var(--color-youth)",
    },
  ];

  return (
    <TabsContent value="targets" className="space-y-4 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Enrollment */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Total Enrollment
            </CardTitle>
            <CardDescription>Target: {target.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={enrollmentConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={enrollmentData}
                endAngle={(enrollmentPercentage / 100) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {total.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Participants
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {enrollmentPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {(target - total).toLocaleString()} more to reach target
            </div>
          </CardFooter>
        </Card>

        {/* Female Participation */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              Female %
            </CardTitle>
            <CardDescription>Target: {femaleTarget}%</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={femaleConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={femaleData}
                endAngle={(femalePercentage / femaleTarget) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {femalePercentage.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Female
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {femaleCount.toLocaleString()} female participants{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {femalePercentage >= femaleTarget
                ? "Target achieved!"
                : `${(femaleTarget - femalePercentage).toFixed(1)}% to reach target`}
            </div>
          </CardFooter>
        </Card>

        {/* Employment Rate */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Employment %
            </CardTitle>
            <CardDescription>Target: {employmentTarget}%</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={employmentConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={employmentData}
                endAngle={(employmentPercentage / employmentTarget) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {employmentPercentage.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Employed
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {employedCount.toLocaleString()} employed{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {employmentPercentage >= employmentTarget
                ? "Target achieved!"
                : `${(employmentTarget - employmentPercentage).toFixed(1)}% to reach target`}
            </div>
          </CardFooter>
        </Card>

        {/* Youth Participation */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              Youth %
            </CardTitle>
            <CardDescription>Target: {youthTarget}%</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={youthConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={youthData}
                endAngle={(youthPercentage / youthTarget) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {youthPercentage.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Youth
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {youthCount.toLocaleString()} youth (15-35){" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {youthPercentage >= youthTarget
                ? "Target achieved!"
                : `${(youthTarget - youthPercentage).toFixed(1)}% to reach target`}
            </div>
          </CardFooter>
        </Card>
      </div>
    </TabsContent>
  );
}
