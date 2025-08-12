import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { MetricCard } from "@/components/ui/metric-card";
import {
  IconUsers,
  IconUserCheck,
  IconUser,
  IconGauge,
  IconTrendingUp,
  IconMapPin,
  IconCalendar,
  IconActivity,
} from "@tabler/icons-react";

interface CompactParticipantMetricsProps {
  participants: Participant[];
  isLoading: boolean;
}

export function CompactParticipantMetrics({
  participants,
  isLoading,
}: CompactParticipantMetricsProps) {
  // Get all metrics using the hook
  const metrics = useParticipantMetrics(participants);

  const {
    totalParticipants,
    totalFemales,
    totalMales,
    femalePercent,
    malePercent,
    disabled,
    disabledPercent,
    formatPercent,
  } = metrics;

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="--"
            footer={{
              title: "Loading...",
              description: "Fetching data...",
            }}
            icon={<IconUsers className="size-4" />}
          />
        ))}
      </div>
    );
  }

  // Calculate additional metrics
  const avgAge =
    participants.length > 0
      ? Math.round(
          participants.reduce((sum, p) => sum + (p.age || 0), 0) /
            participants.length
        )
      : 0;

  const youthCount = participants.filter(p => (p.age || 0) <= 35).length;
  const elderCount = participants.filter(p => (p.age || 0) >= 60).length;

  // Get unique districts
  const uniqueDistricts = new Set(
    participants.map(p => p.district).filter(Boolean)
  ).size;

  // Get unique projects
  const uniqueProjects = new Set(
    participants.map(p => p.project_id).filter(Boolean)
  ).size;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Participants"
        value={totalParticipants}
        footer={{
          title: `Across ${uniqueProjects} projects`,
          description: "Active participant count",
        }}
        icon={<IconUsers className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Female Participants"
        value={totalFemales}
        footer={{
          title: `${formatPercent(femalePercent)} of total`,
          description: "Gender distribution",
        }}
        icon={<IconUserCheck className="size-4 text-pink-600" />}
      />

      <MetricCard
        title="Male Participants"
        value={totalMales}
        footer={{
          title: `${formatPercent(malePercent)} of total`,
          description: "Gender distribution",
        }}
        icon={<IconUser className="size-4 text-blue-500" />}
      />

      <MetricCard
        title="PWD Participants"
        value={disabled.length}
        footer={{
          title: `${formatPercent(disabledPercent)} of total`,
          description: "Persons with disabilities",
        }}
        icon={<IconGauge className="size-4 text-purple-600" />}
      />

      <MetricCard
        title="Youth (≤35)"
        value={youthCount}
        footer={{
          title: `${((youthCount / totalParticipants) * 100).toFixed(1)}% youth`,
          description: "Young participants",
        }}
        icon={<IconTrendingUp className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Elders (≥60)"
        value={elderCount}
        footer={{
          title: `${((elderCount / totalParticipants) * 100).toFixed(1)}% elders`,
          description: "Senior participants",
        }}
        icon={<IconActivity className="size-4 text-orange-600" />}
      />

      <MetricCard
        title="Districts Covered"
        value={uniqueDistricts}
        footer={{
          title: "Geographic reach",
          description: "Coverage area",
        }}
        icon={<IconMapPin className="size-4 text-indigo-600" />}
      />

      <MetricCard
        title="Average Age"
        value={`${avgAge} years`}
        footer={{
          title: "Participant average",
          description: "Age demographics",
        }}
        icon={<IconCalendar className="size-4 text-teal-600" />}
      />
    </div>
  );
}
