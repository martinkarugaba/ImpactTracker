"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { getActivityColumns } from "./table/columns";
import { ActivityFormDialog } from "./forms/activity-form-dialog";
import { ActivityFiltersComponent } from "./filters/activity-filters";
import {
  ActivityMetricsCards,
  ActivityStatusOverview,
  ActivityTypeOverview,
} from "./metrics/activity-metrics-cards";
import { useActivities, useActivityMetrics } from "../hooks/use-activities";
import { type Activity, type ActivityFilters } from "../types/types";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteActivity } from "../hooks/use-activities";

interface ActivitiesContainerProps {
  organizations: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivitiesContainer({
  organizations,
  clusters = [],
  projects = [],
}: ActivitiesContainerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    type: "",
    status: "",
    organizationId: "",
    clusterId: "",
    projectId: "",
    startDate: undefined,
    endDate: undefined,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(
    null
  );

  // Fetch activities with filters
  const {
    data: activitiesData,
    isLoading: _isActivitiesLoading,
    error: activitiesError,
  } = useActivities(undefined, {
    search: filters.search || undefined,
    filters: {
      type: filters.type || undefined,
      status: filters.status || undefined,
      organization: filters.organizationId || undefined,
      project: filters.projectId || undefined,
      dateFrom: filters.startDate?.toISOString(),
      dateTo: filters.endDate?.toISOString(),
    },
  });

  // Fetch metrics
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useActivityMetrics();

  const deleteActivity = useDeleteActivity();

  const activities = activitiesData?.data?.data || [];

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleDelete = (activity: Activity) => {
    setDeletingActivity(activity);
  };

  const handleView = (activity: Activity) => {
    router.push(`/dashboard/activities/${activity.id}`);
  };

  const confirmDelete = async () => {
    if (!deletingActivity) return;

    try {
      await deleteActivity.mutateAsync({ id: deletingActivity.id });
      toast.success("Activity deleted successfully.");
      setDeletingActivity(null);
    } catch (_error) {
      toast.error("Failed to delete activity. Please try again.");
    }
  };

  const columns = getActivityColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  });

  if (activitiesError || metricsError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading activities</h3>
          <p className="text-muted-foreground mt-2">
            {activitiesError?.message ||
              metricsError?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <ActivityMetricsCards
        metrics={
          metrics?.data || {
            totalActivities: 0,
            activeActivities: 0,
            completedActivities: 0,
            ongoingActivities: 0,
            plannedActivities: 0,
            totalParticipants: 0,
            totalBudget: 0,
            actualSpent: 0,
            thisMonth: 0,
            nextMonth: 0,
            overdue: 0,
            multiDayActivities: 0,
            singleDayActivities: 0,
            totalSessions: 0,
            completedSessions: 0,
            scheduledSessions: 0,
            sessionCompletionRate: 0,
            averageSessionsPerActivity: 0,
            averageActivityDuration: 0,
            activitiesWithSessions: 0,
            byStatus: {},
            byType: {},
          }
        }
        isLoading={isMetricsLoading}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <ActivityStatusOverview
          metrics={
            metrics?.data || {
              totalActivities: 0,
              activeActivities: 0,
              completedActivities: 0,
              ongoingActivities: 0,
              plannedActivities: 0,
              totalParticipants: 0,
              totalBudget: 0,
              actualSpent: 0,
              thisMonth: 0,
              nextMonth: 0,
              overdue: 0,
              multiDayActivities: 0,
              singleDayActivities: 0,
              totalSessions: 0,
              completedSessions: 0,
              scheduledSessions: 0,
              sessionCompletionRate: 0,
              averageSessionsPerActivity: 0,
              averageActivityDuration: 0,
              activitiesWithSessions: 0,
              byStatus: {},
              byType: {},
            }
          }
          isLoading={isMetricsLoading}
        />
        <ActivityTypeOverview
          metrics={
            metrics?.data || {
              totalActivities: 0,
              activeActivities: 0,
              completedActivities: 0,
              ongoingActivities: 0,
              plannedActivities: 0,
              totalParticipants: 0,
              totalBudget: 0,
              actualSpent: 0,
              thisMonth: 0,
              nextMonth: 0,
              overdue: 0,
              multiDayActivities: 0,
              singleDayActivities: 0,
              totalSessions: 0,
              completedSessions: 0,
              scheduledSessions: 0,
              sessionCompletionRate: 0,
              averageSessionsPerActivity: 0,
              averageActivityDuration: 0,
              activitiesWithSessions: 0,
              byStatus: {},
              byType: {},
            }
          }
          isLoading={isMetricsLoading}
        />
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
          <p className="text-muted-foreground">
            Manage and track all organizational activities
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Activity
        </Button>
      </div>

      {/* Filters */}
      <ActivityFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        organizations={organizations}
        clusters={clusters}
        projects={projects}
      />

      {/* Activities Table */}
      <ReusableDataTable
        columns={columns}
        data={activities}
        filterColumn="title"
        filterPlaceholder="Search activities..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={10}
        onRowClick={handleView}
      />

      {/* Create/Edit Dialog */}
      <ActivityFormDialog
        open={isCreateDialogOpen || !!editingActivity}
        onOpenChange={open => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingActivity(null);
          }
        }}
        activity={editingActivity || undefined}
        organizations={organizations}
        clusters={clusters}
        projects={projects}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingActivity}
        onOpenChange={open => {
          if (!open) setDeletingActivity(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              activity "{deletingActivity?.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
