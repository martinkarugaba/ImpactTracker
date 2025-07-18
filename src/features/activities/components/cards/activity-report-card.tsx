"use client";

import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TargetIcon, EditIcon } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { getStatusColor } from "../../utils/status-utils";
import { formatFullDate } from "../../utils/format-utils";

interface ActivityReportCardProps {
  activity: Activity;
  onEdit: () => void;
}

export function ActivityReportCard({
  activity,
  onEdit,
}: ActivityReportCardProps) {
  const hasReport =
    activity.activityReport ||
    activity.outcomes ||
    activity.challenges ||
    activity.recommendations;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TargetIcon className="mr-2 h-5 w-5" />
            Activity Report
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <EditIcon className="mr-2 h-4 w-4" />
            {activity.activityReport ? "Edit" : "Add"} Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasReport ? (
          <div className="space-y-6">
            {activity.activityReport && (
              <div className="mb-6">
                <MarkdownRenderer content={activity.activityReport} />
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Status</p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.charAt(0).toUpperCase() +
                        activity.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Participants</p>
                    <p className="text-muted-foreground text-sm">
                      {activity.numberOfParticipants || 0} people
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Actual End Date</p>
                    <p className="text-muted-foreground text-sm">
                      {activity.endDate
                        ? formatFullDate(activity.endDate.toString())
                        : "Ongoing"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Outcomes</p>
                    <p className="text-muted-foreground text-sm">
                      {activity.outcomes}
                    </p>
                  </div>
                  {activity.challenges && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Challenges</p>
                      <p className="text-muted-foreground text-sm">
                        {activity.challenges}
                      </p>
                    </div>
                  )}
                  {activity.recommendations && (
                    <div>
                      <p className="mb-2 text-sm font-medium">
                        Recommendations
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {activity.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <TargetIcon className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No activity report
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Add a detailed report about this activity's outcomes and impact.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
