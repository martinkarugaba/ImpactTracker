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

interface SecondaryEmploymentMetricsProps {
  metrics: {
    secondaryEmployment: {
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

export function SecondaryEmploymentMetrics({
  metrics,
}: SecondaryEmploymentMetricsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Total Secondary Employment */}
      <MetricCard
        title="Total in Secondary Employment"
        value={metrics.secondaryEmployment.total.toLocaleString()}
        trend={{
          value: metrics.secondaryEmployment.percentage,
          isPositive: metrics.secondaryEmployment.percentage >= 10,
          label: `${metrics.secondaryEmployment.percentage}% of total`,
        }}
        footer={{
          title: `${metrics.secondaryEmployment.percentage}% of total`,
          description: "Multiple income sources",
        }}
        icon={<Briefcase className="size-4" />}
      />

      {/* Male Secondary Employment */}
      <MetricCard
        title="Male Secondary Employment"
        value={metrics.secondaryEmployment.male.toLocaleString()}
        footer={{
          title: "Male secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.male / metrics.secondaryEmployment.total) * 100)}% of secondary employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male 15-35 Secondary Employment */}
      <MetricCard
        title="Male (15–35yrs) Secondary Employment"
        value={metrics.secondaryEmployment.male15to35.toLocaleString()}
        footer={{
          title: "Young male secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.male15to35 / metrics.secondaryEmployment.male) * 100)}% of male secondary employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male above 35 Secondary Employment */}
      <MetricCard
        title="Male above 35 Secondary Employment"
        value={metrics.secondaryEmployment.maleAbove35.toLocaleString()}
        footer={{
          title: "Adult male secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.maleAbove35 / metrics.secondaryEmployment.male) * 100)}% of male secondary employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Female Secondary Employment */}
      <MetricCard
        title="Female Secondary Employment"
        value={metrics.secondaryEmployment.female.toLocaleString()}
        footer={{
          title: "Female secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.female / metrics.secondaryEmployment.total) * 100)}% of secondary employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female 15-35 Secondary Employment */}
      <MetricCard
        title="Female (15–35yrs) Secondary Employment"
        value={metrics.secondaryEmployment.female15to35.toLocaleString()}
        footer={{
          title: "Young female secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.female15to35 / metrics.secondaryEmployment.female) * 100)}% of female secondary employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female above 35 Secondary Employment */}
      <MetricCard
        title="Female above 35 Secondary Employment"
        value={metrics.secondaryEmployment.femaleAbove35.toLocaleString()}
        footer={{
          title: "Adult female secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.femaleAbove35 / metrics.secondaryEmployment.female) * 100)}% of female secondary employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Urban Secondary Employment */}
      <MetricCard
        title="Urban Secondary Employment"
        value={metrics.secondaryEmployment.urban.toLocaleString()}
        footer={{
          title: "Urban secondary employment",
          description: `${Math.round((metrics.secondaryEmployment.urban / metrics.secondaryEmployment.total) * 100)}% of secondary employed`,
        }}
        icon={<Building2 className="size-4" />}
      />

      {/* Rural Secondary Employment */}
      <MetricCard
        title="Rural Secondary Employment"
        value={metrics.secondaryEmployment.rural.toLocaleString()}
        footer={{
          title: "Rural secondary employment",
          description: `${Math.round((metrics.secondaryEmployment.rural / metrics.secondaryEmployment.total) * 100)}% of secondary employed`,
        }}
        icon={<MapPin className="size-4" />}
      />

      {/* PWDs Secondary Employment */}
      <MetricCard
        title="Total PWDs Secondary Employment"
        value={metrics.secondaryEmployment.pwds.toLocaleString()}
        footer={{
          title: "Inclusive secondary employment",
          description: `${Math.round((metrics.secondaryEmployment.pwds / metrics.secondaryEmployment.total) * 100)}% of secondary employed`,
        }}
        icon={<UserX className="size-4" />}
      />

      {/* Female PWDs Secondary Employment */}
      <MetricCard
        title="Female PWDs Secondary Employment"
        value={metrics.secondaryEmployment.femalePWDs.toLocaleString()}
        footer={{
          title: "Female PWD secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.femalePWDs / metrics.secondaryEmployment.pwds) * 100)}% of PWD secondary employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Male PWDs Secondary Employment */}
      <MetricCard
        title="Male PWDs Secondary Employment"
        value={metrics.secondaryEmployment.malePWDs.toLocaleString()}
        footer={{
          title: "Male PWD secondary workers",
          description: `${Math.round((metrics.secondaryEmployment.malePWDs / metrics.secondaryEmployment.pwds) * 100)}% of PWD secondary employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />
    </div>
  );
}
