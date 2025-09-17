"use client";

import { useState, useEffect } from "react";
import { Activity } from "../types/types";
import type {
  ConceptNote,
  NewConceptNote,
  ActivityParticipant,
  ActivityReport,
} from "../types/types";
import { ActivityHeader } from "./details/activity-header";
import { ActivityDetailsTabs } from "./details/activity-details-tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { ActivityFormDialog } from "./forms/activity-form-dialog";
import { ConceptNoteDialog } from "./dialogs/concept-note-dialog";
import { ActivityReportDialog } from "./dialogs/activity-report-dialog";
import { AttendanceListDialog } from "./dialogs/attendance-list-dialog";
import { SessionFormDialog } from "./dialogs/session-form-dialog";
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
import {
  useDeleteActivity,
  useAddActivityParticipants,
} from "../hooks/use-activities";
import {
  createConceptNote,
  updateConceptNote,
  getConceptNote,
  deleteConceptNote,
} from "../actions/concept-notes";
import {
  getActivityReport,
  deleteActivityReport,
} from "../actions/activity-reports";
import { useRouter } from "next/navigation";
import { usePageInfo } from "@/features/dashboard/contexts/navigation-context";
import toast from "react-hot-toast";

interface ActivityDetailsContainerProps {
  activity: Activity;
  organizations?: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityDetailsContainer({
  activity,
  organizations = [],
  clusters = [],
  projects = [],
}: ActivityDetailsContainerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConceptNoteDialogOpen, setIsConceptNoteDialogOpen] = useState(false);
  const [editingConceptNote, setEditingConceptNote] = useState<
    ConceptNote | undefined
  >(undefined);
  const [editingActivityReport, setEditingActivityReport] = useState<
    ActivityReport | undefined
  >(undefined);
  const [isActivityReportDialogOpen, setIsActivityReportDialogOpen] =
    useState(false);
  // Session dialog state
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string>();

  // Navigation setup
  const { setPageInfo } = usePageInfo();
  const router = useRouter();

