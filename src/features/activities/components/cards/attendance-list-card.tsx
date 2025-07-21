import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface AttendanceListCardProps {
  activity: Activity;
}

export function AttendanceListCard({ activity }: AttendanceListCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-5 w-5" />
          <CardTitle>Participants</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Total Participants
            </span>
            <span className="font-medium">
              {activity.participantCount || activity.numberOfParticipants || 0}
            </span>
          </div>

          {activity.numberOfParticipants !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Expected Participants
              </span>
              <span className="font-medium">
                {activity.numberOfParticipants}
              </span>
            </div>
          )}

          <div className="border-muted mt-4 border-t pt-3">
            <p className="text-muted-foreground text-sm">
              Detailed attendance information will be displayed here when
              participant data is available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
