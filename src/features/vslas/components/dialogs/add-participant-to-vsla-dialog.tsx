"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { VSLAParticipantSelectionDialog } from "@/components/shared/vsla-participant-selection-dialog";
import { createVSLAMember } from "../../actions/vsla-members";
import { Participant } from "@/features/participants/types/types";
import { toast } from "sonner";

interface AddParticipantToVSLADialogProps {
  vslaId: string;
  clusterId: string;
  onSuccess?: () => void;
}

export function AddParticipantToVSLADialog({
  vslaId,
  clusterId,
  onSuccess,
}: AddParticipantToVSLADialogProps) {
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);

  const handleParticipantsSelected = async (participants: Participant[]) => {
    try {
      const promises = participants.map(participant =>
        createVSLAMember({
          vsla_id: vslaId,
          first_name: participant.firstName,
          last_name: participant.lastName,
          phone: participant.contact,
          email: "", // Participants don't have email in the schema
          role: "member",
          joined_date: new Date(),
          total_savings: 0,
          total_loans: 0,
          status: "active",
        })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(result => result.success).length;

      if (successful > 0) {
        toast.success(
          `Successfully added ${successful} participant${
            successful > 1 ? "s" : ""
          } to VSLA`
        );
        onSuccess?.();
      } else {
        toast.error("Failed to add participants to VSLA");
      }
    } catch (error) {
      console.error("Error adding participants to VSLA:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsSelectionDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Add Participants
      </Button>

      <VSLAParticipantSelectionDialog
        open={isSelectionDialogOpen}
        onOpenChange={setIsSelectionDialogOpen}
        onParticipantsSelected={handleParticipantsSelected}
        clusterId={clusterId}
        title="Add Participants to VSLA"
        description="Select existing participants to add as members to this VSLA."
      />
    </>
  );
}
