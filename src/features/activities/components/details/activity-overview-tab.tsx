"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  ClipboardList,
  Calendar,
  Target,
  Building,
  Users,
  CheckCircle,
} from "lucide-react";
import type { Activity } from "../../types/types";
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
  const { data: sessionsResponse } = useActivitySessions(activity.id);
  const sessions = sessionsResponse?.data || [];
  const hasMultipleSessions = sessions.length > 1;

  return (
    <div className="space-y-8">
      {/* Activity Details Section */}
      <div className="group rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50/40 to-gray-50/40 p-0 transition-all hover:border-slate-300/70 hover:shadow-lg dark:border-slate-700/40 dark:from-slate-900/30 dark:to-gray-900/30 dark:hover:border-slate-600/50">
        <Card className="border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 shadow-sm">
                <Target className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
                Activity Details
              </span>
              <div className="ml-auto rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:from-indigo-900/40 dark:to-purple-900/40 dark:text-indigo-300">
                Overview
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Activity Title */}
            <div className="rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50/50 to-slate-50/50 p-3 dark:border-gray-800 dark:from-gray-900/50 dark:to-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-muted p-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {activity.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Description & Objectives */}
              <div className="space-y-3">
                {activity.description && (
                  <div className="rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50 p-3 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-green-900/20">
                    <div className="flex items-start gap-2">
                      <div className="rounded-md bg-emerald-100 p-1 dark:bg-emerald-900/40">
                        <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                          Description
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activity.objectives && (
                  <div className="rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-3 dark:border-amber-800/50 dark:from-amber-900/20 dark:to-orange-900/20">
                    <div className="flex items-start gap-2">
                      <div className="rounded-md bg-amber-100 p-1 dark:bg-amber-900/40">
                        <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                          Objectives
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                          {activity.objectives}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Organization & Status */}
              <div className="space-y-3">
                {/* Organization Information */}
                {(activity.projectName || activity.clusterName) && (
                  <div className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-3 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-purple-100 p-1 dark:bg-purple-900/40">
                          <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                          Organization
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activity.projectName && (
                          <div className="flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs shadow-sm">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {activity.projectName}
                            </span>
                          </div>
                        )}
                        {activity.clusterName && (
                          <div className="flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs shadow-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {activity.clusterName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status & Sessions */}
                <div className="rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50/50 to-slate-50/50 p-3 dark:border-gray-800 dark:from-gray-900/40 dark:to-slate-900/40">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-green-100 p-1 dark:bg-green-900/40">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {activity.status || "Active"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                      </div>
                    </div>

                    {hasMultipleSessions && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-muted p-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {sessions.length} Sessions
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Total planned
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Notes Section */}
      <ActivityNotesCard activity={activity} />

      {/* Documents Section */}
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        {/* Concept Notes Table */}
        <div className="group rounded-lg border p-1 transition-all hover:shadow-sm">
          <Card className="border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <div className="rounded-md bg-muted p-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  Concept Notes
                </span>
                <div className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Planning
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
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
        </div>

        {/* Activity Reports Table */}
        <div className="group rounded-lg border p-1 transition-all hover:shadow-sm">
          <Card className="border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <div className="rounded-md bg-muted p-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  Activity Reports
                </span>
                <div className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Documentation
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
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
    </div>
  );
}
