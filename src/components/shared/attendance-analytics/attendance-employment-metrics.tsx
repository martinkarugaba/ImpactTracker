"use client";

import {
  Briefcase,
  TrendingUp,
  Building,
  Coins,
  PlusCircle,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { type AttendanceAnalytics } from "@/hooks/shared/use-attendance-analytics";

interface AttendanceEmploymentMetricsProps {
  metrics: AttendanceAnalytics;
}

export function YouthEmploymentAttendanceMetrics({
  metrics,
}: AttendanceEmploymentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Youth in Work"
        value={`${metrics.employment.youthInWorkAttended}/${metrics.employment.youthInWork}`}
        trend={{
          value: metrics.employment.youthInWorkAttendanceRate,
          isPositive: metrics.employment.youthInWorkAttendanceRate >= 75,
          label: `${metrics.employment.youthInWorkAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.employment.youthInWorkAttendanceRate}% attendance rate`,
          description: "Youth in work attendance",
        }}
        icon={<Briefcase className="size-4" />}
      />

      <MetricCard
        title="Total Youth in Work"
        value={metrics.employment.youthInWork.toLocaleString()}
        footer={{
          title: "Employment status",
          description: "Youth participants with work",
        }}
        icon={<TrendingUp className="size-4" />}
      />
    </div>
  );
}

export function WageEmploymentAttendanceMetrics({
  metrics,
}: AttendanceEmploymentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Wage Employment Attendance"
        value={`${metrics.employment.wageEmployedAttended}/${metrics.employment.wageEmployed}`}
        trend={{
          value: metrics.employment.wageEmployedAttendanceRate,
          isPositive: metrics.employment.wageEmployedAttendanceRate >= 75,
          label: `${metrics.employment.wageEmployedAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.employment.wageEmployedAttendanceRate}% attendance rate`,
          description: "Wage employed attendance",
        }}
        icon={<Building className="size-4" />}
      />

      <MetricCard
        title="Total Wage Employed"
        value={metrics.employment.wageEmployed.toLocaleString()}
        footer={{
          title: "Employment type",
          description: "Participants with wage employment",
        }}
        icon={<Building className="size-4" />}
      />
    </div>
  );
}

export function SelfEmploymentAttendanceMetrics({
  metrics,
}: AttendanceEmploymentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Self Employment Attendance"
        value={`${metrics.employment.selfEmployedAttended}/${metrics.employment.selfEmployed}`}
        trend={{
          value: metrics.employment.selfEmployedAttendanceRate,
          isPositive: metrics.employment.selfEmployedAttendanceRate >= 75,
          label: `${metrics.employment.selfEmployedAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.employment.selfEmployedAttendanceRate}% attendance rate`,
          description: "Self employed attendance",
        }}
        icon={<Coins className="size-4" />}
      />

      <MetricCard
        title="Total Self Employed"
        value={metrics.employment.selfEmployed.toLocaleString()}
        footer={{
          title: "Employment type",
          description: "Participants with self employment",
        }}
        icon={<Coins className="size-4" />}
      />
    </div>
  );
}

export function SecondaryEmploymentAttendanceMetrics({
  metrics,
}: AttendanceEmploymentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Secondary Employment Attendance"
        value={`${metrics.employment.secondaryEmployedAttended}/${metrics.employment.secondaryEmployed}`}
        trend={{
          value: metrics.employment.secondaryEmployedAttendanceRate,
          isPositive: metrics.employment.secondaryEmployedAttendanceRate >= 75,
          label: `${metrics.employment.secondaryEmployedAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.employment.secondaryEmployedAttendanceRate}% attendance rate`,
          description: "Secondary employed attendance",
        }}
        icon={<PlusCircle className="size-4" />}
      />

      <MetricCard
        title="Total Secondary Employed"
        value={metrics.employment.secondaryEmployed.toLocaleString()}
        footer={{
          title: "Employment type",
          description: "Participants with secondary employment",
        }}
        icon={<PlusCircle className="size-4" />}
      />
    </div>
  );
}
