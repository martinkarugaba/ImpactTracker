"use client";

import { useState } from "react";
import { Activity } from "../types/types";
import type {
  ConceptNote,
  NewConceptNote,
  ActivityParticipant,
} from "../types/types";
import { ActivityHeader } from "./details/activity-header";
import { ActivityInformationCard } from "./cards/activity-information-card";
import { ActivityNotesCard } from "./cards/activity-notes-card";
import { ConceptNotesTable } from "./concept-notes/concept-notes-table";
import { AttendanceListCard } from "./cards/attendance-list-card";
import { ActivityReportCard } from "./cards/activity-report-card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Users,
  ClipboardList,
} from "lucide-react";
import { ActivityFormDialog } from "./forms/activity-form-dialog";
import { ConceptNoteDialog } from "./dialogs/concept-note-dialog";
import { ActivityReportDialog } from "./dialogs/activity-report-dialog";
import { AttendanceListDialog } from "./dialogs/attendance-list-dialog";
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
import {
  createConceptNote,
  updateConceptNote,
  getConceptNote,
  deleteConceptNote,
} from "../actions/concept-notes";
import { bulkUpdateActivityParticipants } from "../actions/participants";
import { updateActivity } from "../actions";
import { useRouter } from "next/navigation";
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
  const [isActivityReportDialogOpen, setIsActivityReportDialogOpen] =
    useState(false);
  const [isAttendanceListDialogOpen, setIsAttendanceListDialogOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const deleteActivity = useDeleteActivity();
  const router = useRouter();

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
    setIsActivityReportDialogOpen(true);
  };

  const handleManageAttendance = () => {
    setIsAttendanceListDialogOpen(true);
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

  const handleActivityReportSubmit = async (data: Partial<Activity>) => {
    try {
      await updateActivity(activity.id, data);
      toast.success("Activity report saved successfully.");
    } catch (_error) {
      toast.error("Failed to save activity report. Please try again.");
    }
  };

  const handleAttendanceListSubmit = async (
    participants: Partial<ActivityParticipant>[]
  ) => {
    try {
      await bulkUpdateActivityParticipants(
        activity.id,
        participants as Parameters<typeof bulkUpdateActivityParticipants>[1]
      );
      toast.success("Attendance list updated successfully.");
    } catch (_error) {
      toast.error("Failed to update attendance list. Please try again.");
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
      <ActivityHeader activity={activity} />

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleEdit} variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Activity
        </Button>
        <Button
          onClick={handleDelete}
          variant="outline"
          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Activity
        </Button>
      </div>

      {/* Additional Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCreateConceptNote} variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Create Concept Note
        </Button>
        <Button onClick={handleCreateActivityReport} variant="outline">
          <ClipboardList className="mr-2 h-4 w-4" />
          Update Activity Report
        </Button>
        <Button onClick={handleManageAttendance} variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Manage Attendance
        </Button>
      </div>

      {/* Activity Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <ActivityInformationCard activity={activity} />
          <ActivityNotesCard activity={activity} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AttendanceListCard activity={activity} />
          <ActivityReportCard activity={activity} />
        </div>
      </div>

      {/* Concept Notes Table */}
      <div className="space-y-6">
        <ConceptNotesTable
          key={`concept-notes-${activity.id}-${refreshKey}`}
          activityId={activity.id}
          onCreateConceptNote={handleCreateConceptNote}
          onEditConceptNote={handleEditConceptNote}
          onDeleteConceptNote={handleDeleteConceptNote}
          refreshKey={refreshKey}
        />
      </div>

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
        onOpenChange={setIsActivityReportDialogOpen}
        activity={activity}
        onSubmit={handleActivityReportSubmit}
      />

      {/* Attendance List Dialog */}
      <AttendanceListDialog
        open={isAttendanceListDialogOpen}
        onOpenChange={setIsAttendanceListDialogOpen}
        activityId={activity.id}
        onSubmit={handleAttendanceListSubmit}
      />
    </div>
  );
}
