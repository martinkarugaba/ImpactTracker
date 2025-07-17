import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { CompactMetricCard } from "@/components/ui/compact-metric-card";
import { Users, UserCheck, CircleUser, Gauge } from "lucide-react";

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

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <CompactMetricCard
        title="Total Participants"
        value={totalParticipants}
        isLoading={isLoading}
        icon={<Users size={16} />}
        iconColor="text-primary"
      />

      <CompactMetricCard
        title="Female"
        count={totalFemales}
        percent={formatPercent(femalePercent)}
        isLoading={isLoading}
        icon={<UserCheck size={16} />}
        iconColor="text-pink-500"
      />

      <CompactMetricCard
        title="Male"
        count={totalMales}
        percent={formatPercent(malePercent)}
        isLoading={isLoading}
        icon={<CircleUser size={16} />}
        iconColor="text-blue-500"
      />

      <CompactMetricCard
        title="PWD"
        count={disabled.length}
        percent={formatPercent(disabledPercent)}
        isLoading={isLoading}
        icon={<Gauge size={16} />}
        iconColor="text-purple-500"
      />
    </div>
  );
}
