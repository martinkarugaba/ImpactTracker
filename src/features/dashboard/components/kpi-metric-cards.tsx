import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconActivity,
  IconBuilding,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";
import { KPIOverviewMetrics } from "../actions/overview";

interface KPIMetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  growth?: number;
  subtitle?: string;
  className?: string;
}

export function KPIMetricCard({
  title,
  value,
  icon,
  growth,
  subtitle,
  className = "",
}: KPIMetricCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getGrowthIcon = () => {
    if (growth === undefined) return null;
    if (growth > 0)
      return <IconTrendingUp className="h-3 w-3 text-green-600" />;
    if (growth < 0)
      return <IconTrendingDown className="h-3 w-3 text-red-600" />;
    return <IconMinus className="h-3 w-3 text-gray-400" />;
  };

  const getGrowthColor = () => {
    if (growth === undefined) return "";
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(value)}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {growth !== undefined && (
            <div className={`flex items-center space-x-1 ${getGrowthColor()}`}>
              {getGrowthIcon()}
              <span className="text-xs font-medium">{Math.abs(growth)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIParticipantsCardProps {
  data: KPIOverviewMetrics["participants"];
}

export function KPIParticipantsCard({ data }: KPIParticipantsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <IconUsers className="h-5 w-5 text-blue-600" />
          <span>Participants Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.males}</div>
            <div className="text-xs text-gray-500">Males</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {data.females}
            </div>
            <div className="text-xs text-gray-500">Females</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Top Districts</h4>
          {data.byDistrict.slice(0, 3).map(district => (
            <div
              key={district.district}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-gray-600">{district.district}</span>
              <Badge variant="secondary" className="text-xs">
                {district.count}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Recent Registrations
          </h4>
          {data.recentRegistrations.slice(0, 3).map(participant => (
            <div
              key={participant.id}
              className="truncate text-xs text-gray-600"
            >
              {participant.firstName} {participant.lastName} -{" "}
              {participant.district}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIActivitiesCardProps {
  data: KPIOverviewMetrics["activities"];
}

export function KPIActivitiesCard({ data }: KPIActivitiesCardProps) {
  const statusColors = {
    completed: "bg-green-100 text-green-800",
    ongoing: "bg-blue-100 text-blue-800",
    planned: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <IconActivity className="h-5 w-5 text-green-600" />
          <span>Activities Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <div className="text-lg font-bold text-green-600">
              {data.completed}
            </div>
            <div className="text-xs text-green-700">Completed</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-2 text-center">
            <div className="text-lg font-bold text-blue-600">
              {data.ongoing}
            </div>
            <div className="text-xs text-blue-700">Ongoing</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-2 text-center">
            <div className="text-lg font-bold text-yellow-600">
              {data.planned}
            </div>
            <div className="text-xs text-yellow-700">Planned</div>
          </div>
          <div className="rounded-lg bg-red-50 p-2 text-center">
            <div className="text-lg font-bold text-red-600">
              {data.cancelled}
            </div>
            <div className="text-xs text-red-700">Cancelled</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Recent Activities
          </h4>
          {data.recent.slice(0, 3).map(activity => (
            <div
              key={activity.id}
              className="flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">
                  {activity.title}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {activity.venue}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`ml-2 text-xs ${
                  statusColors[activity.status as keyof typeof statusColors]
                }`}
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIVSLAsCardProps {
  data: KPIOverviewMetrics["vslas"];
}

export function KPIVSLAsCard({ data }: KPIVSLAsCardProps) {
  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <IconBuilding className="h-5 w-5 text-purple-600" />
          <span>VSLAs Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(data.totalSavings)}
            </div>
            <div className="text-xs text-gray-500">Total Savings</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(data.totalLoans)}
            </div>
            <div className="text-xs text-gray-500">Total Loans</div>
          </div>
        </div>

        <div className="mb-4 flex justify-center space-x-6">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {data.active}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">
              {data.inactive}
            </div>
            <div className="text-xs text-gray-500">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {data.totalMembers}
            </div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Top Performers
          </h4>
          {data.topPerformers.slice(0, 3).map(vsla => (
            <div key={vsla.id} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">
                  {vsla.name}
                </div>
                <div className="text-xs text-gray-500">
                  {vsla.totalMembers} members • {vsla.district}
                </div>
              </div>
              <div className="text-xs font-medium text-green-600">
                {formatCurrency(vsla.totalSavings)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
