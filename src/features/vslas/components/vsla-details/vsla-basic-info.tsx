import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VSLA } from "../../types";

interface VSLABasicInfoProps {
  vsla: VSLA;
}

export function VSLABasicInfo({ vsla }: VSLABasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Name
                </span>
                <span className="font-medium">{vsla.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Code
                </span>
                <span className="font-medium">{vsla.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <Badge
                  variant={
                    vsla.status === "active"
                      ? "default"
                      : vsla.status === "inactive"
                        ? "secondary"
                        : "destructive"
                  }
                  className="capitalize"
                >
                  {vsla.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Formed Date
                </span>
                <span className="font-medium">
                  {new Date(vsla.formation_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Members
                </span>
                <span className="font-medium">{vsla.total_members}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Meeting Frequency
                </span>
                <Badge variant="outline" className="capitalize">
                  {vsla.meeting_frequency}
                </Badge>
              </div>
              {vsla.meeting_day && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Meeting Day
                  </span>
                  <span className="font-medium capitalize">
                    {vsla.meeting_day}
                  </span>
                </div>
              )}
              {vsla.meeting_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Meeting Time
                  </span>
                  <span className="font-medium">{vsla.meeting_time}</span>
                </div>
              )}
            </div>
          </div>
          {vsla.description && (
            <div className="mt-4">
              <span className="text-sm font-medium text-muted-foreground">
                Description
              </span>
              <p className="mt-1 text-sm">{vsla.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
