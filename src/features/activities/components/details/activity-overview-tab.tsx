"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Info,
  FileText,
  ClipboardList,
  Calendar,
  MapPin,
  DollarSign,
  Files,
} from "lucide-react";
import { format } from "date-fns";
import { Activity } from "../../types/types";
import { ActivityNotesCard } from "../cards/activity-notes-card";
import { ConceptNotesTable } from "../concept-notes/concept-notes-table";
import { ActivityReportsTable } from "../activity-reports/activity-reports-table";

interface ActivityOverviewTabProps {
  activity: Activity;
  onCreateConceptNote: () => void;
  onEditConceptNote: (conceptNoteId: string) => void;
  onDeleteConceptNote: (conceptNoteId: string) => void;
  onCreateActivityReport: () => void;
  onEditActivityReport: (activityReportId: string) => void;
  onDeleteActivityReport: (activityReportId: string) => void;
  refreshKey: number;
  activityReportsRefreshKey: number;
}

export function ActivityOverviewTab({
  activity,
  onCreateConceptNote,
  onEditConceptNote,
  onDeleteConceptNote,
  onCreateActivityReport,
  onEditActivityReport,
  onDeleteActivityReport,
  refreshKey,
  activityReportsRefreshKey,
}: ActivityOverviewTabProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Not set";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planned":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Information Cards */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center p-4">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm font-medium">
                Status
              </p>
              <Badge className={`mt-1 ${getStatusColor(activity.status)}`}>
                {activity.status.replace("_", " ")}
              </Badge>
            </div>
            <Info className="h-6 w-6 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center p-4">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm font-medium">
                Duration
              </p>
              <p className="text-sm font-semibold">
                {formatDate(activity.startDate)} -{" "}
                {formatDate(activity.endDate)}
              </p>
            </div>
            <Calendar className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="flex items-center p-4">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm font-medium">Venue</p>
              <p className="text-sm font-semibold">{activity.venue || "TBD"}</p>
            </div>
            <MapPin className="h-6 w-6 text-purple-600" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="flex items-center p-4">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm font-medium">
                Budget
              </p>
              <p className="text-sm font-semibold">
                {activity.budget
                  ? `$${Number(activity.budget).toLocaleString()}`
                  : "Not set"}
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Details */}
        <div className="lg:col-span-2">
          <Card className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card border-l-4 border-l-indigo-500 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Activity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {activity.description && (
                <div>
                  <label className="text-muted-foreground text-sm font-semibold">
                    Description
                  </label>
                  <p className="text-foreground mt-2 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              )}

              {activity.objectives && (
                <div>
                  <label className="text-muted-foreground text-sm font-semibold">
                    Objectives
                  </label>
                  <p className="text-foreground mt-2 leading-relaxed">
                    {activity.objectives}
                  </p>
                </div>
              )}

              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                {activity.projectName && (
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/30">
                    <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Project
                    </label>
                    <p className="text-foreground mt-1 text-sm font-medium">
                      {activity.projectName}
                    </p>
                  </div>
                )}

                {activity.clusterName && (
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/30">
                    <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Cluster
                    </label>
                    <p className="text-foreground mt-1 text-sm font-medium">
                      {activity.clusterName}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Notes */}
        <div>
          <ActivityNotesCard activity={activity} />
        </div>
      </div>

      {/* Documents Section */}
      <Card className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card border-l-4 border-l-emerald-500 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Files className="h-5 w-5 text-emerald-600" />
              Documents & Reports
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={onCreateConceptNote} variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Add Concept Note
              </Button>
              <Button
                onClick={onCreateActivityReport}
                variant="outline"
                size="sm"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Add Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h3 className="text-foreground text-base font-semibold">
                Concept Notes
              </h3>
            </div>
            <ConceptNotesTable
              key={`concept-notes-${activity.id}-${refreshKey}`}
              activityId={activity.id}
              onCreateConceptNote={onCreateConceptNote}
              onEditConceptNote={onEditConceptNote}
              onDeleteConceptNote={onDeleteConceptNote}
              refreshKey={refreshKey}
            />
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-600" />
              <h3 className="text-foreground text-base font-semibold">
                Activity Reports
              </h3>
            </div>
            <ActivityReportsTable
              key={`activity-reports-${activity.id}-${activityReportsRefreshKey}`}
              activityId={activity.id}
              onCreateActivityReport={onCreateActivityReport}
              onEditActivityReport={onEditActivityReport}
              onDeleteActivityReport={onDeleteActivityReport}
              refreshKey={activityReportsRefreshKey}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
