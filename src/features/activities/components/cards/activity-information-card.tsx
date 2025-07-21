import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityInformationCardProps {
  activity: Activity;
}

export function ActivityInformationCard({
  activity,
}: ActivityInformationCardProps) {
  const getTypeLabel = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Type
            </label>
            <div className="mt-1">
              <Badge variant="outline" className="capitalize">
                {getTypeLabel(activity.type)}
              </Badge>
            </div>
          </div>

          {activity.projectName && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Project
              </label>
              <p className="mt-1 text-sm">{activity.projectName}</p>
            </div>
          )}

          {activity.clusterName && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Cluster
              </label>
              <p className="mt-1 text-sm">{activity.clusterName}</p>
            </div>
          )}

          {activity.budget && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Budget
              </label>
              <p className="mt-1 text-sm">
                ${Number(activity.budget).toLocaleString()}
              </p>
            </div>
          )}

          {activity.actualCost && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Actual Cost
              </label>
              <p className="mt-1 text-sm">
                ${Number(activity.actualCost).toLocaleString()}
              </p>
            </div>
          )}

          {activity.objectives && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Objectives
              </label>
              <p className="mt-1 text-sm">{activity.objectives}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
