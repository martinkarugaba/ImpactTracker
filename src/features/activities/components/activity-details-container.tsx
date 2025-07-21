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
  CheckCircle,
  Clock,
  AlertCircle,
  CalendarCheck,
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
import { cn } from "@/lib/utils";

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

  // Get color theme based on activity type
  const getActivityTypeColor = () => {
    const typeColors = {
      meeting: "from-blue-50 to-blue-100 border-blue-200",
      workshop: "from-indigo-50 to-indigo-100 border-indigo-200",
      training: "from-violet-50 to-violet-100 border-violet-200",
      field_visit: "from-green-50 to-green-100 border-green-200",
      conference: "from-amber-50 to-amber-100 border-amber-200",
      seminar: "from-teal-50 to-teal-100 border-teal-200",
      consultation: "from-cyan-50 to-cyan-100 border-cyan-200",
      assessment: "from-rose-50 to-rose-100 border-rose-200",
      monitoring: "from-emerald-50 to-emerald-100 border-emerald-200",
      evaluation: "from-fuchsia-50 to-fuchsia-100 border-fuchsia-200",
      community_engagement: "from-lime-50 to-lime-100 border-lime-200",
      capacity_building: "from-sky-50 to-sky-100 border-sky-200",
      advocacy: "from-orange-50 to-orange-100 border-orange-200",
      research: "from-purple-50 to-purple-100 border-purple-200",
      other: "from-gray-50 to-gray-100 border-gray-200",
    };

    return (
      typeColors[activity.type as keyof typeof typeColors] || typeColors.other
    );
  };

  // Get accent color based on activity status
  const getStatusColor = () => {
    const statusColors = {
      planned: { bg: "bg-blue-500", text: "text-blue-800", icon: Clock },
      ongoing: { bg: "bg-amber-500", text: "text-amber-800", icon: Clock },
      completed: {
        bg: "bg-green-500",
        text: "text-green-800",
        icon: CheckCircle,
      },
      cancelled: { bg: "bg-red-500", text: "text-red-800", icon: AlertCircle },
      postponed: {
        bg: "bg-gray-500",
        text: "text-gray-800",
        icon: CalendarCheck,
      },
    };

    return (
      statusColors[activity.status as keyof typeof statusColors] ||
      statusColors.planned
    );
  };

  const activityTypeClass = getActivityTypeColor();
  const statusColor = getStatusColor();
  const StatusIcon = statusColor.icon;

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

      {/* Activity Header with color based on type */}
      <div
        className={cn(
          "rounded-lg border bg-gradient-to-br p-1",
          activityTypeClass
        )}
      >
        <ActivityHeader activity={activity} />
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
          <StatusIcon className="mr-1.5 h-4 w-4" />
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleEdit}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Activity
        </Button>
        <Button
          onClick={handleDelete}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Activity
        </Button>
      </div>

      {/* Additional Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleCreateConceptNote}
          className="border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
          variant="outline"
        >
          <FileText className="mr-2 h-4 w-4" />
          Create Concept Note
        </Button>
        <Button
          onClick={handleCreateActivityReport}
          className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          variant="outline"
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Update Activity Report
        </Button>
        <Button
          onClick={handleManageAttendance}
          className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
          variant="outline"
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Attendance
        </Button>
      </div>

      {/* Activity Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50/50 to-transparent p-1">
            <ActivityInformationCard activity={activity} />
          </div>
          <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50/50 to-transparent p-1">
            <ActivityNotesCard activity={activity} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-transparent p-1">
            <AttendanceListCard activity={activity} />
          </div>
          <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent p-1">
            <ActivityReportCard activity={activity} />
          </div>
        </div>
      </div>

      {/* Concept Notes Table */}
      <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-transparent p-3">
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
