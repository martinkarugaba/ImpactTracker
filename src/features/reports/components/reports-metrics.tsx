"use client";

import { MetricCard } from "@/components/ui/metric-card";
import {
  IconFileText,
  IconUsers,
  IconCurrencyDollar,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { type ReportsMetrics } from "../actions/reports";

interface ReportsMetricsProps {
  metrics: ReportsMetrics;
  isLoading?: boolean;
}

export function ReportsMetrics({ metrics, isLoading }: ReportsMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const monthlyTrend = calculateTrend(
    metrics.thisMonthReports,
    metrics.lastMonthReports
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
      {/* Total Reports */}
      <MetricCard
        title="Total Reports"
        value={metrics.totalReports.toLocaleString()}
        footer={{
          title: "All activity reports",
          description: "Submitted and reviewed",
        }}
        icon={<IconFileText className="size-4 text-blue-600" />}
      />

      {/* Total Participants */}
      <MetricCard
        title="Total Participants"
        value={metrics.totalParticipants.toLocaleString()}
        footer={{
          title: "Across all activities",
          description: "People reached through reports",
        }}
        icon={<IconUsers className="size-4 text-green-600" />}
      />

      {/* Total Cost */}
      <MetricCard
        title="Total Cost"
        value={formatCurrency(metrics.totalCost)}
        footer={{
          title: "Actual expenditure",
          description: "From activity reports",
        }}
        icon={<IconCurrencyDollar className="size-4 text-purple-600" />}
      />

      {/* Monthly Reports */}
      <MetricCard
        title="This Month"
        value={metrics.thisMonthReports.toLocaleString()}
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
          description: `${metrics.lastMonthReports} reports last month`,
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
