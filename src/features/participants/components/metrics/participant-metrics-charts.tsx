import * as React from "react";
import { type Participant } from "../../types/types";
import { useParticipantMetrics } from "./hooks/use-participant-metrics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ParticipantMetricsChartsProps {
  participants: Participant[];
  isLoading: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      fill: string;
      total?: number;
    };
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}

// Custom tooltip component for bar charts with percentages
const BarTooltipContent = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry) => sum + entry.value, 0);

    return (
      <div className="bg-background rounded-lg border p-3 shadow-md">
        <div className="mb-2 font-medium">{label}</div>
        {payload.map((entry, index: number) => {
          const percentage =
            total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="mb-1 flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey}: {entry.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ParticipantMetricsCharts({
  participants,
  isLoading,
}: ParticipantMetricsChartsProps) {
  const metrics = useParticipantMetrics(participants);

  // VSLA Membership Data
  const vslaMembers = participants.filter(p => p.isSubscribedToVSLA === "yes");
  const nonVslaMembers = participants.length - vslaMembers.length;
  const vslaData = [
    {
      name: "VSLA Member",
      value: vslaMembers.length,
      fill: "#10b981", // emerald-500
      total: participants.length,
    },
    {
      name: "Non-Member",
      value: nonVslaMembers,
      fill: "#f59e42", // orange-400
      total: participants.length,
    },
  ];

  const {
    totalFemales,
    totalMales,
    femalesYoung,
    femalesOlder,
    malesYoung,
    malesOlder,
    disabled,
    disabledFemales,
    disabledMales,
    totalDisabled15to35,
    totalDisabledOver35,
  } = metrics;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Fetching chart data...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-[300px] animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Gender Distribution Data
  const genderData = [
    {
      name: "Female",
      value: totalFemales,
      fill: "#ec4899", // pink-500
      total: participants.length,
    },
    {
      name: "Male",
      value: totalMales,
      fill: "#3b82f6", // blue-500
      total: participants.length,
    },
  ];

  // Age Group by Gender Data
  const ageGenderData = [
    {
      name: "15-35",
      Female: femalesYoung.length,
      Male: malesYoung.length,
    },
    {
      name: "> 35",
      Female: femalesOlder.length,
      Male: malesOlder.length,
    },
  ];

  // PWD Distribution Data
  const pwdData = [
    {
      name: "Non-PWD",
      value: participants.length - disabled.length,
      fill: "#64748b", // slate-500
      total: participants.length,
    },
    {
      name: "PWD",
      value: disabled.length,
      fill: "#8b5cf6", // purple-500
      total: participants.length,
    },
  ];

  // PWD Breakdown Data
  const pwdBreakdownData = [
    {
      name: "Female PWD",
      value: disabledFemales.length,
      fill: "#a855f7", // purple-500
    },
    {
      name: "Male PWD",
      value: disabledMales.length,
      fill: "#7c3aed", // purple-600
    },
    {
      name: "PWD 15-35",
      value: totalDisabled15to35,
      fill: "#6366f1", // indigo-500
    },
    {
      name: "PWD > 35",
      value: totalDisabledOver35,
      fill: "#4f46e5", // indigo-600
    },
  ];

  const genderChartConfig = {
    Female: {
      label: "Female",
      color: "#ec4899",
    },
    Male: {
      label: "Male",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  const ageChartConfig = {
    Female: {
      label: "Female",
      color: "#ec4899",
    },
    Male: {
      label: "Male",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* First Row - Pie Charts (1 column each) and Bar Chart (2 columns) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Gender Distribution Chart - Pie Chart (1 column) */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader className="items-center pb-0">
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>
              Breakdown of participants by gender
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={genderChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {participants.length.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* PWD vs Non-PWD Chart - Pie Chart (1 column) */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader className="items-center pb-0">
            <CardTitle>Disability Status</CardTitle>
            <CardDescription>
              Distribution of participants with disabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={genderChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pwdData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {pwdData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {disabled.length.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              PWD
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Age Groups by Gender Chart - Bar Chart (2 columns) */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle>Age Groups by Gender</CardTitle>
            <CardDescription>
              Age distribution across gender groups
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer
              config={ageChartConfig}
              className="h-[280px] w-full"
            >
              <BarChart data={ageGenderData} width={500} height={280}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<BarTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="Female"
                  fill="#ec4899"
                  radius={8}
                  strokeWidth={2}
                />
                <Bar dataKey="Male" fill="#3b82f6" radius={8} strokeWidth={2} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - PWD Breakdown (Bar Chart - 2 columns) and VSLA Membership (Pie Chart - 1 column) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* PWD Breakdown Chart - Bar Chart (2 columns) */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle>PWD Demographics</CardTitle>
            <CardDescription>
              Detailed breakdown of participants with disabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer
              config={genderChartConfig}
              className="h-[280px] w-full"
            >
              <BarChart data={pwdBreakdownData} width={500} height={280}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<BarTooltipContent />} />
                <Bar dataKey="value" radius={8} strokeWidth={2}>
                  {pwdBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* VSLA Membership Chart - Pie Chart (1 column) */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader className="items-center pb-0">
            <CardTitle>VSLA Membership</CardTitle>
            <CardDescription>
              Distribution of participants by VSLA membership
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={genderChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={vslaData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {vslaData.map((entry, index) => (
                    <Cell key={`cell-vsla-${index}`} fill={entry.fill} />
                  ))}
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {vslaMembers.length.toLocaleString()}
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
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
