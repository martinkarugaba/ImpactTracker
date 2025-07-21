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
      planned: "bg-blue-100 text-blue-800",
      ongoing: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      postponed: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        variant="secondary"
        className={statusColors[status as keyof typeof statusColors]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{activity.title}</CardTitle>
              {getStatusBadge(activity.status)}
            </div>
            {activity.description && (
              <p className="text-muted-foreground">{activity.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <div className="text-sm">
              <div>{format(new Date(activity.startDate), "MMM dd, yyyy")}</div>
              {activity.endDate && (
                <div className="text-muted-foreground">
                  to {format(new Date(activity.endDate), "MMM dd, yyyy")}
                </div>
              )}
            </div>
          </div>

          {activity.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">{activity.venue}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">
              {activity.participantCount || 0} participants
            </span>
          </div>

          {activity.organizationName && (
            <div className="flex items-center gap-2">
              <Building className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">{activity.organizationName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
