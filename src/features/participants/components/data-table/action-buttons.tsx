"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Plus } from "lucide-react";
import { BulkDeleteButton } from "./bulk-delete-button";
import { ImportParticipants } from "../import/import-participants";
import { type Participant } from "../../types/types";

interface ActionButtonsProps {
  clusterId: string;
  selectedRows: Participant[];
  onAddParticipant: () => void;
  onDeleteParticipant: (id: string) => void;
  onClearSelection: () => void;
  onExportData?: () => void;
  onImport?: (data: unknown[]) => void;
  onFixOrganizations?: () => void;
}

export function ActionButtons({
  clusterId,
  selectedRows,
  onAddParticipant,
  onDeleteParticipant,
  onClearSelection,
  onExportData,
  onImport,
  onFixOrganizations,
}: ActionButtonsProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      {onImport && (
        <ImportParticipants
          clusterId={clusterId}
          onImportComplete={() => {
            onImport([]);
          }}
        />
      )}

      {onExportData && (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      )}

      {onFixOrganizations && (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={onFixOrganizations}
        >
          <span>Fix Organizations</span>
        </Button>
      )}

      <BulkDeleteButton
        selectedRows={selectedRows}
        onDelete={(participant: Participant) => {
          onDeleteParticipant(participant.id);
        }}
        onClearSelection={onClearSelection}
      />

      <Button
        size="sm"
        className="flex items-center gap-1"
        onClick={onAddParticipant}
      >
        <Plus className="h-4 w-4" />
        <span>Add Participant</span>
      </Button>

      {/* Export Coming Soon Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Functionality</DialogTitle>
            <DialogDescription>
              Export functionality is coming soon! We're working on implementing
              secure export features with proper permissions and audit logging.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
