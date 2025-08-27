"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { type Participant } from "../../types/types";

interface BulkDeleteButtonProps {
  selectedRows: Participant[];
  onDelete: (participant: Participant) => void;
  onClearSelection: () => void;
}

export function BulkDeleteButton({
  selectedRows,
  onDelete,
  onClearSelection,
}: BulkDeleteButtonProps) {
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    selectedRows.forEach(participant => onDelete(participant));
    onClearSelection();
  };

  return (
    selectedRows.length > 0 && (
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          className="flex items-center gap-2"
        >
          <Trash className="h-4 w-4" />
          Delete Selected ({selectedRows.length})
        </Button>
      </div>
    )
  );
}
