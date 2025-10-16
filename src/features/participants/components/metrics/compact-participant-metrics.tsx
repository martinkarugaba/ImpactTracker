import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { MetricCard } from "@/components/ui/metric-card";
import {
  IconUsers,
  IconUserCheck,
  IconUser,
  IconGauge,
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
    total15to35,
    totalOver35,
    femalesYoung,
    femalesOlder,
    malesYoung,
    malesOlder,
    disabled,
    disabledMales,
    disabledFemales,
    totalDisabled15to35,
    totalDisabledOver35,
    formatPercent,
  } = metrics;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {Array.from({ length: 14 }).map((_, i) => (
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

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Participants */}
      <MetricCard
        title="Total Participants"
        value={totalParticipants}
        footer={{
          title: "All participants",
          description: "Total count",
        }}
        icon={<IconUsers className="size-4 text-blue-600" />}
      />

      {/* Total Female */}
      <MetricCard
        title="Total Female"
        value={totalFemales}
        footer={{
          title: `${formatPercent(femalePercent)}% of total`,
          description: "Female participants",
        }}
        icon={<IconUserCheck className="size-4 text-pink-600" />}
      />

      {/* Total Male */}
      <MetricCard
        title="Total Male"
        value={totalMales}
        footer={{
          title: `${formatPercent(malePercent)}% of total`,
          description: "Male participants",
        }}
        icon={<IconUser className="size-4 text-blue-500" />}
      />

      {/* 15-35 Age Group */}
      <MetricCard
        title="15-35 Years"
        value={total15to35}
        footer={{
          title: `${((total15to35 / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Young adults",
        }}
        icon={<IconCalendar className="size-4 text-green-600" />}
      />

      {/* >35 Age Group */}
      <MetricCard
        title="> 35 Years"
        value={totalOver35}
        footer={{
          title: `${((totalOver35 / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Older adults",
        }}
        icon={<IconActivity className="size-4 text-orange-600" />}
      />

      {/* Female 15-35 */}
      <MetricCard
        title="Female 15-35"
        value={femalesYoung.length}
        footer={{
          title: `${((femalesYoung.length / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Young women",
        }}
        icon={<IconUserCheck className="size-4 text-pink-500" />}
      />

      {/* Female >35 */}
      <MetricCard
        title="Female > 35"
        value={femalesOlder.length}
        footer={{
          title: `${((femalesOlder.length / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Older women",
        }}
        icon={<IconUserCheck className="size-4 text-pink-700" />}
      />

      {/* Male 15-35 */}
      <MetricCard
        title="Male 15-35"
        value={malesYoung.length}
        footer={{
          title: `${((malesYoung.length / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Young men",
        }}
        icon={<IconUser className="size-4 text-blue-400" />}
      />

      {/* Male >35 */}
      <MetricCard
        title="Male > 35"
        value={malesOlder.length}
        footer={{
          title: `${((malesOlder.length / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Older men",
        }}
        icon={<IconUser className="size-4 text-blue-700" />}
      />

      {/* PWDs Total */}
      <MetricCard
        title="PWDs"
        value={disabled.length}
        footer={{
          title: `${((disabled.length / totalParticipants) * 100).toFixed(1)}% of total`,
          description: "Persons with disabilities",
        }}
        icon={<IconGauge className="size-4 text-purple-600" />}
      />

      {/* PWDs Female */}
      <MetricCard
        title="PWDs Female"
        value={disabledFemales.length}
        footer={{
          title: `${disabled.length > 0 ? ((disabledFemales.length / disabled.length) * 100).toFixed(1) : 0}% of PWDs`,
          description: "Female PWDs",
        }}
        icon={<IconUserCheck className="size-4 text-purple-500" />}
      />

      {/* PWDs Male */}
      <MetricCard
        title="PWDs Male"
        value={disabledMales.length}
        footer={{
          title: `${disabled.length > 0 ? ((disabledMales.length / disabled.length) * 100).toFixed(1) : 0}% of PWDs`,
          description: "Male PWDs",
        }}
        icon={<IconUser className="size-4 text-purple-400" />}
      />

      {/* PWDs 15-35 */}
      <MetricCard
        title="PWDs 15-35"
        value={totalDisabled15to35}
        footer={{
          title: `${disabled.length > 0 ? ((totalDisabled15to35 / disabled.length) * 100).toFixed(1) : 0}% of PWDs`,
          description: "Young PWDs",
        }}
        icon={<IconCalendar className="size-4 text-purple-500" />}
      />

      {/* PWDs > 35 */}
      <MetricCard
        title="PWDs > 35"
        value={totalDisabledOver35}
        footer={{
          title: `${disabled.length > 0 ? ((totalDisabledOver35 / disabled.length) * 100).toFixed(1) : 0}% of PWDs`,
          description: "Older PWDs",
        }}
        icon={<IconActivity className="size-4 text-purple-700" />}
      />
    </div>
  );
}
