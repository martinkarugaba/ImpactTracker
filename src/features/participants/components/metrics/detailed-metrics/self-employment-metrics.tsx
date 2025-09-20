"use client";

import {
  TrendingUp,
  UserCheck,
  Heart,
  Building2,
  MapPin,
  UserX,
  Banknote,
  Target,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface SelfEmploymentMetricsProps {
  metrics: {
    selfEmployment: {
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
    financial: {
      vslaMembers: number;
      enterpriseOwners: number;
      vslaRate: number;
      enterpriseRate: number;
    };
  };
}

export function SelfEmploymentMetrics({ metrics }: SelfEmploymentMetricsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Total Self Employment */}
      <MetricCard
        title="Total in Self Employment"
        value={metrics.selfEmployment.total.toLocaleString()}
        trend={{
          value: metrics.selfEmployment.percentage,
          isPositive: metrics.selfEmployment.percentage >= 20,
          label: `${metrics.selfEmployment.percentage}% of total`,
        }}
        footer={{
          title: `${metrics.selfEmployment.percentage}% of total`,
          description: "Entrepreneurship",
        }}
        icon={<TrendingUp className="size-4" />}
      />

      {/* Male Self Employment */}
      <MetricCard
        title="Male Self Employment"
        value={metrics.selfEmployment.male.toLocaleString()}
        footer={{
          title: "Male entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.male / metrics.selfEmployment.total) * 100)}% of self employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male 15-35 Self Employment */}
      <MetricCard
        title="Male (15–35yrs) Self Employment"
        value={metrics.selfEmployment.male15to35.toLocaleString()}
        footer={{
          title: "Young male entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.male15to35 / metrics.selfEmployment.male) * 100)}% of male self employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Male above 35 Self Employment */}
      <MetricCard
        title="Male above 35 Self Employment"
        value={metrics.selfEmployment.maleAbove35.toLocaleString()}
        footer={{
          title: "Adult male entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.maleAbove35 / metrics.selfEmployment.male) * 100)}% of male self employed`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      {/* Female Self Employment */}
      <MetricCard
        title="Female Self Employment"
        value={metrics.selfEmployment.female.toLocaleString()}
        footer={{
          title: "Female entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.female / metrics.selfEmployment.total) * 100)}% of self employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female 15-35 Self Employment */}
      <MetricCard
        title="Female (15–35yrs) Self Employment"
        value={metrics.selfEmployment.female15to35.toLocaleString()}
        footer={{
          title: "Young female entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.female15to35 / metrics.selfEmployment.female) * 100)}% of female self employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Female above 35 Self Employment */}
      <MetricCard
        title="Female above 35 Self Employment"
        value={metrics.selfEmployment.femaleAbove35.toLocaleString()}
        footer={{
          title: "Adult female entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.femaleAbove35 / metrics.selfEmployment.female) * 100)}% of female self employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Urban Self Employment */}
      <MetricCard
        title="Urban Self Employment"
        value={metrics.selfEmployment.urban.toLocaleString()}
        footer={{
          title: "Urban businesses",
          description: `${Math.round((metrics.selfEmployment.urban / metrics.selfEmployment.total) * 100)}% of self employed`,
        }}
        icon={<Building2 className="size-4" />}
      />

      {/* Rural Self Employment */}
      <MetricCard
        title="Rural Self Employment"
        value={metrics.selfEmployment.rural.toLocaleString()}
        footer={{
          title: "Rural businesses",
          description: `${Math.round((metrics.selfEmployment.rural / metrics.selfEmployment.total) * 100)}% of self employed`,
        }}
        icon={<MapPin className="size-4" />}
      />

      {/* PWDs Self Employment */}
      <MetricCard
        title="Total PWDs Self Employment"
        value={metrics.selfEmployment.pwds.toLocaleString()}
        footer={{
          title: "Inclusive entrepreneurship",
          description: `${Math.round((metrics.selfEmployment.pwds / metrics.selfEmployment.total) * 100)}% of self employed`,
        }}
        icon={<UserX className="size-4" />}
      />

      {/* Female PWDs Self Employment */}
      <MetricCard
        title="Female PWDs Self Employment"
        value={metrics.selfEmployment.femalePWDs.toLocaleString()}
        footer={{
          title: "Female PWD entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.femalePWDs / metrics.selfEmployment.pwds) * 100)}% of PWD self employed`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Male PWDs Self Employment */}
      <MetricCard
        title="Male PWDs Self Employment"
        value={metrics.selfEmployment.malePWDs.toLocaleString()}
        footer={{
          title: "Male PWD entrepreneurs",
          description: `${Math.round((metrics.selfEmployment.malePWDs / metrics.selfEmployment.pwds) * 100)}% of PWD self employed`,
        }}
        icon={<UserCheck className="size-4" />}
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
          description: "Community savings groups",
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
          description: "Business ownership",
        }}
        icon={<Target className="size-4" />}
      />
    </div>
  );
}
