import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPITrendChartProps {
  data: Array<{
    month: string;
    participants: number;
    activities: number;
    vslas: number;
    conceptNotes: number;
  }>;
}

export function KPITrendChart({ data }: KPITrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Trends (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="participants"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Participants"
              />
              <Line
                type="monotone"
                dataKey="activities"
                stroke="#10b981"
                strokeWidth={2}
                name="Activities"
              />
              <Line
                type="monotone"
                dataKey="vslas"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="VSLAs"
              />
              <Line
                type="monotone"
                dataKey="conceptNotes"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Concept Notes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface ParticipantsGenderChartProps {
  data: {
    males: number;
    females: number;
  };
}

export function ParticipantsGenderChart({
  data,
}: ParticipantsGenderChartProps) {
  const chartData = [
    { name: "Males", value: data.males, color: "#3b82f6" },
    { name: "Females", value: data.females, color: "#ec4899" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants by Gender</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivitiesStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

export function ActivitiesStatusChart({ data }: ActivitiesStatusChartProps) {
  const statusColors: Record<string, string> = {
    completed: "#10b981",
    ongoing: "#3b82f6",
    planned: "#f59e0b",
    cancelled: "#ef4444",
  };

  const chartData = data.map(item => ({
    ...item,
    color: statusColors[item.status] || "#6b7280",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface DistrictPerformanceChartProps {
  participantsData: Array<{ district: string; count: number }>;
  vslasData: Array<{
    district: string;
    count: number;
    totalSavings: number;
  }>;
}

export function DistrictPerformanceChart({
  participantsData,
  vslasData,
}: DistrictPerformanceChartProps) {
  // Combine data by district
  const combinedData = participantsData.map(participantData => {
    const vslaData = vslasData.find(
      v => v.district === participantData.district
    );
    return {
      district: participantData.district,
      participants: participantData.count,
      vslas: vslaData?.count || 0,
      savings: vslaData?.totalSavings || 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by District</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="participants" fill="#3b82f6" name="Participants" />
              <Bar dataKey="vslas" fill="#8b5cf6" name="VSLAs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface ParticipantsAgeChartProps {
  data: Array<{ ageGroup: string; count: number }>;
}

export function ParticipantsAgeChart({ data }: ParticipantsAgeChartProps) {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants by Age Group</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="ageGroup"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
