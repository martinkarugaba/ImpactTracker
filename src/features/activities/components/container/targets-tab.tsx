"use client";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  Users,
  GraduationCap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "../../types/types";

interface TargetsTabProps {
  metricsActivities: Activity[];
  isMetricsLoading: boolean;
}

export function TargetsTab({
  metricsActivities = [],
  isMetricsLoading,
}: TargetsTabProps) {
  if (isMetricsLoading) {
    return (
      <TabsContent value="targets" className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mx-auto h-[250px] w-[250px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    );
  }

  const total = metricsActivities.length;
  const target = 500; // Target activities
  const completedCount = metricsActivities.filter(
    a => a.status?.toLowerCase() === "completed"
  ).length;
  const completionPercentage = total > 0 ? (completedCount / total) * 100 : 0;
  const completionTarget = 85; // Target 85% completion

  const totalParticipants = metricsActivities.reduce(
    (sum, a) => sum + (a.participantCount || 0),
    0
  );
  const participantsTarget = 5000; // Target participants
  const participantsPercentage = (totalParticipants / participantsTarget) * 100;

  const trainingActivities = metricsActivities.filter(
    a => a.type?.toLowerCase() === "training"
  ).length;
  const trainingTarget = 200; // Target training sessions
  const trainingPercentage = (trainingActivities / trainingTarget) * 100;

  const activitiesPercentage = (total / target) * 100;

  // Chart configs with custom colors
  const activitiesConfig = {
    activities: { label: "Activities" },
    total: { label: "Total", color: "#3b82f6" }, // blue-500
  } satisfies ChartConfig;

  const completionConfig = {
    percentage: { label: "Percentage" },
    completed: { label: "Completed", color: "#10b981" }, // emerald-500
  } satisfies ChartConfig;

  const participantsConfig = {
    participants: { label: "Participants" },
    reached: { label: "Reached", color: "#ec4899" }, // pink-500
  } satisfies ChartConfig;

  const trainingConfig = {
    training: { label: "Training" },
    sessions: { label: "Sessions", color: "#f59e0b" }, // amber-500
  } satisfies ChartConfig;

  const activitiesData = [
    {
      metric: "total",
      value: total,
      fill: "var(--color-total)",
    },
  ];

  const completionData = [
    {
      metric: "completed",
      value: completionPercentage,
      fill: "var(--color-completed)",
    },
  ];

  const participantsData = [
    {
      metric: "reached",
      value: totalParticipants,
      fill: "var(--color-reached)",
    },
  ];

  const trainingData = [
    {
      metric: "sessions",
      value: trainingActivities,
      fill: "var(--color-sessions)",
    },
  ];

  return (
    <TabsContent value="targets" className="space-y-4 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Activities */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Total Activities
            </CardTitle>
            <CardDescription>Target: {target.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={activitiesConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={activitiesData}
                endAngle={(activitiesPercentage / 100) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {total.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Activities
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {activitiesPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {(target - total).toLocaleString()} more to reach target
            </div>
          </CardFooter>
        </Card>

        {/* Completion Rate */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              Completion %
            </CardTitle>
            <CardDescription>Target: {completionTarget}%</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={completionConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={completionData}
                endAngle={(completionPercentage / completionTarget) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {completionPercentage.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Completed
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {completedCount.toLocaleString()} completed{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {completionPercentage >= completionTarget
                ? "Target achieved!"
                : `${(completionTarget - completionPercentage).toFixed(1)}% to reach target`}
            </div>
          </CardFooter>
        </Card>

        {/* Participants Reached */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Participants
            </CardTitle>
            <CardDescription>
              Target: {participantsTarget.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={participantsConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={participantsData}
                endAngle={(participantsPercentage / 100) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {totalParticipants.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Reached
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {participantsPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {(participantsTarget - totalParticipants).toLocaleString()} more
              to reach target
            </div>
          </CardFooter>
        </Card>

        {/* Training Sessions */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Training Sessions
            </CardTitle>
            <CardDescription>
              Target: {trainingTarget.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={trainingConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={trainingData}
                endAngle={(trainingPercentage / 100) * 360}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {trainingActivities.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Trainings
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trainingPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {(trainingTarget - trainingActivities).toLocaleString()} more to
              reach target
            </div>
          </CardFooter>
        </Card>
      </div>
    </TabsContent>
  );
}
