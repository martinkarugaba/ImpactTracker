"use client";

import {
  Users,
  UserCheck,
  Heart,
  Briefcase,
  GraduationCap,
  Award,
  Building2,
  Banknote,
  MapPin,
  UserX,
  TrendingUp,
  Target,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useCalculatedParticipantMetrics } from "../../hooks/use-calculated-participant-metrics";
import { type Participant } from "../../types/types";

interface ParticipantMetricCardsProps {
  participants: Participant[];
  isLoading?: boolean;
}

export function ParticipantMetricCards({
  participants,
  isLoading = false,
}: ParticipantMetricCardsProps) {
  const metrics = useCalculatedParticipantMetrics(participants);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Total Participants */}
      <MetricCard
        title="Total Participants"
        value={metrics.total.toLocaleString()}
        footer={{
          title: "All registered",
          description: "Active participants in program",
        }}
        icon={<Users className="size-4" />}
      />

      {/* Youth Participation */}
      <MetricCard
        title="Youth (15-35)"
        value={metrics.demographics.youth.toLocaleString()}
        trend={{
          value: metrics.demographics.youthPercentage,
          isPositive: metrics.demographics.youthPercentage >= 50,
          label: `${metrics.demographics.youthPercentage}% of total`,
        }}
        footer={{
          title: `${metrics.demographics.youthPercentage}% of total`,
          description: "Target demographic reached",
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Female Participation */}
      <MetricCard
        title="Female Participants"
        value={metrics.demographics.female.toLocaleString()}
        trend={{
          value: metrics.demographics.femalePercentage,
          isPositive: metrics.demographics.femalePercentage >= 50,
          label: `${metrics.demographics.femalePercentage}% of total`,
        }}
        footer={{
          title: `${metrics.demographics.femalePercentage}% of total`,
          description: "Gender inclusion metric",
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Employment Rate */}
      <MetricCard
        title="Employment Rate"
        value={`${Math.round(((metrics.wageEmployment.total + metrics.selfEmployment.total) / metrics.total) * 100)}%`}
        trend={{
          value: Math.round(
            ((metrics.wageEmployment.total + metrics.selfEmployment.total) /
              metrics.total) *
              100
          ),
          isPositive:
            Math.round(
              ((metrics.wageEmployment.total + metrics.selfEmployment.total) /
                metrics.total) *
                100
            ) >= 60,
          label: `${metrics.wageEmployment.total + metrics.selfEmployment.total} employed`,
        }}
        footer={{
          title: `${metrics.wageEmployment.total + metrics.selfEmployment.total} employed`,
          description: "Economic impact achieved",
        }}
        icon={<Briefcase className="size-4" />}
      />

      {/* Wage Employment */}
      <MetricCard
        title="Wage Employed"
        value={metrics.wageEmployment.total.toLocaleString()}
        trend={{
          value: metrics.wageEmployment.percentage,
          isPositive: metrics.wageEmployment.percentage >= 30,
          label: `${metrics.wageEmployment.percentage}% of total`,
        }}
        footer={{
          title: `${metrics.wageEmployment.percentage}% of total`,
          description: "Formal employment secured",
        }}
        icon={<Building2 className="size-4" />}
      />

      {/* Self Employment */}
      <MetricCard
        title="Self Employed"
        value={metrics.selfEmployment.total.toLocaleString()}
        trend={{
          value: metrics.selfEmployment.percentage,
          isPositive: metrics.selfEmployment.percentage >= 20,
          label: `${metrics.selfEmployment.percentage}% of total`,
        }}
        footer={{
          title: `${metrics.selfEmployment.percentage}% of total`,
          description: "Entrepreneurship developed",
        }}
        icon={<TrendingUp className="size-4" />}
      />

      {/* Vocational Skills */}
      <MetricCard
        title="Vocational Skills"
        value={metrics.skills.hasVocationalSkills.toLocaleString()}
        trend={{
          value: metrics.skills.vocationalRate,
          isPositive: metrics.skills.vocationalRate >= 70,
          label: `${metrics.skills.vocationalRate}% trained`,
        }}
        footer={{
          title: `${metrics.skills.vocationalRate}% trained`,
          description: "Technical skills developed",
        }}
        icon={<GraduationCap className="size-4" />}
      />

      {/* Business Skills */}
      <MetricCard
        title="Business Skills"
        value={metrics.skills.hasBusinessSkills.toLocaleString()}
        trend={{
          value: metrics.skills.businessRate,
          isPositive: metrics.skills.businessRate >= 50,
          label: `${metrics.skills.businessRate}% trained`,
        }}
        footer={{
          title: `${metrics.skills.businessRate}% trained`,
          description: "Business capacity built",
        }}
        icon={<Award className="size-4" />}
      />

      {/* VSLA Members */}
      <MetricCard
        title="VSLA Members"
        value={metrics.financial.vslaMembers.toLocaleString()}
        trend={{
          value: metrics.financial.vslaRate,
          isPositive: metrics.financial.vslaRate >= 40,
          label: `${metrics.financial.vslaRate}% of total`,
        }}
        footer={{
          title: `${metrics.financial.vslaRate}% of total`,
          description: "Financial inclusion achieved",
        }}
        icon={<Banknote className="size-4" />}
      />

      {/* Enterprise Owners */}
      <MetricCard
        title="Enterprise Owners"
        value={metrics.financial.enterpriseOwners.toLocaleString()}
        trend={{
          value: metrics.financial.enterpriseRate,
          isPositive: metrics.financial.enterpriseRate >= 30,
          label: `${metrics.financial.enterpriseRate}% of total`,
        }}
        footer={{
          title: `${metrics.financial.enterpriseRate}% of total`,
          description: "Business ownership fostered",
        }}
        icon={<Target className="size-4" />}
      />

      {/* Persons with Disabilities */}
      <MetricCard
        title="Persons with Disabilities"
        value={metrics.demographics.pwds.toLocaleString()}
        trend={{
          value: metrics.demographics.pwdPercentage,
          isPositive: metrics.demographics.pwdPercentage >= 5,
          label: `${metrics.demographics.pwdPercentage}% of total`,
        }}
        footer={{
          title: `${metrics.demographics.pwdPercentage}% of total`,
          description: "Inclusive participation",
        }}
        icon={<UserX className="size-4" />}
      />

      {/* Urban vs Rural */}
      <MetricCard
        title="Urban Participants"
        value={metrics.demographics.urban.toLocaleString()}
        trend={{
          value: metrics.demographics.urbanPercentage,
          isPositive: true,
          label: `${metrics.demographics.urbanPercentage}% urban`,
        }}
        footer={{
          title: `${metrics.demographics.rural} rural (${metrics.demographics.ruralPercentage}%)`,
          description: "Geographic distribution",
        }}
        icon={<MapPin className="size-4" />}
      />
    </div>
  );
}
