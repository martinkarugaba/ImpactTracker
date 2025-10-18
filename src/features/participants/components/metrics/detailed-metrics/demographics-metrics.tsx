"use client";

import {
  Users,
  UserCheck,
  Heart,
  Building2,
  MapPin,
  UserX,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface DemographicsMetricsProps {
  metrics: {
    total: number;
    demographics: {
      urban: number;
      rural: number;
      youth: number;
      above35: number;
      male: number;
      female: number;
      male15to35: number;
      maleAbove35: number;
      female15to35: number;
      femaleAbove35: number;
      pwds: number;
      femalePWDs: number;
      malePWDs: number;
      urbanPercentage: number;
      ruralPercentage: number;
      youthPercentage: number;
      femalePercentage: number;
      pwdPercentage: number;
    };
  };
}

export function DemographicsMetrics({ metrics }: DemographicsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
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

      {/* Urban Setting */}
      <MetricCard
        title="Urban Setting"
        value={metrics.demographics.urban.toLocaleString()}
        trend={{
          value: metrics.demographics.urbanPercentage,
          isPositive: true,
          label: `${metrics.demographics.urbanPercentage}% of total`,
        }}
        footer={{
          title: `${metrics.demographics.urbanPercentage}% of total`,
          description: "Urban area participants",
        }}
        icon={<Building2 className="size-4" />}
      />

      {/* Rural Setting */}
      <MetricCard
        title="Rural Setting"
        value={metrics.demographics.rural.toLocaleString()}
        trend={{
          value: metrics.demographics.ruralPercentage,
          isPositive: true,
          label: `${metrics.demographics.ruralPercentage}% of total`,
        }}
        footer={{
          title: `${metrics.demographics.ruralPercentage}% of total`,
          description: "Rural area participants",
        }}
        icon={<MapPin className="size-4" />}
      />

      {/* Youth (15-35) */}
      <MetricCard
        title="Participants aged 15–35"
        value={metrics.demographics.youth.toLocaleString()}
        trend={{
          value: metrics.demographics.youthPercentage,
          isPositive: metrics.demographics.youthPercentage >= 50,
          label: `${metrics.demographics.youthPercentage}% of total`,
        }}
        footer={{
          title: `${metrics.demographics.youthPercentage}% of total`,
          description: "Youth demographic",
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Above 35 */}
      <MetricCard
        title="Participants above 35"
        value={metrics.demographics.above35.toLocaleString()}
        trend={{
          value: Math.round(
            (metrics.demographics.above35 / metrics.total) * 100
          ),
          isPositive: true,
          label: `${Math.round((metrics.demographics.above35 / metrics.total) * 100)}% of total`,
        }}
        footer={{
          title: `${Math.round((metrics.demographics.above35 / metrics.total) * 100)}% of total`,
          description: "Adults above 35",
        }}
        icon={<Users className="size-4" />}
      />

      {/* Male Participants */}
      <MetricCard
        title="Male Participants"
        value={metrics.demographics.male.toLocaleString()}
        footer={{
          title: "Gender breakdown",
          description: `${100 - metrics.demographics.femalePercentage}% of total`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male 15-35 */}
      <MetricCard
        title="Male aged 15–35"
        value={metrics.demographics.male15to35.toLocaleString()}
        footer={{
          title: "Male youth",
          description: `${Math.round((metrics.demographics.male15to35 / metrics.demographics.male) * 100)}% of males`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male above 35 */}
      <MetricCard
        title="Male above 35"
        value={metrics.demographics.maleAbove35.toLocaleString()}
        footer={{
          title: "Male adults",
          description: `${Math.round((metrics.demographics.maleAbove35 / metrics.demographics.male) * 100)}% of males`,
        }}
        icon={<Users className="size-4" />}
      />

      {/* Female Participants */}
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

      {/* Female 15-35 */}
      <MetricCard
        title="Female aged 15–35"
        value={metrics.demographics.female15to35.toLocaleString()}
        footer={{
          title: "Female youth",
          description: `${Math.round((metrics.demographics.female15to35 / metrics.demographics.female) * 100)}% of females`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female above 35 */}
      <MetricCard
        title="Female above 35"
        value={metrics.demographics.femaleAbove35.toLocaleString()}
        footer={{
          title: "Female adults",
          description: `${Math.round((metrics.demographics.femaleAbove35 / metrics.demographics.female) * 100)}% of females`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* PWDs */}
      <MetricCard
        title="Participants with Disability"
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

      {/* Female PWDs */}
      <MetricCard
        title="Female PWDs"
        value={metrics.demographics.femalePWDs.toLocaleString()}
        footer={{
          title: "Female inclusion",
          description: `${Math.round((metrics.demographics.femalePWDs / metrics.demographics.pwds) * 100)}% of PWDs`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Male PWDs */}
      <MetricCard
        title="Male PWDs"
        value={metrics.demographics.malePWDs.toLocaleString()}
        footer={{
          title: "Male inclusion",
          description: `${Math.round((metrics.demographics.malePWDs / metrics.demographics.pwds) * 100)}% of PWDs`,
        }}
        icon={<UserCheck className="size-4" />}
      />
    </div>
  );
}
