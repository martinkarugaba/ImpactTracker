import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { TrendingUp, Building, MapPin } from "lucide-react";
import { DemographicsProps } from "../types/demographics";

export function YouthEmploymentSection({ data }: DemographicsProps) {
  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400">
            Youth Employment (15-35 years)
          </span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Employment outcomes for youth participants
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Youths in Work"
            value={data.youthsInWork}
            footer={{
              title: "Employment Success",
              description: "Working youth participants",
            }}
            icon={<TrendingUp className="size-4" />}
          />

          <MetricCard
            title="Urban Setting"
            value={data.youthsInWorkUrban}
            footer={{
              title: "Urban Employment",
              description: "Working youth in cities",
            }}
            icon={<Building className="size-4" />}
          />

          <MetricCard
            title="Rural Setting"
            value={data.youthsInWorkRural}
            footer={{
              title: "Rural Employment",
              description: "Working youth in rural areas",
            }}
            icon={<MapPin className="size-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
