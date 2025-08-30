"use client";

import { useMemo } from "react";
import {
  Users,
  User,
  Briefcase,
  MapPin,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Activity } from "../../types/types";
import { useActivityParticipants } from "../../hooks/use-activities";
import { MetricCard } from "@/components/ui/metric-card";

interface ParticipantsMetricsTabProps {
  activity: Activity;
}

// Extended participant type to handle potentially missing fields
type ExtendedParticipant = {
  id: string;
  firstName: string;
  lastName: string;
  contact: string;
  designation: string;
  organizationName?: string;
  sex?: string;
  age?: number;
  enterprise?: string;
  employmentStatus?: string;
  monthlyIncome?: number;
  isPWD?: string;
  district?: string;
  subCounty?: string;
  village?: string;
};

export function ParticipantsMetricsTab({
  activity,
}: ParticipantsMetricsTabProps) {
  const {
    data: participantsResponse,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useActivityParticipants(activity.id);

  const metrics = useMemo(() => {
    const participants = participantsResponse?.success
      ? participantsResponse.data || []
      : [];

    const participantData = participants
      .map(p => p.participant as ExtendedParticipant)
      .filter(Boolean);

    const total = participantData.length;
    const males = participantData.filter(p => p?.sex === "male").length;
    const females = participantData.filter(p => p?.sex === "female").length;

    // Age-based calculations
    const maleYouth = participantData.filter(
      p => p?.sex === "male" && p?.age && p.age >= 15 && p.age <= 35
    ).length;
    const maleAdult = participantData.filter(
      p => p?.sex === "male" && p?.age && p.age > 35
    ).length;
    const femaleYouth = participantData.filter(
      p => p?.sex === "female" && p?.age && p.age >= 15 && p.age <= 35
    ).length;
    const femaleAdult = participantData.filter(
      p => p?.sex === "female" && p?.age && p.age > 35
    ).length;

    // Employment
    const employed = participantData.filter(p =>
      p?.employmentStatus?.includes("employed")
    ).length;
    const selfEmployed = participantData.filter(p =>
      p?.employmentStatus?.includes("self")
    ).length;
    const selfEmployedFemale = participantData.filter(
      p => p?.employmentStatus?.includes("self") && p?.sex === "female"
    ).length;
    const selfEmployedMale = participantData.filter(
      p => p?.employmentStatus?.includes("self") && p?.sex === "male"
    ).length;

    // PWDs
    const pwds = participantData.filter(p => p?.isPWD === "yes").length;
    const pwdMale = participantData.filter(
      p => p?.isPWD === "yes" && p?.sex === "male"
    ).length;
    const pwdFemale = participantData.filter(
      p => p?.isPWD === "yes" && p?.sex === "female"
    ).length;

    // Location
    const rural = participantData.filter(p => p?.village).length;
    const urban = participantData.filter(p => !p?.village).length;

    return {
      total,
      males,
      females,
      maleYouth,
      maleAdult,
      femaleYouth,
      femaleAdult,
      employed,
      selfEmployed,
      selfEmployedFemale,
      selfEmployedMale,
      pwds,
      pwdMale,
      pwdFemale,
      rural,
      urban,
    };
  }, [participantsResponse]);

  if (isLoadingParticipants) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (participantsError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load participant metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="space-y-4">
        <div className="border-border/40 border-b pb-3">
          <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5 text-blue-600" />
            Overview
          </h3>
          <p className="text-muted-foreground text-sm">
            General participant statistics and demographics
          </p>
        </div>
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-3">
          <MetricCard
            title="Total Participants"
            value={metrics.total}
            description="All registered participants for this activity"
            icon={<Users className="h-4 w-4 text-blue-600" />}
            className="border-l-4 border-l-blue-500"
          />
          <MetricCard
            title="Male Participants"
            value={metrics.males}
            description="Number of male participants"
            icon={<User className="h-4 w-4 text-blue-600" />}
            className="border-l-4 border-l-blue-400"
            footer={{
              title: `${metrics.total > 0 ? Math.round((metrics.males / metrics.total) * 100) : 0}%`,
              description: "of total participants",
            }}
          />
          <MetricCard
            title="Female Participants"
            value={metrics.females}
            description="Number of female participants"
            icon={<User className="h-4 w-4 text-pink-600" />}
            className="border-l-4 border-l-pink-400"
            footer={{
              title: `${metrics.total > 0 ? Math.round((metrics.females / metrics.total) * 100) : 0}%`,
              description: "of total participants",
            }}
          />
        </div>
      </div>

      {/* Age Demographics */}
      <div className="space-y-4">
        <div className="border-border/40 border-b pb-3">
          <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Age Demographics
          </h3>
          <p className="text-muted-foreground text-sm">
            Age distribution by gender and working age groups
          </p>
        </div>
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
          <MetricCard
            title="Young Males (15-35)"
            value={metrics.maleYouth}
            description="Male participants in working age group"
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            className="border-l-4 border-l-green-500"
            footer={{
              title: "Youth Demographics",
              description: "Prime working age males",
            }}
          />
          <MetricCard
            title="Adult Males (>35)"
            value={metrics.maleAdult}
            description="Mature male participants"
            icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
            className="border-l-4 border-l-emerald-500"
            footer={{
              title: "Adult Demographics",
              description: "Experienced male participants",
            }}
          />
          <MetricCard
            title="Young Females (15-35)"
            value={metrics.femaleYouth}
            description="Female participants in working age group"
            icon={<TrendingUp className="h-4 w-4 text-rose-600" />}
            className="border-l-4 border-l-rose-500"
            footer={{
              title: "Youth Demographics",
              description: "Prime working age females",
            }}
          />
          <MetricCard
            title="Adult Females (>35)"
            value={metrics.femaleAdult}
            description="Mature female participants"
            icon={<TrendingUp className="h-4 w-4 text-pink-600" />}
            className="border-l-4 border-l-pink-500"
            footer={{
              title: "Adult Demographics",
              description: "Experienced female participants",
            }}
          />
        </div>
      </div>

      {/* Employment & PWDs */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="border-border/40 border-b pb-3">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Employment
            </h3>
            <p className="text-muted-foreground text-sm">
              Employment status and entrepreneurship metrics
            </p>
          </div>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2">
            <MetricCard
              title="Total Employed"
              value={metrics.employed}
              description="Participants with any form of employment"
              icon={<Briefcase className="h-4 w-4 text-purple-600" />}
              className="border-l-4 border-l-purple-500"
              footer={{
                title: "Employment Status",
                description: "All employed participants",
              }}
            />
            <MetricCard
              title="Self Employed"
              value={metrics.selfEmployed}
              description="Participants running their own businesses"
              icon={<Briefcase className="h-4 w-4 text-indigo-600" />}
              className="border-l-4 border-l-indigo-500"
              footer={{
                title: "Entrepreneurs",
                description: "Own business ventures",
              }}
            />
            <MetricCard
              title="Self Employed Women"
              value={metrics.selfEmployedFemale}
              description="Female entrepreneurs and business owners"
              icon={<Briefcase className="h-4 w-4 text-violet-600" />}
              className="border-l-4 border-l-violet-500"
              footer={{
                title: "Women in Business",
                description: "Female entrepreneurs",
              }}
            />
            <MetricCard
              title="Self Employed Men"
              value={metrics.selfEmployedMale}
              description="Male entrepreneurs and business owners"
              icon={<Briefcase className="h-4 w-4 text-blue-700" />}
              className="border-l-4 border-l-blue-600"
              footer={{
                title: "Men in Business",
                description: "Male entrepreneurs",
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-border/40 border-b pb-3">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5 text-rose-600" />
              Accessibility & Location
            </h3>
            <p className="text-muted-foreground text-sm">
              Inclusion metrics and geographic distribution
            </p>
          </div>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2">
            <MetricCard
              title="Persons with Disabilities"
              value={metrics.pwds}
              description="Participants with documented disabilities"
              icon={<Heart className="h-4 w-4 text-red-600" />}
              className="border-l-4 border-l-red-500"
              footer={{
                title: "Inclusive Participation",
                description: "Total PWDs in activity",
              }}
            />
            <MetricCard
              title="Male PWDs"
              value={metrics.pwdMale}
              description="Male participants with disabilities"
              icon={<Heart className="h-4 w-4 text-red-500" />}
              className="border-l-4 border-l-red-400"
              footer={{
                title: "Male Accessibility",
                description: "Men with disabilities",
              }}
            />
            <MetricCard
              title="Female PWDs"
              value={metrics.pwdFemale}
              description="Female participants with disabilities"
              icon={<Heart className="h-4 w-4 text-pink-600" />}
              className="border-l-4 border-l-pink-500"
              footer={{
                title: "Female Accessibility",
                description: "Women with disabilities",
              }}
            />
            <MetricCard
              title="Rural Participants"
              value={metrics.rural}
              description="Participants from rural/village areas"
              icon={<MapPin className="h-4 w-4 text-green-700" />}
              className="border-l-4 border-l-green-600"
              footer={{
                title: "Rural Representation",
                description: "Village-based participants",
              }}
            />
          </div>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-1">
            <MetricCard
              title="Urban Participants"
              value={metrics.urban}
              description="Participants from urban/city areas"
              icon={<MapPin className="h-4 w-4 text-slate-600" />}
              className="border-l-4 border-l-slate-500"
              footer={{
                title: "Urban Representation",
                description: "City-based participants",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
