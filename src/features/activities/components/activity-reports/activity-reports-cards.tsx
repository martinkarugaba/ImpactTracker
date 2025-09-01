"use client";

import { useState, useEffect, useCallback } from "react";
import { type ActivityReport } from "../../types/types";
import { getActivityReportsByActivity } from "../../actions/activity-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  Calendar,
  MapPin,
  User,
  FileText,
  Edit,
  Trash2,
  Clock,
  Users,
  DollarSign,
  Target,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface ActivityReportsCardsProps {
  activityId: string;
  onCreateActivityReport?: () => void;
  onEditActivityReport?: (activityReportId: string) => void;
  onDeleteActivityReport?: (activityReportId: string) => void;
  refreshKey?: number;
}

export function ActivityReportsCards({
  activityId,
  onCreateActivityReport,
  onEditActivityReport,
  onDeleteActivityReport,
  refreshKey = 0,
}: ActivityReportsCardsProps) {
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getActivityReportsByActivity(activityId);
      if (response.success && response.data) {
        setActivityReports(response.data);
      } else {
        setError(response.error || "Failed to fetch activity reports");
      }
    } catch (err) {
      setError("An error occurred while fetching activity reports");
      console.error("Error fetching activity reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    if (activityId) {
      fetchActivityReports();
    }
  }, [activityId, fetchActivityReports, refreshKey]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <ClipboardList className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (activityReports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No Activity Reports
        </h3>
        <p className="mx-auto mb-6 max-w-sm text-gray-600 dark:text-gray-400">
          Start documenting your activity outcomes by creating your first
          report.
        </p>
        {onCreateActivityReport && (
          <Button
            onClick={onCreateActivityReport}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Report
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Activity Reports
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activityReports.length}{" "}
            {activityReports.length === 1 ? "report" : "reports"} documented
          </p>
        </div>
        {onCreateActivityReport && (
          <Button onClick={onCreateActivityReport} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Report
          </Button>
        )}
      </div>

      {/* Reports Grid */}
      <div className="space-y-4">
        {activityReports.map(report => (
          <Card
            key={report.id}
            className="group relative overflow-hidden transition-all hover:shadow-lg"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="mb-3 line-clamp-2 text-lg leading-tight font-semibold">
                    {report.title}
                  </CardTitle>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <FileText className="mr-1 h-3 w-3" />
                      Report
                    </Badge>
                    {report.cluster_name && (
                      <Badge variant="secondary" className="text-xs">
                        {report.cluster_name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {onEditActivityReport && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEditActivityReport(report.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteActivityReport && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                      onClick={() => onDeleteActivityReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Main Info Section - Horizontal Layout */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column - Key Info */}
                <div className="space-y-3">
                  {report.team_leader && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {report.team_leader}
                      </span>
                    </div>
                  )}

                  {report.execution_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {format(
                          new Date(report.execution_date),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  )}

                  {report.venue && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="truncate text-gray-700 dark:text-gray-300">
                        {report.venue}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Column - Stats */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  {report.number_of_participants && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                        <Users className="h-4 w-4" />
                        <span className="text-lg font-semibold">
                          {report.number_of_participants}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Participants
                      </p>
                    </div>
                  )}

                  {report.actual_cost && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-lg font-semibold">
                          {report.actual_cost.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Cost (UGX)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Sections - Horizontal Layout */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Background & Purpose Preview */}
                {report.background_purpose && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      Background & Purpose
                    </h4>
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {report.background_purpose}
                    </p>
                  </div>
                )}

                {/* Achievements Preview */}
                {report.progress_achievements && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Key Achievements
                    </h4>
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {report.progress_achievements}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created{" "}
                    {report.created_at
                      ? format(new Date(report.created_at), "MMM dd, yyyy")
                      : "Unknown"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Completed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
