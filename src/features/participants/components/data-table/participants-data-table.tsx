"use client";

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
  onDeleteMultipleParticipants: _onDeleteMultipleParticipants,
  onExportData: _onExportData,
  onImport: _onImport,
  onFixOrganizations: _onFixOrganizations,
  columnVisibility,
}: ParticipantsDataTableProps) {
  const { selectedRows } = useTableState();

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
      />

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
