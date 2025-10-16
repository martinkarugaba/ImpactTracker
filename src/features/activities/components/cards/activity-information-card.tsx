import type { Activity } from "../../types/types";
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
        <CardTitle className="text-xl">Activity Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="text-base font-medium text-muted-foreground">
              Type
            </label>
            <div className="mt-1">
              <Badge variant="outline" className="text-base capitalize">
                {getTypeLabel(activity.type)}
              </Badge>
            </div>
          </div>

          {activity.projectName && (
            <div>
              <label className="text-base font-medium text-muted-foreground">
                Project
              </label>
              <p className="mt-1 text-base">{activity.projectName}</p>
            </div>
          )}

          {activity.clusterName && (
            <div>
              <label className="text-base font-medium text-muted-foreground">
                Cluster
              </label>
              <p className="mt-1 text-base">{activity.clusterName}</p>
            </div>
          )}

          {activity.budget && (
            <div>
              <label className="text-base font-medium text-muted-foreground">
                Budget
              </label>
              <p className="mt-1 text-base">
                ${Number(activity.budget).toLocaleString()}
              </p>
            </div>
          )}

          {activity.actualCost && (
            <div>
              <label className="text-base font-medium text-muted-foreground">
                Actual Cost
              </label>
              <p className="mt-1 text-base">
                ${Number(activity.actualCost).toLocaleString()}
              </p>
            </div>
          )}

          {activity.objectives && (
            <div>
              <label className="text-base font-medium text-muted-foreground">
                Objectives
              </label>
              <p className="mt-1 text-base">{activity.objectives}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
