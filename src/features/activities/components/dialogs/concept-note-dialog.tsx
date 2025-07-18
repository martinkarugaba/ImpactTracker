"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Activity } from "../../types/types";

interface ConceptNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  onSave: (conceptNote: string) => void;
}

export function ConceptNoteDialog({
  open,
  onOpenChange,
  activity,
  onSave,
}: ConceptNoteDialogProps) {
  const [conceptNote, setConceptNote] = useState(activity.conceptNote || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(conceptNote);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save concept note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {activity.conceptNote ? "Edit" : "Add"} Concept Note
          </DialogTitle>
          <DialogDescription>
            Provide a detailed concept note explaining the purpose, objectives,
            and methodology for "{activity.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="concept-note">Concept Note</Label>
            <Textarea
              id="concept-note"
              placeholder="Enter the concept note for this activity..."
              value={conceptNote}
              onChange={e => setConceptNote(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !conceptNote.trim()}
          >
            {isLoading ? "Saving..." : "Save Concept Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
