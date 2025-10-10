"use client";

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
  Building,
  Users,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { VSLA } from "../../types";

interface TargetsTabProps {
  vslas: VSLA[];
  isLoading: boolean;
}

export function TargetsTab({ vslas = [], isLoading }: TargetsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 pt-6">
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
      </div>
    );
  }

  const total = vslas.length;
  const target = 300; // Target VSLAs
  const totalMembers = vslas.reduce(
    (sum, v) => sum + (v.total_members || 0),
    0
  );
  const membersTarget = 6000; // Target members

  const totalSavings = vslas.reduce(
    (sum, v) => sum + (v.total_savings || 0),
    0
  );
  const savingsTarget = 500000000; // Target 500M UGX

  const activeVSLAs = vslas.filter(
    v => v.status?.toLowerCase() === "active"
  ).length;
  const activePercentage = total > 0 ? (activeVSLAs / total) * 100 : 0;
  const activeTarget = 90; // Target 90% active

  const vslasPercentage = (total / target) * 100;
  const membersPercentage = (totalMembers / membersTarget) * 100;
  const savingsPercentage = (totalSavings / savingsTarget) * 100;

  // Chart configs with custom colors
  const vslasConfig = {
    vslas: { label: "VSLAs" },
    total: { label: "Total", color: "#3b82f6" }, // blue-500
  } satisfies ChartConfig;

  const membersConfig = {
    members: { label: "Members" },
    total: { label: "Total", color: "#ec4899" }, // pink-500
  } satisfies ChartConfig;

  const savingsConfig = {
    savings: { label: "Savings" },
    total: { label: "Total", color: "#10b981" }, // emerald-500
  } satisfies ChartConfig;

  const activeConfig = {
    percentage: { label: "Percentage" },
    active: { label: "Active", color: "#f59e0b" }, // amber-500
  } satisfies ChartConfig;

  const vslasData = [
    {
      metric: "total",
      value: total,
      fill: "var(--color-total)",
    },
  ];

  const membersData = [
    {
      metric: "total",
      value: totalMembers,
      fill: "var(--color-total)",
    },
  ];

  const savingsData = [
    {
      metric: "total",
      value: totalSavings,
      fill: "var(--color-total)",
    },
  ];

  const activeData = [
    {
      metric: "active",
      value: activePercentage,
      fill: "var(--color-active)",
    },
  ];

  return (
    <div className="space-y-4 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total VSLAs */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Building className="text-muted-foreground h-5 w-5" />
              Total VSLAs
            </CardTitle>
            <CardDescription>Target: {target.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={vslasConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={vslasData}
                endAngle={(vslasPercentage / 100) * 360}
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
                              VSLAs
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
              {vslasPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              {(target - total).toLocaleString()} more to reach target
            </div>
          </CardFooter>
        </Card>

        {/* Total Members */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="text-muted-foreground h-5 w-5" />
              Total Members
            </CardTitle>
            <CardDescription>
              Target: {membersTarget.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={membersConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={membersData}
                endAngle={(membersPercentage / 100) * 360}
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
                              {totalMembers.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Members
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
              {membersPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              {(membersTarget - totalMembers).toLocaleString()} more to reach
              target
            </div>
          </CardFooter>
        </Card>

        {/* Total Savings */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="text-muted-foreground h-5 w-5" />
              Total Savings
            </CardTitle>
            <CardDescription>
              Target: {(savingsTarget / 1000000).toFixed(0)}M UGX
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={savingsConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={savingsData}
                endAngle={(savingsPercentage / 100) * 360}
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
                              {(totalSavings / 1000000).toFixed(1)}M
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              UGX Saved
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
              {savingsPercentage.toFixed(1)}% of target{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              {((savingsTarget - totalSavings) / 1000000).toFixed(1)}M more to
              reach target
            </div>
          </CardFooter>
        </Card>

        {/* Active VSLAs Percentage */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="text-muted-foreground h-5 w-5" />
              Active %
            </CardTitle>
            <CardDescription>Target: {activeTarget}%</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={activeConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={activeData}
                endAngle={(activePercentage / activeTarget) * 360}
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
                              {activePercentage.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Active
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
              {activeVSLAs.toLocaleString()} active VSLAs{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              {activePercentage >= activeTarget
                ? "Target achieved!"
                : `${(activeTarget - activePercentage).toFixed(1)}% to reach target`}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
