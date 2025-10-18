import { MetricCard } from "@/components/ui/metric-card";
import { IconTrendingUp } from "@tabler/icons-react";
import { formatCurrency } from "../../utils";
import type { VSLA } from "../../types";

interface VSLAFinancialOverviewProps {
  vsla: VSLA;
}

export function VSLAFinancialOverview({ vsla }: VSLAFinancialOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Total Savings"
        value={formatCurrency(vsla.total_savings)}
        footer={{
          title: "Member Contributions",
          description: "Accumulated savings pool",
        }}
        icon={<IconTrendingUp className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Total Loans"
        value={formatCurrency(vsla.total_loans)}
        footer={{
          title: "Outstanding Amounts",
          description: "Active loan portfolio",
        }}
        icon={<IconTrendingUp className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Net Difference"
        value={formatCurrency(vsla.total_savings - vsla.total_loans)}
        footer={{
          title: "Savings minus Loans",
          description: "Available liquidity",
        }}
        icon={<IconTrendingUp className="size-4 text-purple-600" />}
      />
    </div>
  );
}
