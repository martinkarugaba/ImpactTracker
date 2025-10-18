"use client";

import type { ActivityParticipant } from "../../types/types";
import { type Participant } from "@/features/participants/types/types";
import toast from "react-hot-toast";
import { ParticipantSelectionDialog } from "@/components/shared/participant-selection/participant-selection-dialog";

interface AttendanceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  sessionId?: string;
  activity?: {
    cluster_id: string;
    project_id: string;
    organization_id: string;
  };
  participants?: ActivityParticipant[];
  onSubmit: (
    participants: Partial<ActivityParticipant>[],
    sessionId?: string
  ) => Promise<void>;
}

export function AttendanceListDialog({
  open,
  onOpenChange,
  activityId: _activityId,
  sessionId,
  activity,
  participants: _existingParticipants = [],
  onSubmit,
}: AttendanceListDialogProps) {
  const handleAddExistingParticipants = async (
    selectedParticipants: Participant[],
    attendanceStatus: "invited" | "attended"
  ) => {
    try {
      const participantData = selectedParticipants.map(participant => ({
        participant_id: String(participant.id), // Ensure always string
        participantName: `${participant.firstName} ${participant.lastName}`,
        role: "participant",
        attendance_status: attendanceStatus, // Use the selected attendance status
        feedback: undefined,
      }));

      await onSubmit(participantData, sessionId);
      toast.success(
        `${selectedParticipants.length} participant${selectedParticipants.length !== 1 ? "s" : ""} ${sessionId ? "added to session" : "added to activity"} successfully`
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding participants:", error);
      toast.error("Failed to add participants. Please try again.");
    }
  };

  return (
    <ParticipantSelectionDialog
      open={open}
      onOpenChange={onOpenChange}
      onParticipantsSelected={handleAddExistingParticipants}
      context={{
        cluster_id: activity?.cluster_id || "",
        project_id: activity?.project_id,
        organization_id: activity?.organization_id,
      }}
      title={
        sessionId
          ? "Add Participants to Session"
          : "Add Participants to Activity"
      }
      description={
        sessionId
          ? "Select participants to add to this specific session. Choose whether they were invited or have attended."
          : "Select participants to add to this activity. They will be available for all sessions."
      }
      showAttendanceStatus={!!sessionId} // Only show attendance status selection for sessions
      defaultAttendanceStatus="invited" // Default to "invited" for sessions
    />
  );
}
