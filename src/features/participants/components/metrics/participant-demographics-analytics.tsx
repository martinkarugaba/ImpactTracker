"use client";

import { useMemo } from "react";
import {
  Users,
  MapPin,
  BarChart3,
  UserCheck,
  Heart,
  GraduationCap,
  Briefcase,
  Building2,
  Banknote,
  TrendingUp,
  Baby,
  UserX,
  Award,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { type Participant } from "../../types/types";

// Helper function to calculate age from date of birth or use existing age
function calculateAge(participant: Participant): number | null {
  if (participant.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(participant.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  }

  return participant.age || null;
}

// Function to calculate comprehensive demographics data
function calculateDemographicsData(participants: Participant[]) {
  const total = participants.length;

  // Basic demographics
  const urban = participants.filter(p => p.locationSetting === "urban").length;
  const rural = participants.filter(
    p => p.locationSetting === "rural" || !p.locationSetting
  ).length;

  // Age demographics
  const aged15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return age !== null && age >= 15 && age <= 35;
  }).length;

  const above35 = participants.filter(p => {
    const age = calculateAge(p);
    return age !== null && age > 35;
  }).length;

  // Gender demographics
  const male = participants.filter(p => p.sex === "male").length;
  const female = participants.filter(p => p.sex === "female").length;

  const male15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "male" && age !== null && age >= 15 && age <= 35;
  }).length;

  const maleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "male" && age !== null && age > 35;
  }).length;

  const female15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "female" && age !== null && age >= 15 && age <= 35;
  }).length;

  const femaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "female" && age !== null && age > 35;
  }).length;

  // PWD demographics
  const pwds = participants.filter(p => p.isPWD === "yes").length;
  const femalePWDs = participants.filter(
    p => p.isPWD === "yes" && p.sex === "female"
  ).length;
  const malePWDs = participants.filter(
    p => p.isPWD === "yes" && p.sex === "male"
  ).length;

  // Youth in work (15-35 with employment)
  const youthInWork = participants.filter(p => {
    const age = calculateAge(p);
    return (
      age !== null &&
      age >= 15 &&
      age <= 35 &&
      p.employmentStatus &&
      p.employmentStatus !== "unemployed"
    );
  }).length;

  const youthInWorkUrban = participants.filter(p => {
    const age = calculateAge(p);
    return (
      age !== null &&
      age >= 15 &&
      age <= 35 &&
      p.employmentStatus &&
      p.employmentStatus !== "unemployed" &&
      p.locationSetting === "urban"
    );
  }).length;

  const youthInWorkRural = participants.filter(p => {
    const age = calculateAge(p);
    return (
      age !== null &&
      age >= 15 &&
      age <= 35 &&
      p.employmentStatus &&
      p.employmentStatus !== "unemployed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
    );
  }).length;

  // Wage employment statistics
  const totalWageEmployment = participants.filter(
    p => p.employmentStatus === "wage-employed"
  ).length;

  const wageEmploymentUrban = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.locationSetting === "urban"
  ).length;

  const wageEmploymentRural = participants.filter(
    p =>
      p.employmentStatus === "wage-employed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
  ).length;

  const wageEmploymentMale = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.sex === "male"
  ).length;

  const wageEmploymentFemale = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.sex === "female"
  ).length;

  const wageEmploymentYouth = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "wage-employed" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;

  const wageEmploymentAdults = participants.filter(p => {
    const age = calculateAge(p);
    return p.employmentStatus === "wage-employed" && age !== null && age > 35;
  }).length;

  const wageEmploymentPWD = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.isPWD === "yes"
  ).length;

  // Self-employment statistics
  const totalSelfEmployment = participants.filter(
    p => p.employmentStatus === "self-employed"
  ).length;

  const selfEmploymentUrban = participants.filter(
    p => p.employmentStatus === "self-employed" && p.locationSetting === "urban"
  ).length;

  const selfEmploymentRural = participants.filter(
    p =>
      p.employmentStatus === "self-employed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
  ).length;

  const selfEmploymentMale = participants.filter(
    p => p.employmentStatus === "self-employed" && p.sex === "male"
  ).length;

  const selfEmploymentFemale = participants.filter(
    p => p.employmentStatus === "self-employed" && p.sex === "female"
  ).length;

  const selfEmploymentYouth = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "self-employed" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;

  const selfEmploymentAdults = participants.filter(p => {
    const age = calculateAge(p);
    return p.employmentStatus === "self-employed" && age !== null && age > 35;
  }).length;

  const selfEmploymentPWD = participants.filter(
    p => p.employmentStatus === "self-employed" && p.isPWD === "yes"
  ).length;

  // Secondary employment statistics
  const totalSecondaryEmployment = participants.filter(
    p =>
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed"
  ).length;

  const secondaryEmploymentUrban = participants.filter(
    p =>
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      p.locationSetting === "urban"
  ).length;

  const secondaryEmploymentRural = participants.filter(
    p =>
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
  ).length;

  const secondaryEmploymentMale = participants.filter(
    p =>
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      p.sex === "male"
  ).length;

  const secondaryEmploymentFemale = participants.filter(
    p =>
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      p.sex === "female"
  ).length;

  const secondaryEmploymentYouth = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;

  const secondaryEmploymentAdults = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      age !== null &&
      age > 35
    );
  }).length;

  const secondaryEmploymentPWD = participants.filter(
    p =>
      p.secondaryEmploymentStatus &&
      p.secondaryEmploymentStatus !== "unemployed" &&
      p.isPWD === "yes"
  ).length;

  // Education demographics
  const educationLevels = participants
    .filter(p => p.educationLevel)
    .reduce(
      (acc: Record<string, number>, p) => {
        const level = p.educationLevel!;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  // Skills demographics with detailed breakdown
  const hasVocationalSkills = participants.filter(
    p => p.hasVocationalSkills === "yes"
  ).length;
  const hasSoftSkills = participants.filter(
    p => p.hasSoftSkills === "yes"
  ).length;
  const hasBusinessSkills = participants.filter(
    p => p.hasBusinessSkills === "yes"
  ).length;

  // Detailed skill metrics with arrays
  const vocationalSkillsParticipations = participants.reduce(
    (sum, p) => sum + (p.vocationalSkillsParticipations?.length || 0),
    0
  );
  const vocationalSkillsCompletions = participants.reduce(
    (sum, p) => sum + (p.vocationalSkillsCompletions?.length || 0),
    0
  );
  const vocationalSkillsCertifications = participants.reduce(
    (sum, p) => sum + (p.vocationalSkillsCertifications?.length || 0),
    0
  );

  const softSkillsParticipations = participants.reduce(
    (sum, p) => sum + (p.softSkillsParticipations?.length || 0),
    0
  );
  const softSkillsCompletions = participants.reduce(
    (sum, p) => sum + (p.softSkillsCompletions?.length || 0),
    0
  );
  const softSkillsCertifications = participants.reduce(
    (sum, p) => sum + (p.softSkillsCertifications?.length || 0),
    0
  );

  // Individual skills breakdown
  const allVocationalSkills = participants
    .flatMap(p => p.vocationalSkillsParticipations || [])
    .reduce((acc: Record<string, number>, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const allSoftSkills = participants
    .flatMap(p => p.softSkillsParticipations || [])
    .reduce((acc: Record<string, number>, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const vocationalSkillsCompleted = participants
    .flatMap(p => p.vocationalSkillsCompletions || [])
    .reduce((acc: Record<string, number>, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const softSkillsCompleted = participants
    .flatMap(p => p.softSkillsCompletions || [])
    .reduce((acc: Record<string, number>, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const vocationalSkillsCertified = participants
    .flatMap(p => p.vocationalSkillsCertifications || [])
    .reduce((acc: Record<string, number>, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const softSkillsCertified = participants
    .flatMap(p => p.softSkillsCertifications || [])
    .reduce((acc: Record<string, number>, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  // Skills of interest breakdown
  const skillsOfInterest = participants
    .filter(p => p.skillOfInterest)
    .reduce(
      (acc: Record<string, number>, p) => {
        const skill = p.skillOfInterest!;
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  // Skills completion rates
  const vocationalCompletionRate =
    vocationalSkillsParticipations > 0
      ? Math.round(
          (vocationalSkillsCompletions / vocationalSkillsParticipations) * 100
        )
      : 0;
  const vocationalCertificationRate =
    vocationalSkillsCompletions > 0
      ? Math.round(
          (vocationalSkillsCertifications / vocationalSkillsCompletions) * 100
        )
      : 0;
  const softCompletionRate =
    softSkillsParticipations > 0
      ? Math.round((softSkillsCompletions / softSkillsParticipations) * 100)
      : 0;
  const softCertificationRate =
    softSkillsCompletions > 0
      ? Math.round((softSkillsCertifications / softSkillsCompletions) * 100)
      : 0;

  // Enterprise and financial inclusion
  const enterpriseOwners = participants.filter(
    p => p.ownsEnterprise === "yes"
  ).length;
  const vslaMembers = participants.filter(
    p => p.isSubscribedToVSLA === "yes"
  ).length;

  // Other demographics
  const refugees = participants.filter(p => p.isRefugee === "yes").length;
  const teenMothers = participants.filter(p => p.isTeenMother === "yes").length;
  const activeStudents = participants.filter(
    p => p.isActiveStudent === "yes"
  ).length;

  return {
    total,
    urban,
    rural,
    aged15to35,
    above35,
    male,
    female,
    male15to35,
    maleAbove35,
    female15to35,
    femaleAbove35,
    pwds,
    femalePWDs,
    malePWDs,
    educationLevels,
    skills: {
      vocational: hasVocationalSkills,
      soft: hasSoftSkills,
      business: hasBusinessSkills,
      vocationalParticipations: vocationalSkillsParticipations,
      vocationalCompletions: vocationalSkillsCompletions,
      vocationalCertifications: vocationalSkillsCertifications,
      softParticipations: softSkillsParticipations,
      softCompletions: softSkillsCompletions,
      softCertifications: softSkillsCertifications,
      vocationalCompletionRate,
      vocationalCertificationRate,
      softCompletionRate,
      softCertificationRate,
      skillsOfInterest,
      allVocationalSkills,
      allSoftSkills,
      vocationalSkillsCompleted,
      softSkillsCompleted,
      vocationalSkillsCertified,
      softSkillsCertified,
    },
    employment: {
      youthInWork,
      youthInWorkUrban,
      youthInWorkRural,
      wage: {
        total: totalWageEmployment,
        urban: wageEmploymentUrban,
        rural: wageEmploymentRural,
        male: wageEmploymentMale,
        female: wageEmploymentFemale,
        youth: wageEmploymentYouth,
        adults: wageEmploymentAdults,
        pwd: wageEmploymentPWD,
      },
      self: {
        total: totalSelfEmployment,
        urban: selfEmploymentUrban,
        rural: selfEmploymentRural,
        male: selfEmploymentMale,
        female: selfEmploymentFemale,
        youth: selfEmploymentYouth,
        adults: selfEmploymentAdults,
        pwd: selfEmploymentPWD,
      },
      secondary: {
        total: totalSecondaryEmployment,
        urban: secondaryEmploymentUrban,
        rural: secondaryEmploymentRural,
        male: secondaryEmploymentMale,
        female: secondaryEmploymentFemale,
        youth: secondaryEmploymentYouth,
        adults: secondaryEmploymentAdults,
        pwd: secondaryEmploymentPWD,
      },
    },
    enterprise: {
      owners: enterpriseOwners,
    },
    financial: {
      vslaMembers,
    },
    segments: {
      refugees,
      teenMothers,
      activeStudents,
    },
  };
}

export function ParticipantDemographicsAnalytics({
  participants,
  isLoading,
}: {
  participants: Participant[];
  isLoading?: boolean;
}) {
  const demographics = useMemo(
    () => calculateDemographicsData(participants),
    [participants]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Basic Demographics Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-3 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-cyan-400">
              Demographics Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Key participant statistics and breakdowns
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-blue-50 *:data-[slot=card]:to-cyan-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:from-blue-950/50 dark:*:data-[slot=card]:to-cyan-950/50">
          <MetricCard
            title="Total Participants"
            value={demographics.total}
            footer={{
              title: "All participants",
              description: "in your cluster",
            }}
            icon={<Users className="size-4" />}
          />

          <MetricCard
            title="Urban Setting"
            value={demographics.urban}
            footer={{
              title: "Rural Setting",
              description: `${demographics.rural} participants`,
            }}
            icon={<MapPin className="size-4" />}
          />

          <MetricCard
            title="Youth (15-35)"
            value={demographics.aged15to35}
            footer={{
              title: "Above 35 years",
              description: `${demographics.above35} participants`,
            }}
            icon={<BarChart3 className="size-4" />}
          />

          <MetricCard
            title="Persons with Disability"
            value={demographics.pwds}
            footer={{
              title: `Female: ${demographics.femalePWDs} | Male: ${demographics.malePWDs}`,
              description: "PWD representation",
            }}
            icon={<UserCheck className="size-4" />}
          />
        </div>
      </div>

      {/* Gender Demographics */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-3 shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-xl font-bold text-transparent dark:from-pink-400 dark:to-rose-400">
              Gender Demographics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gender and age breakdown
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-pink-50 *:data-[slot=card]:to-rose-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:from-pink-950/50 dark:*:data-[slot=card]:to-rose-950/50">
          <MetricCard
            title="Male Participants"
            value={demographics.male}
            footer={{
              title: `15-35: ${demographics.male15to35}`,
              description: `Above 35: ${demographics.maleAbove35}`,
            }}
            icon={<Users className="size-4" />}
          />

          <MetricCard
            title="Female Participants"
            value={demographics.female}
            footer={{
              title: `15-35: ${demographics.female15to35}`,
              description: `Above 35: ${demographics.femaleAbove35}`,
            }}
            icon={<Heart className="size-4" />}
          />
        </div>
      </div>

      {/* Youth Employment */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-3 shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-xl font-bold text-transparent dark:from-green-400 dark:to-emerald-400">
              Youth Employment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Youth (15-35) employment statistics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-green-50 *:data-[slot=card]:to-emerald-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-3 dark:*:data-[slot=card]:from-green-950/50 dark:*:data-[slot=card]:to-emerald-950/50">
          <MetricCard
            title="Total Youth in Work"
            value={demographics.employment.youthInWork}
            footer={{
              title: "Employment rate",
              description: "Youth with any employment",
            }}
            icon={<Briefcase className="size-4" />}
          />

          <MetricCard
            title="Urban Youth Workers"
            value={demographics.employment.youthInWorkUrban}
            footer={{
              title: "Rural Youth Workers",
              description: `${demographics.employment.youthInWorkRural} employed`,
            }}
            icon={<MapPin className="size-4" />}
          />
        </div>
      </div>

      {/* Wage Employment */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 p-3 shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-xl font-bold text-transparent dark:from-purple-400 dark:to-violet-400">
              Wage Employment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Formal and informal wage employment statistics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-purple-50 *:data-[slot=card]:to-violet-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:from-purple-950/50 dark:*:data-[slot=card]:to-violet-950/50">
          <MetricCard
            title="Total Wage Employed"
            value={demographics.employment.wage.total}
            footer={{
              title: "Wage employment",
              description: "All wage workers",
            }}
            icon={<Briefcase className="size-4" />}
          />

          <MetricCard
            title="Urban Wage Workers"
            value={demographics.employment.wage.urban}
            footer={{
              title: "Rural Wage Workers",
              description: `${demographics.employment.wage.rural} workers`,
            }}
            icon={<MapPin className="size-4" />}
          />

          <MetricCard
            title="Male Wage Workers"
            value={demographics.employment.wage.male}
            footer={{
              title: "Female Wage Workers",
              description: `${demographics.employment.wage.female} workers`,
            }}
            icon={<Users className="size-4" />}
          />

          <MetricCard
            title="Youth Wage Workers"
            value={demographics.employment.wage.youth}
            footer={{
              title: "Adult Wage Workers",
              description: `${demographics.employment.wage.adults} workers`,
            }}
            icon={<BarChart3 className="size-4" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-purple-100 *:data-[slot=card]:to-violet-100 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 dark:*:data-[slot=card]:from-purple-950/50 dark:*:data-[slot=card]:to-violet-950/50">
          <MetricCard
            title="PWD Wage Workers"
            value={demographics.employment.wage.pwd}
            footer={{
              title: "Inclusive employment",
              description: "PWD in wage employment",
            }}
            icon={<UserCheck className="size-4" />}
          />
        </div>
      </div>

      {/* Self Employment */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-3 shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-xl font-bold text-transparent dark:from-orange-400 dark:to-amber-400">
              Self Employment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entrepreneurship and self-employment statistics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-orange-50 *:data-[slot=card]:to-amber-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:from-orange-950/50 dark:*:data-[slot=card]:to-amber-950/50">
          <MetricCard
            title="Total Self Employed"
            value={demographics.employment.self.total}
            footer={{
              title: "Self employment",
              description: "All self-employed",
            }}
            icon={<Building2 className="size-4" />}
          />

          <MetricCard
            title="Urban Self Employed"
            value={demographics.employment.self.urban}
            footer={{
              title: "Rural Self Employed",
              description: `${demographics.employment.self.rural} entrepreneurs`,
            }}
            icon={<MapPin className="size-4" />}
          />

          <MetricCard
            title="Male Self Employed"
            value={demographics.employment.self.male}
            footer={{
              title: "Female Self Employed",
              description: `${demographics.employment.self.female} entrepreneurs`,
            }}
            icon={<Users className="size-4" />}
          />

          <MetricCard
            title="Youth Self Employed"
            value={demographics.employment.self.youth}
            footer={{
              title: "Adult Self Employed",
              description: `${demographics.employment.self.adults} entrepreneurs`,
            }}
            icon={<BarChart3 className="size-4" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricCard
            title="PWD Self Employed"
            value={demographics.employment.self.pwd}
            footer={{
              title: "Inclusive entrepreneurship",
              description: "PWD in self-employment",
            }}
            icon={<UserCheck className="size-4" />}
          />
        </div>
      </div>

      {/* Secondary Employment */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 p-3 shadow-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-xl font-bold text-transparent dark:from-teal-400 dark:to-cyan-400">
              Secondary Employment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Additional income sources and multiple job holders
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-teal-50 *:data-[slot=card]:to-cyan-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:from-teal-950/50 dark:*:data-[slot=card]:to-cyan-950/50">
          <MetricCard
            title="Total Secondary Jobs"
            value={demographics.employment.secondary.total}
            footer={{
              title: "Multiple job holders",
              description: "Additional income sources",
            }}
            icon={<Award className="size-4" />}
          />

          <MetricCard
            title="Urban Secondary Jobs"
            value={demographics.employment.secondary.urban}
            footer={{
              title: "Rural Secondary Jobs",
              description: `${demographics.employment.secondary.rural} workers`,
            }}
            icon={<MapPin className="size-4" />}
          />

          <MetricCard
            title="Male Secondary Jobs"
            value={demographics.employment.secondary.male}
            footer={{
              title: "Female Secondary Jobs",
              description: `${demographics.employment.secondary.female} workers`,
            }}
            icon={<Users className="size-4" />}
          />

          <MetricCard
            title="Youth Secondary Jobs"
            value={demographics.employment.secondary.youth}
            footer={{
              title: "Adult Secondary Jobs",
              description: `${demographics.employment.secondary.adults} workers`,
            }}
            icon={<BarChart3 className="size-4" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricCard
            title="PWD Secondary Jobs"
            value={demographics.employment.secondary.pwd}
            footer={{
              title: "Multiple income sources",
              description: "PWD with secondary employment",
            }}
            icon={<UserCheck className="size-4" />}
          />
        </div>
      </div>

      {/* Skills & Development */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-3 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
              Skills & Development
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Skills acquisition and capacity building
            </p>
          </div>
        </div>

        {/* Main Skills Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Vocational Skills"
            value={`${demographics.skills.vocational} (${demographics.total > 0 ? Math.round((demographics.skills.vocational / demographics.total) * 100) : 0}%)`}
            footer={{
              title: "Technical skills",
              description: "Trade and vocational training",
            }}
            icon={<Briefcase className="size-4" />}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
          />

          <MetricCard
            title="Soft Skills"
            value={`${demographics.skills.soft} (${demographics.total > 0 ? Math.round((demographics.skills.soft / demographics.total) * 100) : 0}%)`}
            footer={{
              title: "Personal development",
              description: "Communication & leadership",
            }}
            icon={<Users className="size-4" />}
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50"
          />

          <MetricCard
            title="Business Skills"
            value={`${demographics.skills.business} (${demographics.total > 0 ? Math.round((demographics.skills.business / demographics.total) * 100) : 0}%)`}
            footer={{
              title: "Entrepreneurship",
              description: "Business management skills",
            }}
            icon={<Building2 className="size-4" />}
            className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50"
          />
        </div>

        {/* Detailed Vocational Skills Metrics */}
        <div className="space-y-4">
          <h4 className="text-md text-foreground flex items-center gap-2 font-medium">
            <Briefcase className="text-primary h-4 w-4" />
            Vocational Skills Training Details
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Participations"
              value={demographics.skills.vocationalParticipations}
              footer={{
                title: "Training sessions",
                description: "All vocational training entries",
              }}
              icon={<Users className="size-4" />}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50"
            />

            <MetricCard
              title="Completions"
              value={`${demographics.skills.vocationalCompletions} (${demographics.skills.vocationalCompletionRate}%)`}
              footer={{
                title: "Training completed",
                description: "Successfully finished programs",
              }}
              icon={<Award className="size-4" />}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
            />

            <MetricCard
              title="Certifications"
              value={`${demographics.skills.vocationalCertifications} (${demographics.skills.vocationalCertificationRate}%)`}
              footer={{
                title: "Certified graduates",
                description: "Received official certification",
              }}
              icon={<Award className="size-4" />}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50"
            />

            <MetricCard
              title="Success Rate"
              value={`${demographics.skills.vocationalCompletionRate}%`}
              footer={{
                title: "Completion to participation",
                description: "Overall training success",
              }}
              icon={<TrendingUp className="size-4" />}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50"
            />
          </div>
        </div>

        {/* Detailed Soft Skills Metrics */}
        <div className="space-y-4">
          <h4 className="text-md text-foreground flex items-center gap-2 font-medium">
            <Heart className="text-secondary h-4 w-4" />
            Soft Skills Training Details
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Participations"
              value={demographics.skills.softParticipations}
              footer={{
                title: "Training sessions",
                description: "All soft skills training entries",
              }}
              icon={<Users className="size-4" />}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50"
            />

            <MetricCard
              title="Completions"
              value={`${demographics.skills.softCompletions} (${demographics.skills.softCompletionRate}%)`}
              footer={{
                title: "Training completed",
                description: "Successfully finished programs",
              }}
              icon={<Award className="size-4" />}
              className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/50 dark:to-lime-950/50"
            />

            <MetricCard
              title="Certifications"
              value={`${demographics.skills.softCertifications} (${demographics.skills.softCertificationRate}%)`}
              footer={{
                title: "Certified graduates",
                description: "Received official certification",
              }}
              icon={<Award className="size-4" />}
              className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50"
            />

            <MetricCard
              title="Success Rate"
              value={`${demographics.skills.softCompletionRate}%`}
              footer={{
                title: "Completion to participation",
                description: "Overall training success",
              }}
              icon={<TrendingUp className="size-4" />}
              className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50"
            />
          </div>
        </div>

        {/* Detailed Skills Metrics */}
        <div className="space-y-4">
          <h4 className="text-md text-foreground font-medium">
            Detailed Skills Training
          </h4>

          {/* Vocational Skills Details */}
          <div className="bg-card rounded-lg border p-4">
            <h5 className="mb-3 font-medium text-blue-600 dark:text-blue-400">
              Vocational Skills Training
            </h5>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MetricCard
                title="Participations"
                value={demographics.skills.vocationalParticipations}
                footer={{
                  title: "Training sessions",
                  description: "Total participations",
                }}
                icon={<Award className="size-4" />}
                className="bg-blue-50 dark:bg-blue-900/20"
              />
              <MetricCard
                title="Completions"
                value={demographics.skills.vocationalCompletions}
                footer={{
                  title: "Completed courses",
                  description: "Successfully finished",
                }}
                icon={<Award className="size-4" />}
                className="bg-blue-50 dark:bg-blue-900/20"
              />
              <MetricCard
                title="Certifications"
                value={demographics.skills.vocationalCertifications}
                footer={{
                  title: "Certificates earned",
                  description: "Official certifications",
                }}
                icon={<Award className="size-4" />}
                className="bg-blue-50 dark:bg-blue-900/20"
              />
            </div>
          </div>

          {/* Soft Skills Details */}
          <div className="bg-card rounded-lg border p-4">
            <h5 className="mb-3 font-medium text-green-600 dark:text-green-400">
              Soft Skills Training
            </h5>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MetricCard
                title="Participations"
                value={demographics.skills.softParticipations}
                footer={{
                  title: "Training sessions",
                  description: "Total participations",
                }}
                icon={<Users className="size-4" />}
                className="bg-green-50 dark:bg-green-900/20"
              />
              <MetricCard
                title="Completions"
                value={demographics.skills.softCompletions}
                footer={{
                  title: "Completed courses",
                  description: "Successfully finished",
                }}
                icon={<Users className="size-4" />}
                className="bg-green-50 dark:bg-green-900/20"
              />
              <MetricCard
                title="Certifications"
                value={demographics.skills.softCertifications}
                footer={{
                  title: "Certificates earned",
                  description: "Official certifications",
                }}
                icon={<Users className="size-4" />}
                className="bg-green-50 dark:bg-green-900/20"
              />
            </div>
          </div>
        </div>

        {/* Skills of Interest */}
        {Object.keys(demographics.skills.skillsOfInterest).length > 0 && (
          <div className="bg-card rounded-lg border p-4">
            <h5 className="text-primary mb-3 font-medium">
              Skills of Interest
            </h5>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(demographics.skills.skillsOfInterest).map(
                ([skill, count]) => (
                  <div
                    key={skill}
                    className="bg-primary/5 dark:bg-primary/10 flex justify-between rounded-lg p-3"
                  >
                    <span className="text-foreground font-medium capitalize">
                      {skill}
                    </span>
                    <span className="text-primary font-bold">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Individual Skills Breakdown */}
      <div className="space-y-6">
        {/* Individual Vocational Skills */}
        {Object.keys(demographics.skills.allVocationalSkills).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="text-primary h-5 w-5" />
                <span className="text-primary">
                  Individual Vocational Skills
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(demographics.skills.allVocationalSkills).map(
                  ([skill, count]) => (
                    <div
                      key={skill}
                      className="bg-primary/5 dark:bg-primary/10 flex justify-between rounded-lg p-3"
                    >
                      <span className="text-foreground font-medium capitalize">
                        {skill}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-primary font-bold">{count}</span>
                        <span className="text-muted-foreground text-xs">
                          participated
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Soft Skills */}
        {Object.keys(demographics.skills.allSoftSkills).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-secondary h-5 w-5" />
                <span className="text-secondary">Individual Soft Skills</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(demographics.skills.allSoftSkills).map(
                  ([skill, count]) => (
                    <div
                      key={skill}
                      className="bg-secondary/5 dark:bg-secondary/10 flex justify-between rounded-lg p-3"
                    >
                      <span className="text-foreground font-medium capitalize">
                        {skill}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-secondary font-bold">
                          {count}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          participated
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Completion Analysis */}
        {(Object.keys(demographics.skills.vocationalSkillsCompleted).length >
          0 ||
          Object.keys(demographics.skills.softSkillsCompleted).length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="text-accent h-5 w-5" />
                <span className="text-accent">
                  Skills Completion & Certification
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(demographics.skills.vocationalSkillsCompleted)
                .length > 0 && (
                <div>
                  <h5 className="text-primary mb-2 font-medium">
                    Vocational Skills Completed
                  </h5>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(
                      demographics.skills.vocationalSkillsCompleted
                    ).map(([skill, count]) => (
                      <div
                        key={skill}
                        className="flex justify-between rounded-md bg-green-50 p-2 dark:bg-green-950/20"
                      >
                        <span className="text-sm font-medium capitalize">
                          {skill}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(demographics.skills.softSkillsCompleted).length >
                0 && (
                <div>
                  <h5 className="text-secondary mb-2 font-medium">
                    Soft Skills Completed
                  </h5>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(
                      demographics.skills.softSkillsCompleted
                    ).map(([skill, count]) => (
                      <div
                        key={skill}
                        className="flex justify-between rounded-md bg-blue-50 p-2 dark:bg-blue-950/20"
                      >
                        <span className="text-sm font-medium capitalize">
                          {skill}
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Financial Inclusion & Enterprise */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 p-3 shadow-lg">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-xl font-bold text-transparent dark:from-emerald-400 dark:to-green-400">
              Financial Inclusion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enterprise ownership and financial services access
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-emerald-50 *:data-[slot=card]:to-green-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-3 dark:*:data-[slot=card]:from-emerald-950/50 dark:*:data-[slot=card]:to-green-950/50">
          <MetricCard
            title="Enterprise Owners"
            value={demographics.enterprise.owners}
            footer={{
              title: "Business ownership",
              description: "Own business enterprises",
            }}
            icon={<Building2 className="size-4" />}
          />

          <MetricCard
            title="VSLA Members"
            value={demographics.financial.vslaMembers}
            footer={{
              title: "Financial inclusion",
              description: "Savings group participation",
            }}
            icon={<Banknote className="size-4" />}
          />
        </div>
      </div>

      {/* Special Populations */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 p-3 shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent dark:from-rose-400 dark:to-pink-400">
              Special Population Groups
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vulnerable groups and special demographics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-br *:data-[slot=card]:from-rose-50 *:data-[slot=card]:to-pink-50 *:data-[slot=card]:shadow-lg *:data-[slot=card]:transition-transform *:data-[slot=card]:duration-300 hover:*:data-[slot=card]:scale-105 md:grid-cols-2 lg:grid-cols-3 dark:*:data-[slot=card]:from-rose-950/50 dark:*:data-[slot=card]:to-pink-950/50">
          <MetricCard
            title="Active Students"
            value={demographics.segments.activeStudents}
            footer={{
              title: "Education",
              description: "Currently studying",
            }}
            icon={<GraduationCap className="size-4" />}
          />

          <MetricCard
            title="Refugees"
            value={demographics.segments.refugees}
            footer={{
              title: "Displacement",
              description: "Refugee status participants",
            }}
            icon={<UserX className="size-4" />}
          />

          <MetricCard
            title="Teen Mothers"
            value={demographics.segments.teenMothers}
            footer={{
              title: "Support needed",
              description: "Young mothers requiring support",
            }}
            icon={<Baby className="size-4" />}
          />
        </div>
      </div>

      {/* Education Levels Breakdown */}
      {Object.keys(demographics.educationLevels).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-600 dark:text-blue-400">
                Education Levels
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-5">
              {Object.entries(demographics.educationLevels).map(
                ([level, count]) => (
                  <div
                    key={level}
                    className="flex justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <span className="font-medium capitalize">{level}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
