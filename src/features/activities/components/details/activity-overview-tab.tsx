"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import {
  FileText,
  ClipboardList,
  Calendar,
  MapPin,
  DollarSign,
  Target,
  Building,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Activity } from "../../types/types";
import { useActivitySessions } from "../../hooks/use-activities";
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
  // Fetch session data for multi-day activities
  const { data: sessionsResponse } = useActivitySessions(activity.id);
  const sessions = sessionsResponse?.data || [];
  const hasMultipleSessions = sessions.length > 1;
  const completedSessions = sessions.filter(
    s => s.status === "completed"
  ).length;
  const sessionCompletionRate =
    sessions.length > 0
      ? Math.round((completedSessions / sessions.length) * 100)
      : 0;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Not set";
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Start Date"
          value={formatDate(activity.startDate)}
          footer={{
            title: "Event duration",
            description: `to ${formatDate(activity.endDate)}`,
          }}
          icon={<Calendar className="h-4 w-4" />}
        />

        <MetricCard
          title="Venue"
          value={activity.venue || "TBD"}
          footer={{
            title: "Event location",
            description: "Activity venue",
          }}
          icon={<MapPin className="h-4 w-4" />}
        />

        <MetricCard
          title="Budget"
          value={
            activity.budget
              ? `$${Number(activity.budget).toLocaleString()}`
              : "Not set"
          }
          footer={{
            title: "Total allocation",
            description: "Budget allocated",
          }}
          icon={<DollarSign className="h-4 w-4" />}
        />

        {/* Session Metrics Card - Only show for multi-day activities */}
        {hasMultipleSessions ? (
          <MetricCard
            title="Sessions"
            value={`${completedSessions}/${sessions.length}`}
            footer={{
              title: `${sessionCompletionRate}% complete`,
              description: "Session progress",
            }}
            icon={<Calendar className="h-4 w-4" />}
          />
        ) : (
          <MetricCard
            title="Project"
            value={activity.projectName || "General"}
            footer={{
              title: "Project context",
              description: "Activity project",
            }}
            icon={<Building className="h-4 w-4" />}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Activity Details */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-indigo-600" />
                Activity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {activity.description && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-400">
                      Description
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    {activity.description}
                  </p>
                </div>
              )}

              {activity.objectives && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-400">
                      Objectives
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    {activity.objectives}
                  </p>
                </div>
              )}

              {(activity.projectName || activity.clusterName) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-400">
                      Organization
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {activity.projectName && (
                      <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:from-gray-900 dark:to-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                            <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              PROJECT
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {activity.projectName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.clusterName && (
                      <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:from-gray-900 dark:to-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              CLUSTER
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {activity.clusterName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Notes */}
        <div>
          <ActivityNotesCard activity={activity} />
        </div>
      </div>

      {/* Documents Section */}
      <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2">
        {/* Concept Notes Table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Concept Notes
              </CardTitle>
              <Button
                onClick={onCreateConceptNote}
                variant="outline"
                size="sm"
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                <FileText className="mr-2 h-4 w-4" />
                Add Concept Note
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ConceptNotesTable
              key={`concept-notes-${activity.id}-${refreshKey}`}
              activityId={activity.id}
              onCreateConceptNote={onCreateConceptNote}
              onEditConceptNote={onEditConceptNote}
              onDeleteConceptNote={onDeleteConceptNote}
              refreshKey={refreshKey}
            />
          </CardContent>
        </Card>

        {/* Activity Reports Table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Activity Reports
              </CardTitle>
              <Button
                onClick={onCreateActivityReport}
                variant="outline"
                size="sm"
                className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-300 dark:hover:bg-purple-950/40"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Add Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ActivityReportsTable
              key={`activity-reports-${activity.id}-${activityReportsRefreshKey}`}
              activityId={activity.id}
              onCreateActivityReport={onCreateActivityReport}
              onEditActivityReport={onEditActivityReport}
              onDeleteActivityReport={onDeleteActivityReport}
              refreshKey={activityReportsRefreshKey}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
