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
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteVSLA } from "../../actions/vslas";
import { VSLA } from "../../types";
import { Trash2 } from "lucide-react";

interface DeleteVSLADialogProps {
  vsla: VSLA;
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void | Promise<void>;
}

export function DeleteVSLADialog({
  vsla,
  children,
  isOpen: controlledOpen,
  onClose,
  onSuccess,
}: DeleteVSLADialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOpen !== undefined
      ? (value: boolean) => {
          if (!value) onClose?.();
        }
      : setInternalOpen;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteVSLA(vsla.id);
      if (result.success) {
        setOpen(false);
        onSuccess?.();
      } else {
        console.error("Failed to delete VSLA:", result.error);
        // You might want to show an error message
      }
    } catch (error) {
      console.error("Error deleting VSLA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete VSLA</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{vsla.name}"? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
