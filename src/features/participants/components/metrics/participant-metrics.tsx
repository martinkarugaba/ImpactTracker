import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { TotalMetric } from "./components/total-metric";
import { GenderMetrics } from "./components/gender-metrics";
import { AgeMetrics } from "./components/age-metrics";
import { DisabilityMetrics } from "./components/disability-metrics";
import { Switch } from "@/components/ui/switch";

interface ParticipantMetricsProps {
  participants: Participant[];
  isLoading: boolean;
  isFiltered?: boolean;
  onToggleFiltered?: () => void;
}

export function ParticipantMetrics({
  participants,
  isLoading,
  isFiltered = false,
  onToggleFiltered,
}: ParticipantMetricsProps) {
  // Get all metrics using the hook
  const metrics = useParticipantMetrics(participants);

  const {
    totalParticipants,
    totalFemales,
    totalMales,
    femalePercent,
    malePercent,
    femalesYoung,
    femalesOlder,
    malesYoung,
    malesOlder,
    youngFemalePercent,
    olderFemalePercent,
    youngMalePercent,
    olderMalePercent,
    disabled,
    disabledMales,
    disabledFemales,
    disabledPercent,
    disabledMalePercent,
    disabledFemalePercent,
    formatPercent,
    formatTrendPercent,
  } = metrics;

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Participant Overview</h3>
        {onToggleFiltered && (
          <div className="flex items-center gap-2">
            <label
              className="text-sm text-muted-foreground"
              htmlFor="filter-toggle"
            >
              Apply filters to metrics
            </label>
            <Switch
              id="filter-toggle"
              checked={isFiltered}
              onCheckedChange={onToggleFiltered}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-0 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {/* Total Metrics */}
        <TotalMetric
          totalParticipants={totalParticipants}
          isLoading={isLoading}
        />

        {/* Gender Metrics */}
        <GenderMetrics
          totalFemales={totalFemales}
          totalMales={totalMales}
          femalePercent={femalePercent}
          malePercent={malePercent}
          formatPercent={formatPercent}
          formatTrendPercent={formatTrendPercent}
          isLoading={isLoading}
        />

        {/* Age Metrics */}
        <AgeMetrics
          femalesYoung={femalesYoung}
          femalesOlder={femalesOlder}
          malesYoung={malesYoung}
          malesOlder={malesOlder}
          youngFemalePercent={youngFemalePercent}
          olderFemalePercent={olderFemalePercent}
          youngMalePercent={youngMalePercent}
          olderMalePercent={olderMalePercent}
          formatPercent={formatPercent}
          formatTrendPercent={formatTrendPercent}
          isLoading={isLoading}
        />

        {/* Disability Metrics */}
        <DisabilityMetrics
          disabled={disabled}
          disabledMales={disabledMales}
          disabledFemales={disabledFemales}
          disabledPercent={disabledPercent}
          disabledMalePercent={disabledMalePercent}
          disabledFemalePercent={disabledFemalePercent}
          formatPercent={formatPercent}
          formatTrendPercent={formatTrendPercent}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
