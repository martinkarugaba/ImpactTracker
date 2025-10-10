import { MetricCard } from "@/components/ui/metric-card";
import {
  IconBuildings,
  IconUsers,
  IconTrendingUp,
  IconCurrencyDollar,
  IconCheck,
  IconClock,
  IconMapPin,
  IconPercentage,
} from "@tabler/icons-react";
import { formatCurrency } from "../../utils";
import type { VSLA } from "../../types";

interface VSLAMetricsCardsProps {
  vslas: VSLA[];
  isLoading?: boolean;
}

export function VSLAMetricsCards({ vslas, isLoading }: VSLAMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="..."
            footer={{
              title: "Loading...",
              description: "Fetching data...",
            }}
            icon={<IconBuildings className="size-4" />}
          />
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalVSLAs = vslas.length;
  const activeVSLAs = vslas.filter(v => v.status === "active").length;
  const completedVSLAs = vslas.filter(v => v.status === "completed").length;
  const totalMembers = vslas.reduce(
    (sum, v) => sum + (v.total_members || 0),
    0
  );
  const totalSavings = vslas.reduce(
    (sum, v) => sum + (v.total_savings || 0),
    0
  );
  const totalLoans = vslas.reduce((sum, v) => sum + (v.total_loans || 0), 0);

  // Get unique organizations and clusters
  const uniqueOrganizations = new Set(
    vslas.map(v => v.organization_id).filter(Boolean)
  ).size;
  const uniqueClusters = new Set(vslas.map(v => v.cluster_id).filter(Boolean))
    .size;

  // Calculate average members per VSLA
  const avgMembersPerVSLA =
    totalVSLAs > 0 ? Math.round(totalMembers / totalVSLAs) : 0;

  // Calculate completion rate
  const completionRate =
    totalVSLAs > 0 ? ((completedVSLAs / totalVSLAs) * 100).toFixed(1) : "0";

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total VSLAs"
        value={totalVSLAs}
        footer={{
          title: `${activeVSLAs} active, ${completedVSLAs} completed`,
          description: "All registered VSLAs",
        }}
        icon={<IconBuildings className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Active VSLAs"
        value={activeVSLAs}
        footer={{
          title: `${((activeVSLAs / totalVSLAs) * 100).toFixed(1)}% of total`,
          description: "Currently operational",
        }}
        icon={<IconCheck className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Total Members"
        value={totalMembers}
        footer={{
          title: `Average ${avgMembersPerVSLA} per VSLA`,
          description: "Across all VSLAs",
        }}
        icon={<IconUsers className="size-4 text-purple-600" />}
      />

      <MetricCard
        title="Total Savings"
        value={formatCurrency(totalSavings)}
        footer={{
          title: `${formatCurrency(totalSavings / totalVSLAs || 0)} per VSLA`,
          description: "Accumulated savings",
        }}
        icon={<IconTrendingUp className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Total Loans"
        value={formatCurrency(totalLoans)}
        footer={{
          title: `${formatCurrency(totalLoans / totalVSLAs || 0)} per VSLA`,
          description: "Outstanding loans",
        }}
        icon={<IconCurrencyDollar className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Completion Rate"
        value={`${completionRate}%`}
        footer={{
          title: `${completedVSLAs} completed VSLAs`,
          description: "Success rate",
        }}
        icon={<IconPercentage className="size-4 text-orange-600" />}
      />

      <MetricCard
        title="Organizations"
        value={uniqueOrganizations}
        footer={{
          title: "Implementing partners",
          description: "Organizational reach",
        }}
        icon={<IconMapPin className="size-4 text-indigo-600" />}
      />

      <MetricCard
        title="Clusters"
        value={uniqueClusters}
        footer={{
          title: "Geographic clusters",
          description: "Coverage areas",
        }}
        icon={<IconClock className="size-4 text-teal-600" />}
      />
    </div>
  );
}
