"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ClipboardList,
  Calendar,
  MapPin,
  DollarSign,
  Files,
  Target,
  Building,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Activity } from "../../types/types";
import { useActivitySessions } from "../../hooks/use-activities";
import { ActivityNotesCard } from "../cards/activity-notes-card";
import { ConceptNotesCards } from "../concept-notes/concept-notes-cards";
import { ActivityReportsCards } from "../activity-reports/activity-reports-cards";

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
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group relative overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Duration
                </p>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatDate(activity.startDate)}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    to {formatDate(activity.endDate)}
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg hover:shadow-green-100/50 dark:hover:shadow-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Venue
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {activity.venue || "TBD"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Event location
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Budget
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {activity.budget
                    ? `$${Number(activity.budget).toLocaleString()}`
                    : "Not set"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total allocation
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Metrics Card - Only show for multi-day activities */}
        {hasMultipleSessions ? (
          <Card className="group relative overflow-hidden border-l-4 border-l-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">
                    Sessions
                  </p>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {completedSessions}/{sessions.length}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {sessionCompletionRate}% complete
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/30">
                  <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="group relative overflow-hidden border-l-4 border-l-orange-500 transition-all hover:shadow-lg hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">
                    Project
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {activity.projectName || "General"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Project context
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                  <Building className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
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
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Files className="h-5 w-5 text-emerald-600" />
              Documents & Reports
            </CardTitle>
            <div className="flex gap-3">
              <Button
                onClick={onCreateConceptNote}
                variant="outline"
                size="sm"
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                <FileText className="mr-2 h-4 w-4" />
                Add Concept Note
              </Button>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-10 p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Concept Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Planning documents and initial ideas for the activity
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/30">
              <ConceptNotesCards
                key={`concept-notes-${activity.id}-${refreshKey}`}
                activityId={activity.id}
                onCreateConceptNote={onCreateConceptNote}
                onEditConceptNote={onEditConceptNote}
                onDeleteConceptNote={onDeleteConceptNote}
                refreshKey={refreshKey}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Activity Reports
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed reports and outcome documentation
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/30">
              <ActivityReportsCards
                key={`activity-reports-${activity.id}-${activityReportsRefreshKey}`}
                activityId={activity.id}
                onCreateActivityReport={onCreateActivityReport}
                onEditActivityReport={onEditActivityReport}
                onDeleteActivityReport={onDeleteActivityReport}
                refreshKey={activityReportsRefreshKey}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
