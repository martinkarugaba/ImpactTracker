import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityNotesCardProps {
  activity: Activity;
}

export function ActivityNotesCard({ activity }: ActivityNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes & Outcomes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.outcomes && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Outcomes
            </label>
            <p className="mt-1 text-sm">{activity.outcomes}</p>
          </div>
        )}

        {activity.challenges && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Challenges
            </label>
            <p className="mt-1 text-sm">{activity.challenges}</p>
          </div>
        )}

        {activity.recommendations && (
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Recommendations
            </label>
            <p className="mt-1 text-sm">{activity.recommendations}</p>
          </div>
        )}

        {!activity.outcomes &&
          !activity.challenges &&
          !activity.recommendations && (
            <p className="text-muted-foreground text-sm">
              No notes or outcomes recorded yet.
            </p>
          )}
      </CardContent>
    </Card>
  );
}
