"use client";

import { MetricCard } from "@/components/ui/metric-card";
import {
  IconFileText,
  IconClock,
  IconCheck,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { type ConceptNotesMetrics } from "../actions/concept-notes";

interface ConceptNotesMetricsProps {
  metrics: ConceptNotesMetrics;
  isLoading?: boolean;
}

export function ConceptNotesMetrics({
  metrics,
  isLoading,
}: ConceptNotesMetricsProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const monthlyTrend = calculateTrend(
    metrics.thisMonth,
    metrics.thisMonth - metrics.trends.monthlyChange
  );

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="--"
            footer={{
              title: "Loading...",
              description: "Fetching data...",
            }}
            icon={<IconFileText className="size-4" />}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
      {/* Total Concept Notes */}
      <MetricCard
        title="Total Concept Notes"
        value={metrics.totalConceptNotes.toLocaleString()}
        footer={{
          title: "All concept notes",
          description: "Submitted and in progress",
        }}
        icon={<IconFileText className="size-4 text-blue-600" />}
      />

      {/* Pending Review */}
      <MetricCard
        title="Pending Review"
        value={metrics.pendingReview.toLocaleString()}
        footer={{
          title: "Awaiting approval",
          description: "Under review process",
        }}
        icon={<IconClock className="size-4 text-orange-600" />}
      />

      {/* Approved */}
      <MetricCard
        title="Approved"
        value={metrics.approved.toLocaleString()}
        footer={{
          title: "Successfully approved",
          description: "Ready for implementation",
        }}
        icon={<IconCheck className="size-4 text-green-600" />}
      />

      {/* This Month */}
      <MetricCard
        title="This Month"
        value={metrics.thisMonth.toLocaleString()}
        trend={{
          value: monthlyTrend.value,
          isPositive: monthlyTrend.isPositive,
          label: monthlyTrend.isPositive
            ? `Up ${monthlyTrend.value.toFixed(1)}% from last month`
            : `Down ${monthlyTrend.value.toFixed(1)}% from last month`,
        }}
        footer={{
          title: monthlyTrend.isPositive
            ? `Up ${monthlyTrend.value.toFixed(1)}% from last month`
            : `Down ${monthlyTrend.value.toFixed(1)}% from last month`,
          description: "Monthly concept notes",
        }}
        icon={
          monthlyTrend.isPositive ? (
            <IconTrendingUp className="size-4 text-green-500" />
          ) : (
            <IconTrendingDown className="size-4 text-red-500" />
          )
        }
      />
    </div>
  );
}
