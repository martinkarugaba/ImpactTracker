import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Building } from "lucide-react";
import { format } from "date-fns";

interface ActivityHeaderProps {
  activity: Activity;
}

export function ActivityHeader({ activity }: ActivityHeaderProps) {
  const getTypeBadge = (type: string) => {
    const typeColors = {
      meeting:
        "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200",
      workshop:
        "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-200",
      training:
        "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200",
      field_visit:
        "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900 dark:text-orange-200",
      conference:
        "border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      seminar:
        "border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-800 dark:bg-teal-900 dark:text-teal-200",
      consultation:
        "border-cyan-200 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      assessment:
        "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-200",
      monitoring:
        "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      evaluation:
        "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-900 dark:text-violet-200",
      community_engagement:
        "border-lime-200 bg-lime-100 text-lime-800 dark:border-lime-800 dark:bg-lime-900 dark:text-lime-200",
      capacity_building:
        "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200",
      advocacy:
        "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200",
      research:
        "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
      other:
        "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
    };

    const displayType = type
      .replace(/_/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());

    return (
      <Badge
        variant="outline"
        className={`border ${typeColors[type as keyof typeof typeColors] || typeColors.other}`}
      >
        {displayType}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      planned:
        "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ongoing:
        "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200",
      completed:
        "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled:
        "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200",
      postponed:
        "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
    };

    const statusColor =
      statusColors[status as keyof typeof statusColors] || statusColors.planned;

    return (
      <Badge variant="outline" className={`capitalize ${statusColor}`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {activity.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getTypeBadge(activity.type)}
                {getStatusBadge(activity.status)}
              </div>
            </div>
            {activity.description && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" />
            <div className="text-base">
              <div className="font-medium">
                {format(new Date(activity.startDate), "MMM dd, yyyy")}
              </div>
              {activity.endDate && (
                <div className="text-muted-foreground">
                  to {format(new Date(activity.endDate), "MMM dd, yyyy")}
                </div>
              )}
            </div>
          </div>

          {activity.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="text-primary h-5 w-5" />
              <span className="text-base font-medium">{activity.venue}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="text-primary h-5 w-5" />
            <span className="text-base font-medium">
              {activity.participantCount || 0} participants
            </span>
          </div>

          {activity.organizationName && (
            <div className="flex items-center gap-2">
              <Building className="text-primary h-5 w-5" />
              <span className="text-base font-medium">
                {activity.organizationName}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