  // Set page navigation info
  useEffect(() => {
    setPageInfo({
      title: activity.title,
      breadcrumbs: [
        { label: "Activities", href: "/dashboard/activities" },
        {
          label: activity.title,
          isCurrentPage: true,
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
      showBackButton: true,
      backHref: "/dashboard/activities",
    });
  }, [activity.title, setPageInfo]);

  // Attendance dialog state
  const [isAttendanceListDialogOpen, setIsAttendanceListDialogOpen] =
    useState(false);

  // Dialog states
  const [refreshKey, setRefreshKey] = useState(0);
  const [activityReportsRefreshKey, setActivityReportsRefreshKey] = useState(0);
  const deleteActivity = useDeleteActivity();
  const addActivityParticipants = useAddActivityParticipants();

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleCreateConceptNote = () => {
    setEditingConceptNote(undefined);
    setIsConceptNoteDialogOpen(true);
  };

  const handleEditConceptNote = async (conceptNoteId: string) => {
    try {
      const response = await getConceptNote(conceptNoteId);
      if (response.success && response.data) {
        setEditingConceptNote(response.data);
        setIsConceptNoteDialogOpen(true);
      } else {
        toast.error("Failed to load concept note for editing.");
      }
    } catch (error) {
      toast.error("An error occurred while loading the concept note.");
      console.error("Error loading concept note:", error);
    }
  };

  const handleDeleteConceptNote = async (conceptNoteId: string) => {
    try {
      const response = await deleteConceptNote(conceptNoteId);
      if (response.success) {
        toast.success("Concept note deleted successfully.");
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        toast.error("Failed to delete concept note.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the concept note.");
      console.error("Error deleting concept note:", error);
    }
  };

  const handleCreateActivityReport = () => {
    setEditingActivityReport(undefined);
    setIsActivityReportDialogOpen(true);
  };

  const handleEditActivityReport = async (activityReportId: string) => {
    try {
      const response = await getActivityReport(activityReportId);
      if (response.success && response.data) {
        setEditingActivityReport(response.data);
        setIsActivityReportDialogOpen(true);
      } else {
        toast.error("Failed to load activity report for editing.");
      }
    } catch (error) {
      toast.error("An error occurred while loading the activity report.");
      console.error("Error loading activity report:", error);
    }
  };

  const handleDeleteActivityReport = async (activityReportId: string) => {
    try {
      const response = await deleteActivityReport(activityReportId);
      if (response.success) {
        toast.success("Activity report deleted successfully.");
        setActivityReportsRefreshKey(prevKey => prevKey + 1);
      } else {
        toast.error("Failed to delete activity report.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the activity report.");
      console.error("Error deleting activity report:", error);
    }
  };

  const handleManageAttendance = (sessionId?: string) => {
    console.log("Managing attendance for session:", sessionId);
    setIsAttendanceListDialogOpen(true);
  };

  // Session handlers
  const handleCreateSession = () => {
    setEditingSessionId(undefined);
    setIsSessionDialogOpen(true);
  };

  const handleEditSession = (sessionId: string) => {
    setEditingSessionId(sessionId);
    setIsSessionDialogOpen(true);
  };

  const handleConceptNoteSubmit = async (data: NewConceptNote) => {
    try {
      if (editingConceptNote) {
        await updateConceptNote(editingConceptNote.id, data);
        toast.success("Concept note updated successfully.");
      } else {
        await createConceptNote(data);
        toast.success("Concept note created successfully.");
      }
      // Increment refresh key to force table to reload
      setRefreshKey(prevKey => prevKey + 1);
    } catch (_error) {
      toast.error(
        editingConceptNote
          ? "Failed to update concept note. Please try again."
          : "Failed to create concept note. Please try again."
      );
    }
  };

  const handleActivityReportSubmit = async () => {
    try {
      toast.success("Activity report saved successfully.");
      setActivityReportsRefreshKey(prevKey => prevKey + 1);
    } catch (_error) {
      toast.error("Failed to save activity report. Please try again.");
    }
  };

  const handleAttendanceListSubmit = async (
    participants: Partial<ActivityParticipant>[]
  ) => {
    try {
      await addActivityParticipants.mutateAsync({
        activityId: activity.id,
        participants: participants as Parameters<
          typeof addActivityParticipants.mutateAsync
        >[0]["participants"],
      });
      toast.success("Participants added successfully.");
      setIsAttendanceListDialogOpen(false); // Close the dialog
    } catch (_error) {
      toast.error("Failed to add participants. Please try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteActivity.mutateAsync({ id: activity.id });
      toast.success("Activity deleted successfully.");
      router.push("/dashboard/activities");
    } catch (_error) {
      toast.error("Failed to delete activity. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Activity Header */}
      <ActivityHeader
        activity={activity}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Activity Details Tabs */}
      <ActivityDetailsTabs
        activity={activity}
        onCreateConceptNote={handleCreateConceptNote}
        onEditConceptNote={handleEditConceptNote}
        onDeleteConceptNote={handleDeleteConceptNote}
        onCreateActivityReport={handleCreateActivityReport}
        onEditActivityReport={handleEditActivityReport}
        onDeleteActivityReport={handleDeleteActivityReport}
        onManageAttendance={handleManageAttendance}
        onCreateSession={handleCreateSession}
        onEditSession={handleEditSession}
        refreshKey={refreshKey}
        activityReportsRefreshKey={activityReportsRefreshKey}
      />

      {/* Edit Activity Dialog */}
      <ActivityFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        activity={activity}
        organizations={organizations}
        clusters={clusters}
        projects={projects}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              activity "{activity.title}" and all associated data.
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

      {/* Concept Note Dialog */}
      <ConceptNoteDialog
        open={isConceptNoteDialogOpen}
        onOpenChange={open => {
          setIsConceptNoteDialogOpen(open);
          if (!open) {
            setEditingConceptNote(undefined);
          }
        }}
        activityId={activity.id}
        conceptNote={editingConceptNote}
        onSubmit={handleConceptNoteSubmit}
      />

      {/* Activity Report Dialog */}
      <ActivityReportDialog
        open={isActivityReportDialogOpen}
        onOpenChange={open => {
          setIsActivityReportDialogOpen(open);
          if (!open) {
            setEditingActivityReport(undefined);
          }
        }}
        activity={activity}
        activityReport={editingActivityReport}
        onSubmit={handleActivityReportSubmit}
      />

      {/* Attendance List Dialog */}
      <AttendanceListDialog
        open={isAttendanceListDialogOpen}
        onOpenChange={setIsAttendanceListDialogOpen}
        activityId={activity.id}
        activity={
          activity.cluster_id && activity.project_id && activity.organization_id
            ? {
                cluster_id: activity.cluster_id,
                project_id: activity.project_id,
                organization_id: activity.organization_id,
              }
            : undefined
        }
        onSubmit={handleAttendanceListSubmit}
      />

      {/* Session Form Dialog */}
      <SessionFormDialog
        open={isSessionDialogOpen}
        onOpenChange={open => {
          setIsSessionDialogOpen(open);
          if (!open) {
            setEditingSessionId(undefined);
          }
        }}
        activityId={activity.id}
        sessionId={editingSessionId}
      />
    </div>
  );
}
