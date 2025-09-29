"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { type ActivityReport } from "../../types/types";
import { getActivityReportsByActivity } from "../../actions/activity-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import { activityReportsColumns } from "./activity-reports-columns";

interface ActivityReportsTableProps {
  activityId: string;
  onCreateActivityReport?: () => void;
  onEditActivityReport?: (activityReportId: string) => void;
  onDeleteActivityReport?: (activityReportId: string) => void;
  refreshKey?: number;
}

export function ActivityReportsTable({
  activityId,
  onCreateActivityReport,
  onEditActivityReport,
  onDeleteActivityReport,
  refreshKey = 0,
}: ActivityReportsTableProps) {
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

  // Set up global handlers for edit and delete
  useEffect(() => {
    if (onEditActivityReport) {
      window.onEditActivityReport = onEditActivityReport;
    }
    if (onDeleteActivityReport) {
      window.onDeleteActivityReport = onDeleteActivityReport;
    }

    return () => {
      window.onEditActivityReport = undefined;
      window.onDeleteActivityReport = undefined;
    };
  }, [onEditActivityReport, onDeleteActivityReport]);

  useEffect(() => {
    if (activityId) {
      fetchActivityReports();
    }
  }, [activityId, fetchActivityReports, refreshKey]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="text-muted-foreground h-6 w-6" />
            <CardTitle className="text-xl">Activity Reports</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-base">
              Loading activity reports...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="text-muted-foreground h-6 w-6" />
            <CardTitle className="text-xl">Activity Reports</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive text-base">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activityReports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-muted-foreground h-6 w-6" />
              <CardTitle className="text-xl">Activity Reports</CardTitle>
            </div>
            {onCreateActivityReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateActivityReport}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Activity Report
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <ClipboardList className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-4 text-base">
              No activity reports have been created for this activity yet.
            </p>
            {onCreateActivityReport && (
              <Button variant="outline" onClick={onCreateActivityReport}>
                <Plus className="mr-2 h-5 w-5" />
                Create First Activity Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DataTable
      columns={activityReportsColumns}
      data={activityReports}
      filterColumn="title"
      filterPlaceholder="Filter activity reports..."
      showColumnToggle={true}
      showPagination={activityReports.length > 5}
      showRowSelection={false}
      pageSize={5}
      actionButtons={
        onCreateActivityReport && (
          <Button variant="outline" size="sm" onClick={onCreateActivityReport}>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity Report
          </Button>
        )
      }
    />
  );
}
