"use client";

import {
  Users,
  UserCheck,
  Heart,
  Building2,
  MapPin,
  UserX,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { type AttendanceAnalytics } from "@/hooks/shared/use-attendance-analytics";

interface AttendanceDemographicsMetricsProps {
  metrics: AttendanceAnalytics;
}

export function AttendanceDemographicsMetrics({
  metrics,
}: AttendanceDemographicsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Overall Attendance */}
      <MetricCard
        title="Total Participants"
        value={metrics.total.toLocaleString()}
        footer={{
          title: "Registered for activity",
          description: "All participants in attendance records",
        }}
        icon={<Users className="size-4" />}
      />

      <MetricCard
        title="Attended"
        value={metrics.totalAttended.toLocaleString()}
        trend={{
          value: metrics.attendanceRate,
          isPositive: metrics.attendanceRate >= 75,
          label: `${metrics.attendanceRate}% attendance rate`,
        }}
        footer={{
          title: `${metrics.attendanceRate}% of total`,
          description: "Successfully attended sessions",
        }}
        icon={<CheckCircle className="size-4" />}
      />

      <MetricCard
        title="Absent"
        value={metrics.totalAbsent.toLocaleString()}
        trend={{
          value: Math.round((metrics.totalAbsent / metrics.total) * 100),
          isPositive: false,
          label: `${Math.round((metrics.totalAbsent / metrics.total) * 100)}% absence rate`,
        }}
        footer={{
          title: `${Math.round((metrics.totalAbsent / metrics.total) * 100)}% of total`,
          description: "Did not attend sessions",
        }}
        icon={<XCircle className="size-4" />}
      />

      <MetricCard
        title="Late Arrivals"
        value={metrics.totalLate.toLocaleString()}
        footer={{
          title: `${Math.round((metrics.totalLate / metrics.total) * 100)}% of total`,
          description: "Arrived late to sessions",
        }}
        icon={<Clock className="size-4" />}
      />

      {/* Setting-based Attendance */}
      <MetricCard
        title="Urban Participants"
        value={`${metrics.demographics.attendedUrban}/${metrics.demographics.urban}`}
        trend={{
          value: metrics.demographics.urbanAttendanceRate,
          isPositive: metrics.demographics.urbanAttendanceRate >= 75,
          label: `${metrics.demographics.urbanAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.urbanAttendanceRate}% attendance rate`,
          description: "Urban setting attendance",
        }}
        icon={<Building2 className="size-4" />}
      />

      <MetricCard
        title="Rural Participants"
        value={`${metrics.demographics.attendedRural}/${metrics.demographics.rural}`}
        trend={{
          value: metrics.demographics.ruralAttendanceRate,
          isPositive: metrics.demographics.ruralAttendanceRate >= 75,
          label: `${metrics.demographics.ruralAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.ruralAttendanceRate}% attendance rate`,
          description: "Rural setting attendance",
        }}
        icon={<MapPin className="size-4" />}
      />

      {/* Age-based Attendance */}
      <MetricCard
        title="Youth (15-35) Attendance"
        value={`${metrics.demographics.attendedYouth}/${metrics.demographics.youth}`}
        trend={{
          value: metrics.demographics.youthAttendanceRate,
          isPositive: metrics.demographics.youthAttendanceRate >= 75,
          label: `${metrics.demographics.youthAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.youthAttendanceRate}% attendance rate`,
          description: "Youth demographic attendance",
        }}
        icon={<UserCheck className="size-4" />}
      />

      <MetricCard
        title="Above 35 Attendance"
        value={`${metrics.demographics.attendedAbove35}/${metrics.demographics.above35}`}
        trend={{
          value: metrics.demographics.above35AttendanceRate,
          isPositive: metrics.demographics.above35AttendanceRate >= 75,
          label: `${metrics.demographics.above35AttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.above35AttendanceRate}% attendance rate`,
          description: "Adults above 35 attendance",
        }}
        icon={<Users className="size-4" />}
      />

      {/* Gender-based Attendance */}
      <MetricCard
        title="Male Attendance"
        value={`${metrics.demographics.attendedMale}/${metrics.demographics.male}`}
        trend={{
          value: metrics.demographics.maleAttendanceRate,
          isPositive: metrics.demographics.maleAttendanceRate >= 75,
          label: `${metrics.demographics.maleAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.maleAttendanceRate}% attendance rate`,
          description: "Male participants attendance",
        }}
        icon={<UserCheck className="size-4" />}
      />

      <MetricCard
        title="Female Attendance"
        value={`${metrics.demographics.attendedFemale}/${metrics.demographics.female}`}
        trend={{
          value: metrics.demographics.femaleAttendanceRate,
          isPositive: metrics.demographics.femaleAttendanceRate >= 75,
          label: `${metrics.demographics.femaleAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.femaleAttendanceRate}% attendance rate`,
          description: "Female participants attendance",
        }}
        icon={<Heart className="size-4" />}
      />

      {/* Detailed Gender & Age Breakdowns */}
      <MetricCard
        title="Male Youth (15-35)"
        value={metrics.demographics.male15to35.toLocaleString()}
        footer={{
          title: "Male youth demographic",
          description: `${Math.round((metrics.demographics.male15to35 / metrics.demographics.male) * 100)}% of males`,
        }}
        icon={<UserCheck className="size-4" />}
      />

      <MetricCard
        title="Female Youth (15-35)"
        value={metrics.demographics.female15to35.toLocaleString()}
        footer={{
          title: "Female youth demographic",
          description: `${Math.round((metrics.demographics.female15to35 / metrics.demographics.female) * 100)}% of females`,
        }}
        icon={<Heart className="size-4" />}
      />

      <MetricCard
        title="Male Above 35"
        value={metrics.demographics.maleAbove35.toLocaleString()}
        footer={{
          title: "Male adults",
          description: `${Math.round((metrics.demographics.maleAbove35 / metrics.demographics.male) * 100)}% of males`,
        }}
        icon={<Users className="size-4" />}
      />

      <MetricCard
        title="Female Above 35"
        value={metrics.demographics.femaleAbove35.toLocaleString()}
        footer={{
          title: "Female adults",
          description: `${Math.round((metrics.demographics.femaleAbove35 / metrics.demographics.female) * 100)}% of females`,
        }}
        icon={<Heart className="size-4" />}
      />

      {/* PWD Attendance */}
      <MetricCard
        title="PWD Attendance"
        value={`${metrics.demographics.attendedPWDs}/${metrics.demographics.pwds}`}
        trend={{
          value: metrics.demographics.pwdAttendanceRate,
          isPositive: metrics.demographics.pwdAttendanceRate >= 75,
          label: `${metrics.demographics.pwdAttendanceRate}% attendance`,
        }}
        footer={{
          title: `${metrics.demographics.pwdAttendanceRate}% attendance rate`,
          description: "Participants with disabilities attendance",
        }}
        icon={<UserX className="size-4" />}
      />

      <MetricCard
        title="Female PWDs"
        value={metrics.demographics.femalePWDs.toLocaleString()}
        footer={{
          title: "Female PWDs",
          description: `${Math.round((metrics.demographics.femalePWDs / metrics.demographics.pwds) * 100)}% of PWDs`,
        }}
        icon={<Heart className="size-4" />}
      />

      <MetricCard
        title="Male PWDs"
        value={metrics.demographics.malePWDs.toLocaleString()}
        footer={{
          title: "Male PWDs",
          description: `${Math.round((metrics.demographics.malePWDs / metrics.demographics.pwds) * 100)}% of PWDs`,
        }}
        icon={<UserCheck className="size-4" />}
      />
    </div>
  );
}
