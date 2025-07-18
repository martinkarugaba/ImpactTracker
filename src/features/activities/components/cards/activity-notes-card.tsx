"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, EditIcon, FileTextIcon } from "lucide-react";
import { format } from "date-fns";
import { renderTextContent } from "../../utils/text-utils";
import { isWithinLastDays } from "../../utils/format-utils";

interface ActivityNotesCardProps {
  objectives: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  onEdit: () => void;
}

export function ActivityNotesCard({
  objectives,
  createdAt,
  updatedAt,
  onEdit,
}: ActivityNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileTextIcon className="mr-2 h-5 w-5" />
            Activity Notes
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit Notes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {objectives ? (
          <div className="space-y-3">
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              {renderTextContent(objectives)}
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {"Last updated: "}
                {updatedAt
                  ? format(new Date(updatedAt), "PPP")
                  : createdAt
                    ? format(new Date(createdAt), "PPP")
                    : "Unknown date"}
              </div>
              {updatedAt && isWithinLastDays(updatedAt, 7) && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-xs dark:bg-blue-900"
                >
                  Recently Updated
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <FileTextIcon className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No notes available
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Add notes to document important details about this activity.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onEdit}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Add Notes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
