"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { Users, Building, MapPin, Calendar } from "lucide-react";
import { type MembersMetrics } from "../actions/members";

interface MembersMetricsProps {
  metrics: MembersMetrics | null;
  isLoading: boolean;
}

export function MembersMetrics({ metrics, isLoading }: MembersMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value={0}
            icon={<Users className="h-4 w-4" />}
          />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const cards = [
    {
      title: "Total Members",
      value: metrics.totalMembers,
      change: metrics.trends.totalChange,
      icon: <Users className="h-4 w-4" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Projects",
      value: metrics.activeProjects,
      change: metrics.trends.projectsChange,
      icon: <Building className="h-4 w-4" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Districts Covered",
      value: metrics.totalDistricts,
      change: metrics.trends.districtsChange,
      icon: <MapPin className="h-4 w-4" />,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "This Month",
      value: metrics.thisMonth,
      change: metrics.trends.monthlyChange,
      icon: <Calendar className="h-4 w-4" />,
      gradient: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          trend={{
            value: Math.abs(card.change),
            isPositive: card.change >= 0,
            label: card.change >= 0 ? "increase" : "decrease",
          }}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
