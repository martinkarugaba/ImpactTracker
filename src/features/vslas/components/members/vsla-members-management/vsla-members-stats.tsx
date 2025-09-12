import { MetricCard } from "@/components/ui/metric-card";
import {
  IconUsers,
  IconUserCheck,
  IconCrown,
  IconTrendingUp,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { VSLAMember } from "../../../actions/vsla-members";
import { formatCurrency } from "@/lib/utils";

interface VSLAMembersStatsProps {
  members: VSLAMember[];
}

export function VSLAMembersStats({ members }: VSLAMembersStatsProps) {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === "active").length;
  const inactiveMembers = members.filter(m => m.status === "inactive").length;
  const leadershipRoles = members.filter(m =>
    ["chairperson", "secretary", "treasurer"].includes(m.role)
  ).length;

  const totalSavings = members.reduce(
    (sum, m) => sum + (m.total_savings || 0),
    0
  );
  const totalLoans = members.reduce((sum, m) => sum + (m.total_loans || 0), 0);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        title="Total Members"
        value={totalMembers}
        footer={{
          title: `${activeMembers} active, ${inactiveMembers} inactive`,
          description: "Current membership status",
        }}
        icon={<IconUsers className="size-4 text-blue-600" />}
      />

      <MetricCard
        title="Active Members"
        value={activeMembers}
        footer={{
          title: `${((activeMembers / totalMembers) * 100 || 0).toFixed(1)}% of total`,
          description: "Participation rate",
        }}
        icon={<IconUserCheck className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Leadership Roles"
        value={leadershipRoles}
        footer={{
          title: "Key positions filled",
          description: "Chairperson, Secretary, Treasurer",
        }}
        icon={<IconCrown className="size-4 text-purple-600" />}
      />

      <MetricCard
        title="Total Savings"
        value={formatCurrency(totalSavings)}
        footer={{
          title: `Average: ${formatCurrency(totalSavings / totalMembers || 0)}`,
          description: "Member contributions",
        }}
        icon={<IconTrendingUp className="size-4 text-green-600" />}
      />

      <MetricCard
        title="Total Loans"
        value={formatCurrency(totalLoans)}
        footer={{
          title: `Average: ${formatCurrency(totalLoans / totalMembers || 0)}`,
          description: "Outstanding amounts",
        }}
        icon={<IconCurrencyDollar className="size-4 text-blue-600" />}
      />
    </div>
  );
}
