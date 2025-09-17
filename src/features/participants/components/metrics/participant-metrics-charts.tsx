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
    },
    {
      name: "Non-Member",
      value: nonVslaMembers,
      fill: "#f59e42", // orange-400
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
    },
    {
      name: "Male",
      value: totalMales,
      fill: "#3b82f6", // blue-500
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
    },
    {
      name: "PWD",
      value: disabled.length,
      fill: "#8b5cf6", // purple-500
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
      {/* First Row - Gender, Age Groups, and Disability Status */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Gender Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>
              Breakdown of participants by gender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={genderChartConfig}
              className="aspect-square max-h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={"30%"}
                  outerRadius={"80%"}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Age Groups by Gender Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Age Groups by Gender</CardTitle>
            <CardDescription>
              Age distribution across gender groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={ageChartConfig}
              className="aspect-square max-h-[280px]"
            >
              <BarChart data={ageGenderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Female" fill="#ec4899" />
                <Bar dataKey="Male" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* PWD vs Non-PWD Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Disability Status</CardTitle>
            <CardDescription>
              Distribution of participants with disabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={genderChartConfig}
              className="aspect-square max-h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pwdData}
                  cx="50%"
                  cy="50%"
                  innerRadius={"30%"}
                  outerRadius={"80%"}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pwdData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - PWD Breakdown and VSLA Membership */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* PWD Breakdown Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>PWD Demographics</CardTitle>
            <CardDescription>
              Detailed breakdown of participants with disabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={genderChartConfig} className="h-[280px]">
              <BarChart data={pwdBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* VSLA Membership Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>VSLA Membership</CardTitle>
            <CardDescription>
              Distribution of participants by VSLA membership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={genderChartConfig}
              className="aspect-square max-h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={vslaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={"30%"}
                  outerRadius={"80%"}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vslaData.map((entry, index) => (
                    <Cell key={`cell-vsla-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
