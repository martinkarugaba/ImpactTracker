"use client";

import * as React from "react";
import { type Project } from "@/features/projects/types";
import { type Organization } from "@/features/organizations/types";
import { type Participant } from "../../types/types";
import { PaginationControls } from "./pagination-controls";
import { TableContent } from "./table-content";
import { useTableState } from "./use-table-state";

// Define the ref interface for external access
export interface ParticipantsDataTableRef {
  clearSelection: () => void;
}

interface ParticipantsDataTableProps {
  data: Participant[];
  clusterId: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedProject: Project | null;
  selectedOrg: Organization | null;
  isLoading: boolean;
  isFiltering?: boolean;
  onPaginationChange: (page: number, pageSize: number) => void;
  onPageChange: (page: number) => void;
  onAddParticipant: () => void;
  onEditParticipant: (data: unknown, id: string) => void;
  onDeleteParticipant: (id: string) => void;
  onDeleteMultipleParticipants?: (ids: string[]) => void;
  onViewParticipant?: (participant: Participant) => void;
  onExportData: () => void;
  onImport: (data: unknown[]) => void;
  columnVisibility?: Partial<Record<string, boolean>>;
  onSelectedRowsChange?: (selectedRows: Participant[]) => void;
}

export const ParticipantsDataTable = React.forwardRef<
  ParticipantsDataTableRef,
  ParticipantsDataTableProps
>(function ParticipantsDataTable(
  {
    data,
    clusterId: _clusterId,
    pagination,
    selectedProject: _selectedProject,
    selectedOrg: _selectedOrg,
    isLoading,
    isFiltering = false,
    onPaginationChange,
    onPageChange,
    onAddParticipant: _onAddParticipant,
    onEditParticipant,
    onDeleteParticipant,
    onDeleteMultipleParticipants: _onDeleteMultipleParticipants,
    onViewParticipant,
    onExportData: _onExportData,
    onImport: _onImport,
    columnVisibility,
    onSelectedRowsChange,
  },
  ref
) {
  const {
    selectedRows,
    rowSelectionState,
    handleClearSelection,
    setRowSelectionState,
  } = useTableState("", data);

  // Expose clear selection function via ref
  React.useImperativeHandle(
    ref,
    () => ({
      clearSelection: handleClearSelection,
    }),
    [handleClearSelection]
  );

  // Notify parent about selected rows changes
  React.useEffect(() => {
    if (onSelectedRowsChange) {
      onSelectedRowsChange(selectedRows);
    }
  }, [selectedRows, onSelectedRowsChange]);

  return (
    <div className="space-y-4">
      {/* Table Content */}
      <TableContent
        data={data}
        pagination={pagination}
        isLoading={isLoading}
        isFiltering={isFiltering}
        searchValue=""
        onSearchChange={() => {}}
        onEditParticipant={onEditParticipant}
        onDeleteParticipant={onDeleteParticipant}
        onViewParticipant={onViewParticipant}
        actionButtons={null} // No longer needed since actions moved to parent
        columnVisibility={columnVisibility as Record<string, boolean>}
        rowSelection={rowSelectionState}
        onRowSelectionStateChange={setRowSelectionState}
      />

      {/* Bottom Pagination Controls */}
      <PaginationControls
        pagination={pagination}
        selectedCount={selectedRows.length}
        onPaginationChange={onPaginationChange}
        onPageChange={onPageChange}
        isLoading={isLoading}
        position="bottom"
      />
    </div>
  );
});
