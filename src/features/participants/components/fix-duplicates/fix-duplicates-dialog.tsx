"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as UIDialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { useAtomValue } from "jotai";
import { duplicateGroupsAtom } from "./atoms";
import { useDuplicatesActions } from "./hooks";
import { LoadingState } from "./loading-state";
import { EmptyState } from "./empty-state";
import { DuplicateGroupCard } from "./duplicate-group-card";
import { SelectionSummary } from "./selection-summary";
import { DialogHeader as CustomDialogHeader } from "./dialog-header";
import { DialogFooter as CustomDialogFooter } from "./dialog-footer";
import { DeletionProgress } from "./deletion-progress";

interface FixDuplicatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteCompleted?: (deletedCount: number) => void;
}

export function FixDuplicatesDialog({
  open,
  onOpenChange,
  onDeleteCompleted,
}: FixDuplicatesDialogProps) {
  const duplicateGroups = useAtomValue(duplicateGroupsAtom);
  const {
    loadDuplicates,
    duplicatesData,
    isLoading,
    isProcessing,
    selectedForDeletion,
  } = useDuplicatesActions();

  // Load duplicates when dialog opens
  useEffect(() => {
    if (open && !duplicatesData) {
      loadDuplicates();
    }
  }, [open, duplicatesData, loadDuplicates]);

  // Determine if we should show wide layout (when showing duplicate groups)
  const showWideLayout = duplicateGroups.length > 0 && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex max-h-[85vh] flex-col ${
          showWideLayout ? "!w-[80vw] !max-w-none" : "w-full max-w-7xl"
        }`}
        style={
          showWideLayout ? { width: "80vw", maxWidth: "1300px" } : undefined
        }
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Duplicate Participants
          </DialogTitle>
          <DialogDescription>
            {duplicateGroups.length > 0 ? (
              <>
                Found {duplicateGroups.length} groups of potential duplicates.
                Review and select participants to remove.
              </>
            ) : (
              "No duplicate participants found based on name and contact information."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <LoadingState />
          <EmptyState />

          {duplicateGroups.length > 0 && !isLoading && (
            <div className="space-y-6 pr-4">
              <CustomDialogHeader />

              {duplicateGroups.map((group, index) => (
                <DuplicateGroupCard
                  key={group.key}
                  group={group}
                  index={index}
                />
              ))}

              <SelectionSummary />
            </div>
          )}
        </div>

        <UIDialogFooter className="flex-shrink-0">
          <CustomDialogFooter
            onClose={() => onOpenChange(false)}
            onDeleteCompleted={onDeleteCompleted}
          />
        </UIDialogFooter>
      </DialogContent>

      {/* Deletion Progress Overlay */}
      <DeletionProgress
        selectedCount={selectedForDeletion.length}
        progress={
          isProcessing
            ? {
                current: 0, // This would be updated by the actual deletion process
                total: selectedForDeletion.length,
                percentage: 0,
              }
            : undefined
        }
        onClose={() => {
          // Refresh data after deletion
          loadDuplicates();
        }}
      />
    </Dialog>
  );
}
