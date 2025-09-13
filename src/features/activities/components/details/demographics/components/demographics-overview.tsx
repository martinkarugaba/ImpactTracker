import { MetricCard } from "@/components/ui/metric-card";
import { Users, MapPin, BarChart3, UserCheck } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function DemographicsOverview({ data }: DemographicsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <div className="bg-chart-1/10 rounded-lg p-2">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Demographics Overview
          </h3>
          <p className="text-muted-foreground text-sm">
            Key participant statistics and breakdowns
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Participants"
          value={data.totalParticipants}
          footer={{
            title: data.trainingType,
            description: "Activity participants",
          }}
          icon={<Users className="size-4" />}
        />

        <MetricCard
          title="Urban Setting"
          value={data.participantsUrban}
          footer={{
            title: "Rural Setting",
            description: `${data.participantsRural} participants`,
          }}
          icon={<MapPin className="size-4" />}
        />

        <MetricCard
          title="Youth (15-35)"
          value={data.participants15to35}
          footer={{
            title: "Above 35 years",
            description: `${data.participantsAbove35} participants`,
          }}
          icon={<BarChart3 className="size-4" />}
        />

        <MetricCard
          title="Persons with Disability"
          value={data.participantsWithDisability}
          footer={{
            title: `Female: ${data.femalePWDs} | Male: ${data.malePWDs}`,
            description: "PWD representation",
          }}
          icon={<UserCheck className="size-4" />}
        />
      </div>
    </div>
  );
}
