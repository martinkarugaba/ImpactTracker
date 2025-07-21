import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Building } from "lucide-react";
import { format } from "date-fns";

interface ActivityHeaderProps {
  activity: Activity;
}

export function ActivityHeader({ activity }: ActivityHeaderProps) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      planned: "border-blue-300 bg-blue-100 text-blue-800",
      ongoing: "border-amber-300 bg-amber-100 text-amber-800",
      completed: "border-green-300 bg-green-100 text-green-800",
      cancelled: "border-red-300 bg-red-100 text-red-800",
      postponed: "border-gray-300 bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        variant="secondary"
        className={`border ${statusColors[status as keyof typeof statusColors]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {activity.title}
              </CardTitle>
              {getStatusBadge(activity.status)}
            </div>
            {activity.description && (
              <p className="leading-relaxed text-gray-700">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {format(new Date(activity.startDate), "MMM dd, yyyy")}
              </div>
              {activity.endDate && (
                <div className="text-gray-600">
                  to {format(new Date(activity.endDate), "MMM dd, yyyy")}
                </div>
              )}
            </div>
          </div>

          {activity.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-900">
                {activity.venue}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-900">
              {activity.participantCount || 0} participants
            </span>
          </div>

          {activity.organizationName && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-gray-900">
                {activity.organizationName}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
