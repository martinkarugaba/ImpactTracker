"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAtomValue } from "jotai";
import {
  selectedForDeletionAtom,
  isProcessingAtom,
  hasDuplicatesAtom,
} from "./atoms";
import { useDuplicatesActions } from "./hooks";

interface DialogFooterProps {
  onClose: () => void;
  onDeleteCompleted?: (count: number) => void;
}

export function DialogFooter({
  onClose,
  onDeleteCompleted,
}: DialogFooterProps) {
  const selectedForDeletion = useAtomValue(selectedForDeletionAtom);
  const isProcessing = useAtomValue(isProcessingAtom);
  const hasDuplicates = useAtomValue(hasDuplicatesAtom);
  const { handleDeleteSelected } = useDuplicatesActions();

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose}>
        {hasDuplicates ? "Cancel" : "Close"}
      </Button>
      {hasDuplicates && (
        <Button
          variant="destructive"
          onClick={() => handleDeleteSelected(onDeleteCompleted)}
          disabled={selectedForDeletion.length === 0 || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Selected"
          )}
          {selectedForDeletion.length > 0 && ` (${selectedForDeletion.length})`}
        </Button>
      )}
    </div>
  );
}
