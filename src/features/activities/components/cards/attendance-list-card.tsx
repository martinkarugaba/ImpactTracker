import type { Activity } from "../../types/types";
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
          <Users className="text-muted-foreground h-6 w-6" />
          <CardTitle className="text-xl">Participants</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-base">
              Total Participants
            </span>
            <span className="text-base font-medium">
              {activity.participantCount || activity.numberOfParticipants || 0}
            </span>
          </div>

          {activity.numberOfParticipants !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-base">
                Expected Participants
              </span>
              <span className="text-base font-medium">
                {activity.numberOfParticipants}
              </span>
            </div>
          )}

          <div className="border-muted mt-4 border-t pt-4">
            <p className="text-muted-foreground text-base">
              Detailed attendance information will be displayed here when
              participant data is available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
