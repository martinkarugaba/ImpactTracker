"use client";

import { useMemo } from "react";
import {
  Users,
  User,
  Briefcase,
  MapPin,
  Heart,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Award,
} from "lucide-react";
import type { Activity } from "../../types/types";
import { useActivityParticipants } from "../../hooks/use-activities";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ParticipantsMetricsTabProps {
  activity: Activity;
}

// Extended participant type to handle potentially missing fields
interface ExtendedParticipant {
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
}

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
      {/* Hero Metrics */}
      <div className="dark:via-background relative overflow-hidden rounded-xl border bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="relative z-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Participant Analytics
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive demographic insights and engagement metrics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.total}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Participants
                </div>
                <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  100% Enrolled
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                    <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.total > 0
                    ? Math.round(
                        ((metrics.maleYouth + metrics.femaleYouth) /
                          metrics.total) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Youth Participation
                </div>
                <Badge className="mt-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Ages 15-35
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-purple-100 p-4 dark:bg-purple-900/30">
                    <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.total > 0
                    ? Math.round((metrics.females / metrics.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Gender Diversity
                </div>
                <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  Female Participation
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-2xl dark:from-blue-800/20 dark:to-purple-800/20"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-2xl dark:from-purple-800/20 dark:to-pink-800/20"></div>
      </div>
      {/* Demographics Overview */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Core Demographics
            </h3>
            <p className="text-muted-foreground">
              Gender distribution and basic participant statistics
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Male Participants"
            value={metrics.males}
            description="Total male participants in the activity"
            icon={<User className="h-4 w-4 text-blue-600" />}
            className="border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: `${metrics.total > 0 ? Math.round((metrics.males / metrics.total) * 100) : 0}%`,
              description: "of all participants",
            }}
          />
          <MetricCard
            title="Female Participants"
            value={metrics.females}
            description="Total female participants in the activity"
            icon={<User className="h-4 w-4 text-pink-600" />}
            className="border-l-4 border-l-pink-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: `${metrics.total > 0 ? Math.round((metrics.females / metrics.total) * 100) : 0}%`,
              description: "of all participants",
            }}
          />
          <MetricCard
            title="Gender Balance"
            value={`${metrics.males}:${metrics.females}`}
            description="Male to female ratio representation"
            icon={<PieChart className="h-4 w-4 text-purple-600" />}
            className="border-l-4 border-l-purple-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title:
                metrics.total > 0 && metrics.females > 0
                  ? `1:${(metrics.females / Math.max(metrics.males, 1)).toFixed(1)}`
                  : "N/A",
              description: "balanced representation",
            }}
          />
        </div>
      </div>

      {/* Age Demographics */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Age Distribution
            </h3>
            <p className="text-muted-foreground">
              Working age groups and generational representation
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Young Males (15-35)"
            value={metrics.maleYouth}
            description="Male participants in prime working age"
            icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
            className="border-l-4 border-l-emerald-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: "Youth Workforce",
              description: "Next generation leaders",
            }}
          />
          <MetricCard
            title="Adult Males (>35)"
            value={metrics.maleAdult}
            description="Experienced male participants"
            icon={<Target className="h-4 w-4 text-green-600" />}
            className="border-l-4 border-l-green-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: "Mature Workforce",
              description: "Experienced professionals",
            }}
          />
          <MetricCard
            title="Young Females (15-35)"
            value={metrics.femaleYouth}
            description="Female participants in prime working age"
            icon={<TrendingUp className="h-4 w-4 text-rose-600" />}
            className="border-l-4 border-l-rose-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: "Youth Workforce",
              description: "Next generation leaders",
            }}
          />
          <MetricCard
            title="Adult Females (>35)"
            value={metrics.femaleAdult}
            description="Experienced female participants"
            icon={<Target className="h-4 w-4 text-pink-600" />}
            className="border-l-4 border-l-pink-500 transition-all duration-200 hover:shadow-lg"
            footer={{
              title: "Mature Workforce",
              description: "Experienced professionals",
            }}
          />
        </div>
      </div>

      {/* Economic & Social Impact */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Employment Metrics */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Employment Impact
              </h3>
              <p className="text-muted-foreground text-sm">
                Economic activity and entrepreneurship metrics
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Total Employed"
                value={metrics.employed}
                description="Participants with employment status"
                icon={<Briefcase className="h-4 w-4 text-purple-600" />}
                className="border-l-4 border-l-purple-500 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Economic Activity",
                  description: "Active workforce",
                }}
              />
              <MetricCard
                title="Self Employed"
                value={metrics.selfEmployed}
                description="Entrepreneurs and business owners"
                icon={<Target className="h-4 w-4 text-indigo-600" />}
                className="border-l-4 border-l-indigo-500 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Entrepreneurship",
                  description: "Business ventures",
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Women Entrepreneurs"
                value={metrics.selfEmployedFemale}
                description="Female business owners and entrepreneurs"
                icon={<Award className="h-4 w-4 text-violet-600" />}
                className="border-l-4 border-l-violet-500 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Women in Business",
                  description: "Female leadership",
                }}
              />
              <MetricCard
                title="Men Entrepreneurs"
                value={metrics.selfEmployedMale}
                description="Male business owners and entrepreneurs"
                icon={<Briefcase className="h-4 w-4 text-blue-700" />}
                className="border-l-4 border-l-blue-600 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Men in Business",
                  description: "Male leadership",
                }}
              />
            </div>
          </div>
        </div>

        {/* Inclusion & Location */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-rose-100 p-3 dark:bg-rose-900/30">
              <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Inclusion & Reach
              </h3>
              <p className="text-muted-foreground text-sm">
                Accessibility and geographic representation
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              <MetricCard
                title="Persons with Disabilities"
                value={metrics.pwds}
                description="Participants with documented disabilities"
                icon={<Heart className="h-4 w-4 text-red-600" />}
                className="border-l-4 border-l-red-500 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Inclusive Participation",
                  description: `${metrics.total > 0 ? ((metrics.pwds / metrics.total) * 100).toFixed(1) : 0}% of participants`,
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Male PWDs"
                value={metrics.pwdMale}
                description="Male participants with disabilities"
                icon={<Heart className="h-4 w-4 text-red-500" />}
                className="border-l-4 border-l-red-400 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Male Inclusion",
                  description: "Accessibility focus",
                }}
              />
              <MetricCard
                title="Female PWDs"
                value={metrics.pwdFemale}
                description="Female participants with disabilities"
                icon={<Heart className="h-4 w-4 text-pink-600" />}
                className="border-l-4 border-l-pink-500 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Female Inclusion",
                  description: "Accessibility focus",
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Rural Participants"
                value={metrics.rural}
                description="Participants from rural/village areas"
                icon={<MapPin className="h-4 w-4 text-green-700" />}
                className="border-l-4 border-l-green-600 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Rural Outreach",
                  description: `${metrics.total > 0 ? ((metrics.rural / metrics.total) * 100).toFixed(1) : 0}% rural`,
                }}
              />
              <MetricCard
                title="Urban Participants"
                value={metrics.urban}
                description="Participants from urban/city areas"
                icon={<MapPin className="h-4 w-4 text-slate-600" />}
                className="border-l-4 border-l-slate-500 transition-all duration-200 hover:shadow-lg"
                footer={{
                  title: "Urban Reach",
                  description: `${metrics.total > 0 ? ((metrics.urban / metrics.total) * 100).toFixed(1) : 0}% urban`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
