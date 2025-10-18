import type { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityNotesCardProps {
  activity: Activity;
}

export function ActivityNotesCard({ activity }: ActivityNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Notes & Outcomes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.outcomes && (
          <div>
            <label className="text-base font-medium text-muted-foreground">
              Outcomes
            </label>
            <p className="mt-1 text-base">{activity.outcomes}</p>
          </div>
        )}

        {activity.challenges && (
          <div>
            <label className="text-base font-medium text-muted-foreground">
              Challenges
            </label>
            <p className="mt-1 text-base">{activity.challenges}</p>
          </div>
        )}

        {activity.recommendations && (
          <div>
            <label className="text-base font-medium text-muted-foreground">
              Recommendations
            </label>
            <p className="mt-1 text-base">{activity.recommendations}</p>
          </div>
        )}

        {!activity.outcomes &&
          !activity.challenges &&
          !activity.recommendations && (
            <p className="text-base text-muted-foreground">
              No notes or outcomes recorded yet.
            </p>
          )}
      </CardContent>
    </Card>
  );
}
