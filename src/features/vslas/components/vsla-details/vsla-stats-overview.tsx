import { MetricCard } from "@/components/ui/metric-card";
import { IconTrendingUp, IconUsers } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";
import type { VSLA } from "../../types";

interface VSLAStatsOverviewProps {
  vsla: VSLA;
}

export function VSLAStatsOverview({ vsla }: VSLAStatsOverviewProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Total Members"
        value={vsla.total_members}
        footer={{
          title: "Active Members",
          description: "Current VSLA membership count",
        }}
        icon={<IconUsers className="size-4" />}
      />

      <MetricCard
        title="Total Savings"
        value={formatCurrency(vsla.total_savings)}
        footer={{
          title: "Member Savings",
          description: "Accumulated savings pool",
        }}
        icon={<IconTrendingUp className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Total Loans"
        value={formatCurrency(vsla.total_loans)}
        footer={{
          title: "Outstanding Loans",
          description: "Active loan portfolio",
        }}
        icon={<IconTrendingUp className="size-4 text-blue-600" />}
      />
    </div>
  );
}
