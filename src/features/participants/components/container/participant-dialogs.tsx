"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ImportParticipants } from "../import/import-participants";
import { type Participant } from "../../types/types";
import toast from "react-hot-toast";

interface ParticipantDialogsProps {
  clusterId: string;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: (open: boolean) => void;
  editingParticipant: Participant | null;
  setEditingParticipant: (participant: Participant | null) => void;
  deletingParticipant: Participant | null;
  setDeletingParticipant: (participant: Participant | null) => void;
}

export function ParticipantDialogs({
  clusterId,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isImportDialogOpen,
  setIsImportDialogOpen,
  editingParticipant,
  setEditingParticipant,
  deletingParticipant,
  setDeletingParticipant,
}: ParticipantDialogsProps) {
  const confirmDelete = async () => {
    if (!deletingParticipant) return;

    try {
      // TODO: Implement delete participant action
      toast.success("Participant deleted successfully.");
      setDeletingParticipant(null);
    } catch (_error) {
      toast.error("Failed to delete participant. Please try again.");
    }
  };

  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingParticipant}
        onOpenChange={open => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingParticipant(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParticipant ? "Edit Participant" : "Add New Participant"}
            </DialogTitle>
            <DialogDescription>
              {editingParticipant
                ? "Update participant information below."
                : "Fill in the participant details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-muted-foreground text-center">
              Participant form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Participants</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import multiple participants at once.
            </DialogDescription>
          </DialogHeader>
          <ImportParticipants
            clusterId={clusterId}
            onImportComplete={async () => {
              setIsImportDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingParticipant}
        onOpenChange={open => {
          if (!open) setDeletingParticipant(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              participant "{deletingParticipant?.firstName}{" "}
              {deletingParticipant?.lastName}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
