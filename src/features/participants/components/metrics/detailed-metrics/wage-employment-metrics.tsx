"use client";

import {
  Briefcase,
  UserCheck,
  Heart,
  Building2,
  MapPin,
  UserX,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface WageEmploymentMetricsProps {
  metrics: {
    wageEmployment: {
      total: number;
      male: number;
      female: number;
      male15to35: number;
      maleAbove35: number;
      female15to35: number;
      femaleAbove35: number;
      urban: number;
      rural: number;
      pwds: number;
      femalePWDs: number;
      malePWDs: number;
      percentage: number;
    };
  };
}

export function WageEmploymentMetrics({ metrics }: WageEmploymentMetricsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Total Wage Employment */}
      <MetricCard
        title="Total in Wage Employment"
        value={metrics.wageEmployment.total.toLocaleString()}
        trend={{
          value: metrics.wageEmployment.percentage,
          isPositive: metrics.wageEmployment.percentage >= 30,
          label: `${metrics.wageEmployment.percentage}% of total`,
        }}
        footer={{
          title: `${metrics.wageEmployment.percentage}% of total`,
          description: "Formal employment",
        }}
        icon={<Briefcase className="size-4" />}
      />

      {/* Male Wage Employment */}
      <MetricCard
        title="Male Wage Employment"
        value={metrics.wageEmployment.male.toLocaleString()}
        footer={{
          title: "Male employment",
          description: `${Math.round((metrics.wageEmployment.male / metrics.wageEmployment.total) * 100)}% of wage employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male 15-35 Wage Employment */}
      <MetricCard
        title="Male (15–35yrs) Wage Employment"
        value={metrics.wageEmployment.male15to35.toLocaleString()}
        footer={{
          title: "Young male workers",
          description: `${Math.round((metrics.wageEmployment.male15to35 / metrics.wageEmployment.male) * 100)}% of male wage employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male above 35 Wage Employment */}
      <MetricCard
        title="Male above 35 Wage Employment"
        value={metrics.wageEmployment.maleAbove35.toLocaleString()}
        footer={{
          title: "Adult male workers",
          description: `${Math.round((metrics.wageEmployment.maleAbove35 / metrics.wageEmployment.male) * 100)}% of male wage employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Female Wage Employment */}
      <MetricCard
        title="Female Wage Employment"
        value={metrics.wageEmployment.female.toLocaleString()}
        footer={{
          title: "Female employment",
          description: `${Math.round((metrics.wageEmployment.female / metrics.wageEmployment.total) * 100)}% of wage employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female 15-35 Wage Employment */}
      <MetricCard
        title="Female (15–35yrs) Wage Employment"
        value={metrics.wageEmployment.female15to35.toLocaleString()}
        footer={{
          title: "Young female workers",
          description: `${Math.round((metrics.wageEmployment.female15to35 / metrics.wageEmployment.female) * 100)}% of female wage employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female above 35 Wage Employment */}
      <MetricCard
        title="Female above 35 Wage Employment"
        value={metrics.wageEmployment.femaleAbove35.toLocaleString()}
        footer={{
          title: "Adult female workers",
          description: `${Math.round((metrics.wageEmployment.femaleAbove35 / metrics.wageEmployment.female) * 100)}% of female wage employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Urban Wage Employment */}
      <MetricCard
        title="Urban Wage Employment"
        value={metrics.wageEmployment.urban.toLocaleString()}
        footer={{
          title: "Urban employment",
          description: `${Math.round((metrics.wageEmployment.urban / metrics.wageEmployment.total) * 100)}% of wage employed`,
        }}
        icon={<Building2 className="size-4" />}
      />

      {/* Rural Wage Employment */}
      <MetricCard
        title="Rural Wage Employment"
        value={metrics.wageEmployment.rural.toLocaleString()}
        footer={{
          title: "Rural employment",
          description: `${Math.round((metrics.wageEmployment.rural / metrics.wageEmployment.total) * 100)}% of wage employed`,
        }}
        icon={<MapPin className="size-4" />}
      />

      {/* PWDs Wage Employment */}
      <MetricCard
        title="Total PWDs Wage Employment"
        value={metrics.wageEmployment.pwds.toLocaleString()}
        footer={{
          title: "Inclusive employment",
          description: `${Math.round((metrics.wageEmployment.pwds / metrics.wageEmployment.total) * 100)}% of wage employed`,
        }}
        icon={<UserX className="size-4" />}
      />

      {/* Female PWDs Wage Employment */}
      <MetricCard
        title="Female PWDs Wage Employment"
        value={metrics.wageEmployment.femalePWDs.toLocaleString()}
        footer={{
          title: "Female PWD inclusion",
          description: `${Math.round((metrics.wageEmployment.femalePWDs / metrics.wageEmployment.pwds) * 100)}% of PWD wage employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Male PWDs Wage Employment */}
      <MetricCard
        title="Male PWDs Wage Employment"
        value={metrics.wageEmployment.malePWDs.toLocaleString()}
        footer={{
          title: "Male PWD inclusion",
          description: `${Math.round((metrics.wageEmployment.malePWDs / metrics.wageEmployment.pwds) * 100)}% of PWD wage employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />
    </div>
  );
}
