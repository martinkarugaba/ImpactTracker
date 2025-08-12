import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { VSLA } from "../../types";

interface VSLAMeetingInfoProps {
  vsla: VSLA;
}

export function VSLAMeetingInfo({ vsla }: VSLAMeetingInfoProps) {
  if (!vsla.meeting_frequency && !vsla.meeting_day && !vsla.meeting_time) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {vsla.meeting_frequency && (
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Frequency</p>
                <p className="text-muted-foreground text-sm capitalize">
                  {vsla.meeting_frequency}
                </p>
              </div>
            </div>
          )}
          {vsla.meeting_day && (
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Day</p>
                <p className="text-muted-foreground text-sm capitalize">
                  {vsla.meeting_day}
                </p>
              </div>
            </div>
          )}
          {vsla.meeting_time && (
            <div className="flex items-center gap-3">
              <Clock className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-muted-foreground text-sm">
                  {vsla.meeting_time}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
