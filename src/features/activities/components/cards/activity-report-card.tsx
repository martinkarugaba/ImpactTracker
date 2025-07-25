import { Activity } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload } from "lucide-react";

interface ActivityReportCardProps {
  activity: Activity;
}

export function ActivityReportCard({ activity }: ActivityReportCardProps) {
  const hasAttachments =
    activity.attachments && activity.attachments.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-6 w-6" />
          <CardTitle className="text-xl">Reports & Attachments</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasAttachments ? (
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground text-base font-medium">
                Attachments ({activity.attachments?.length})
              </label>
              <div className="mt-2 space-y-2">
                {activity.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="text-muted-foreground h-5 w-5" />
                      <span className="text-base">{attachment}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-4 text-base">
              No reports or attachments have been uploaded for this activity
              yet.
            </p>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-5 w-5" />
              Upload Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
