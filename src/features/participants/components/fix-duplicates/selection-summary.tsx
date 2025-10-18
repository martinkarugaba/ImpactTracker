"use client";

import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useAtomValue } from "jotai";
import { selectedForDeletionAtom, allParticipantIdsAtom } from "./atoms";
import { useDuplicatesActions } from "./hooks";

export function SelectionSummary() {
  const selectedForDeletion = useAtomValue(selectedForDeletionAtom);
  const allParticipantIds = useAtomValue(allParticipantIdsAtom);
  const { handleSelectAll, isAllSelected } = useDuplicatesActions();

  if (selectedForDeletion.length === 0) return null;

  return (
    <div className="sticky bottom-0 rounded-lg border bg-muted p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-600" />
          <span className="font-medium">
            {selectedForDeletion.length} of {allParticipantIds.length}{" "}
            participant(s) selected for deletion
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(false)}
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(true)}
            disabled={isAllSelected}
          >
            Select All
          </Button>
        </div>
      </div>
    </div>
  );
}
