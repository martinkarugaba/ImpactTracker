"use client";

import { ActivityParticipant } from "../../types/types";
import { type Participant } from "@/features/participants/types/types";
import toast from "react-hot-toast";
import { ParticipantSelectionDialog } from "../participant-selection";

interface AttendanceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  activity?: {
    cluster_id: string;
    project_id: string;
    organization_id: string;
  };
  participants?: ActivityParticipant[];
  onSubmit: (participants: Partial<ActivityParticipant>[]) => Promise<void>;
}

export function AttendanceListDialog({
  open,
  onOpenChange,
  activityId,
  activity,
  participants: _existingParticipants = [],
  onSubmit,
}: AttendanceListDialogProps) {
  const handleAddExistingParticipants = async (
    selectedParticipants: Participant[]
  ) => {
    try {
      const participantData = selectedParticipants.map(participant => ({
        activity_id: activityId,
        participant_id: participant.id,
        participantName: `${participant.firstName} ${participant.lastName}`,
        role: "participant",
        attendance_status: "invited",
        feedback: undefined,
      }));

      await onSubmit(participantData);
      toast.success(
        `${selectedParticipants.length} participant${selectedParticipants.length !== 1 ? "s" : ""} added successfully`
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
      activity={activity}
    />
  );
}
