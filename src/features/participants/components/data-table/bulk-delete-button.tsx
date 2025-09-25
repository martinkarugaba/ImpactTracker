"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash, AlertTriangle, Users } from "lucide-react";
import { type Participant } from "../../types/types";
import { useState } from "react";

interface BulkDeleteButtonProps {
  selectedRows: Participant[];
  onDelete: (participant: Participant) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkDeleteButton({
  selectedRows,
  onDelete,
  onClearSelection,
  isLoading = false,
}: BulkDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    setIsDeleting(true);
    try {
      // Delete each participant with a small delay for progress feedback
      for (let i = 0; i < selectedRows.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
        onDelete(selectedRows[i]);
      }
      onClearSelection();
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedRows.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isLoading || isDeleting}
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            {isDeleting
              ? "Deleting..."
              : `Delete Selected (${selectedRows.length})`}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Bulk Deletion
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to permanently delete{" "}
                  <strong>{selectedRows.length}</strong> participants from the
                  database.
                </p>

                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <Users className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium">This action cannot be undone</p>
                    <p className="text-red-600 dark:text-red-400">
                      All participant data will be permanently removed
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please confirm that you want to proceed with this deletion.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
