"use client";

import { Button } from "@/components/ui/button";
import { type Project } from "@/features/projects/types";
import { type Organization } from "@/features/organizations/types";
import { type Participant } from "../../types/types";
import { type ParticipantFormValues } from "../participant-form";
import { PaginationControls } from "./pagination-controls";
import { TableContent } from "./table-content";
import { useTableState } from "./use-table-state";

interface ParticipantsDataTableProps {
  data: Participant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedProject: Project | null;
  selectedOrg: Organization | null;
  isLoading: boolean;
  clusterId: string;
  onPaginationChange: (page: number, limit: number) => void;
  onPageChange: (page: number) => void;
  onSearchChange?: (search: string) => void;
  searchTerm?: string;
  onAddParticipant: () => void;
  onEditParticipant: (data: ParticipantFormValues, id: string) => void;
  onDeleteParticipant: (id: string) => void;
  onViewParticipant?: (participant: Participant) => void;
  onDeleteMultipleParticipants: (ids: string[]) => void;
  onExportData?: () => void;
  onImport?: (data: unknown[]) => void;
  onFixOrganizations?: () => void;
  columnVisibility?: Record<string, boolean>;
}

export function ParticipantsDataTable({
  data,
  pagination,
  selectedProject: _selectedProject,
  selectedOrg: _selectedOrg,
  isLoading,
  clusterId: _clusterId,
  onPaginationChange,
  onPageChange,
  onSearchChange: _onSearchChange,
  searchTerm: _searchTerm,
  onAddParticipant: _onAddParticipant,
  onEditParticipant,
  onDeleteParticipant,
  onViewParticipant,
  onDeleteMultipleParticipants,
  onExportData: _onExportData,
  onImport: _onImport,
  onFixOrganizations: _onFixOrganizations,
  columnVisibility,
}: ParticipantsDataTableProps) {
  const {
    selectedRows,
    rowSelectionState,
    handleClearSelection,
    setRowSelectionState,
  } = useTableState(undefined, data);

  return (
    <div className="space-y-4">
      {/* Table Content */}
      <TableContent
        data={data}
        pagination={pagination}
        isLoading={isLoading}
        searchValue=""
        onSearchChange={() => {}}
        onEditParticipant={onEditParticipant}
        onDeleteParticipant={onDeleteParticipant}
        onViewParticipant={onViewParticipant}
        actionButtons={null} // No longer needed since actions moved to parent
        columnVisibility={columnVisibility}
        rowSelection={rowSelectionState}
        onRowSelectionStateChange={setRowSelectionState}
      />

      {/* Action Buttons for Selected Rows */}
      {selectedRows.length > 0 && (
        <div className="bg-muted flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">
            {selectedRows.length} participant(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (onDeleteMultipleParticipants) {
                  onDeleteMultipleParticipants(selectedRows.map(row => row.id));
                  handleClearSelection();
                }
              }}
            >
              Delete Selected
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        selectedCount={selectedRows.length}
        onPaginationChange={onPaginationChange}
        onPageChange={onPageChange}
      />
    </div>
  );
}
