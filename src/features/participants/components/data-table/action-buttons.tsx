"use client";

import { Button } from "@/components/ui/button";
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
          onClick={onExportData}
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
    </>
  );
}
