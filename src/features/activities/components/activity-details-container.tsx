"use client";

import { useState } from "react";
import { Activity, AttendanceRecord, BudgetItem } from "../types/types";
import { useActivities } from "../hooks/use-activities";
import { updateActivityConceptNote, updateActivityReport } from "../actions";
import { toast } from "react-hot-toast";

// Import dialogs
import { ActivityFormDialog } from "./forms/activity-form-dialog";
import { ConceptNoteDialog } from "./dialogs/concept-note-dialog";
import { ActivityReportDialog } from "./dialogs/activity-report-dialog";
import { AttendanceDialog } from "./dialogs/attendance-dialog";

// Import components
import { ActivityHeader, StatusBadges } from "./details";
import {
  KeyInformationCards,
  ActivityInformationCard,
  ActivityNotesCard,
  ActivityReportCard,
  AttendanceListCard,
} from "./cards";
import { ConceptNotesTable } from "./concept-notes/concept-notes-table";

interface ActivityDetailsContainerProps {
  activity: Activity;
  organizations: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityDetailsContainer({
  activity,
  organizations,
  clusters = [],
  projects = [],
}: ActivityDetailsContainerProps) {
  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConceptNoteDialogOpen, setIsConceptNoteDialogOpen] = useState(false);
  const [isActivityReportDialogOpen, setIsActivityReportDialogOpen] =
    useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

  const { refetch } = useActivities();

  // Handler functions for dialogs
  const handleConceptNoteSave = async (conceptNoteData: {
    title: string;
    content: string;
    charge_code?: string;
    activity_lead?: string;
    submission_date?: Date;
    project_summary?: string;
    methodology?: string;
    requirements?: string;
    participant_details?: string;
    budget_items?: BudgetItem[];
    budget_notes?: string;
  }) => {
    try {
      const result = await updateActivityConceptNote(
        activity.id,
        conceptNoteData
      );
      if (result.success) {
        toast.success("Concept note updated successfully");
        setIsConceptNoteDialogOpen(false);
        refetch();
      } else {
        toast.error(result.error || "Failed to update concept note");
      }
    } catch (_error) {
      toast.error("Failed to update concept note");
    }
  };

  const handleActivityReportSave = async (reportData: {
    status: string;
    outcomes: string;
    challenges: string;
    recommendations: string;
    actualCost?: number;
  }) => {
    try {
      const result = await updateActivityReport(activity.id, reportData);
      if (result.success) {
        toast.success("Activity report updated successfully");
        setIsActivityReportDialogOpen(false);
        refetch();
      } else {
        toast.error(result.error || "Failed to update activity report");
      }
    } catch (_error) {
      toast.error("Failed to update activity report");
    }
  };

  const handleAttendanceSave = async (_attendanceList: AttendanceRecord[]) => {
    try {
      // The attendance dialog will handle the CRUD operations internally
      toast.success("Attendance updated successfully");
      setIsAttendanceDialogOpen(false);
      refetch();
    } catch (_error) {
      toast.error("Failed to update attendance");
    }
  };

  return (
    <div className="mt-2 space-y-6">
      {/* Header */}
      <ActivityHeader
        activity={activity}
        onEdit={() => setIsEditDialogOpen(true)}
      />

      {/* Status and Type Badges */}
      <StatusBadges status={activity.status} type={activity.type} />

      {/* Key Information Cards */}
      <KeyInformationCards
        startDate={activity.startDate?.toString() || ""}
        endDate={activity.endDate?.toString() || null}
        budget={activity.budget}
        numberOfParticipants={activity.numberOfParticipants}
      />

      {/* Activity Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityInformationCard
          organizationId={activity.organization_id}
          clusterId={activity.cluster_id}
          projectId={activity.project_id}
          venue={activity.venue}
          startDate={activity.startDate?.toString() || ""}
          endDate={activity.endDate?.toString() || null}
          organizations={organizations}
          clusters={clusters}
          projects={projects}
        />

        <ActivityNotesCard
          objectives={
            typeof activity.objectives === "string" ? activity.objectives : null
          }
          createdAt={activity.created_at?.toString() || null}
          updatedAt={activity.updated_at?.toString() || null}
          onEdit={() => setIsEditDialogOpen(true)}
        />
      </div>

      {/* Concept Notes Section */}
      <ConceptNotesTable
        conceptNotes={activity.conceptNote ? [activity.conceptNote] : []}
        onEditNote={() => setIsConceptNoteDialogOpen(true)}
        onCreateNote={() => setIsConceptNoteDialogOpen(true)}
      />

      {/* Activity Report Section */}
      <ActivityReportCard
        activity={activity}
        onEdit={() => setIsActivityReportDialogOpen(true)}
      />

      {/* Attendance List Section */}
      <AttendanceListCard
        attendanceList={activity.attendanceList || null}
        onManageAttendance={() => setIsAttendanceDialogOpen(true)}
      />

      {/* Dialogs */}
      <ActivityFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        activity={activity}
        organizations={organizations}
        clusters={clusters}
        projects={projects}
      />

      <ConceptNoteDialog
        open={isConceptNoteDialogOpen}
        onOpenChange={setIsConceptNoteDialogOpen}
        activity={activity}
        onSave={handleConceptNoteSave}
      />

      <ActivityReportDialog
        open={isActivityReportDialogOpen}
        onOpenChange={setIsActivityReportDialogOpen}
        activity={activity}
        onSave={handleActivityReportSave}
      />

      <AttendanceDialog
        open={isAttendanceDialogOpen}
        onOpenChange={setIsAttendanceDialogOpen}
        activity={activity}
        onSave={handleAttendanceSave}
      />
    </div>
  );
}
