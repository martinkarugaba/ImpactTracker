import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  CircleUser,
  Gauge,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </CardTitle>
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-16 animate-pulse rounded" />
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate additional metrics
  const avgAge =
    participants.length > 0
      ? Math.round(
          participants.reduce((sum, p) => sum + (p.age || 0), 0) /
            participants.length
        )
      : 0;

  const youthCount = participants.filter(p => (p.age || 0) <= 35).length;
  const elderCount = participants.filter(p => (p.age || 0) >= 60).length;

  // Get unique districts
  const uniqueDistricts = new Set(
    participants.map(p => p.district).filter(Boolean)
  ).size;

  // Get unique projects
  const uniqueProjects = new Set(
    participants.map(p => p.project_id).filter(Boolean)
  ).size;

  const cards = [
    {
      title: "Total Participants",
      value: totalParticipants,
      change: `Across ${uniqueProjects} projects`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Female Participants",
      value: totalFemales,
      change: `${formatPercent(femalePercent)} of total`,
      icon: UserCheck,
      color: "text-pink-600",
    },
    {
      title: "Male Participants",
      value: totalMales,
      change: `${formatPercent(malePercent)} of total`,
      icon: CircleUser,
      color: "text-blue-500",
    },
    {
      title: "PWD Participants",
      value: disabled.length,
      change: `${formatPercent(disabledPercent)} of total`,
      icon: Gauge,
      color: "text-purple-600",
    },
    {
      title: "Youth (≤35)",
      value: youthCount,
      change: `${((youthCount / totalParticipants) * 100).toFixed(1)}% youth`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Elders (≥60)",
      value: elderCount,
      change: `${((elderCount / totalParticipants) * 100).toFixed(1)}% elders`,
      icon: Activity,
      color: "text-orange-600",
    },
    {
      title: "Districts Covered",
      value: uniqueDistricts,
      change: "Geographic reach",
      icon: MapPin,
      color: "text-indigo-600",
    },
    {
      title: "Average Age",
      value: `${avgAge} years`,
      change: "Participant average",
      icon: Calendar,
      color: "text-teal-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-muted-foreground text-xs">{card.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
