"use client";

import { type Project } from "@/features/projects/types";
import { type Organization } from "@/features/organizations/types";
import { type Participant } from "../../types/types";
import { type ParticipantFormValues } from "../participant-form";
import { ActionButtons } from "./action-buttons";
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
  onDeleteMultipleParticipants: (ids: string[]) => void;
  onExportData?: () => void;
  onImport?: (data: unknown[]) => void;
  onFixOrganizations?: () => void;
}

export function ParticipantsDataTable({
  data,
  pagination,
  selectedProject: _selectedProject,
  selectedOrg: _selectedOrg,
  isLoading,
  clusterId,
  onPaginationChange,
  onPageChange,
  onSearchChange,
  searchTerm,
  onAddParticipant,
  onEditParticipant,
  onDeleteParticipant,
  onDeleteMultipleParticipants: _onDeleteMultipleParticipants,
  onExportData,
  onImport,
  onFixOrganizations,
}: ParticipantsDataTableProps) {
  const { search, selectedRows, handleSearchChange, handleClearSelection } =
    useTableState(searchTerm);

  const handleSearchChangeWithCallback = (value: string) => {
    handleSearchChange(value);
    onSearchChange?.(value);
  };

  const actionButtons = (
    <ActionButtons
      clusterId={clusterId}
      selectedRows={selectedRows}
      onAddParticipant={onAddParticipant}
      onDeleteParticipant={onDeleteParticipant}
      onClearSelection={handleClearSelection}
      onExportData={onExportData}
      onImport={onImport}
      onFixOrganizations={onFixOrganizations}
    />
  );

  return (
    <div className="space-y-2">
      <TableContent
        data={data}
        pagination={pagination}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={handleSearchChangeWithCallback}
        onEditParticipant={onEditParticipant}
        onDeleteParticipant={onDeleteParticipant}
        actionButtons={actionButtons}
      />

      <PaginationControls
        pagination={pagination}
        selectedCount={selectedRows.length}
        onPaginationChange={onPaginationChange}
        onPageChange={onPageChange}
      />
    </div>
  );
}
