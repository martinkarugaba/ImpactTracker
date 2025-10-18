"use client";

import { Briefcase, Building2, MapPin } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface YouthEmploymentMetricsProps {
  metrics: {
    youthEmployment: {
      youthInWork: number;
      youthInWorkUrban: number;
      youthInWorkRural: number;
      youthInWorkPercentage: number;
    };
  };
}

export function YouthEmploymentMetrics({
  metrics,
}: YouthEmploymentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Youth in Work */}
      <MetricCard
        title="Total Youth in Work"
        value={metrics.youthEmployment.youthInWork.toLocaleString()}
        trend={{
          value: metrics.youthEmployment.youthInWorkPercentage,
          isPositive: metrics.youthEmployment.youthInWorkPercentage >= 60,
          label: `${metrics.youthEmployment.youthInWorkPercentage}% of total`,
        }}
        footer={{
          title: `${metrics.youthEmployment.youthInWorkPercentage}% of total`,
          description: "Youth (15-35) with employment",
        }}
        icon={<Briefcase className="size-4" />}
      />

      {/* Youth in Work - Urban */}
      <MetricCard
        title="Youth in Work - Urban"
        value={metrics.youthEmployment.youthInWorkUrban.toLocaleString()}
        footer={{
          title: "Urban employment",
          description: `${Math.round((metrics.youthEmployment.youthInWorkUrban / metrics.youthEmployment.youthInWork) * 100)}% of youth in work`,
        }}
        icon={<Building2 className="size-4" />}
      />

      {/* Youth in Work - Rural */}
      <MetricCard
        title="Youth in Work - Rural"
        value={metrics.youthEmployment.youthInWorkRural.toLocaleString()}
        footer={{
          title: "Rural employment",
          description: `${Math.round((metrics.youthEmployment.youthInWorkRural / metrics.youthEmployment.youthInWork) * 100)}% of youth in work`,
        }}
        icon={<MapPin className="size-4" />}
      />
    </div>
  );
}
