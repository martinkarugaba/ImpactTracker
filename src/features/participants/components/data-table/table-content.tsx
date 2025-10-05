"use client";

import { DataTable } from "@/components/ui/data-table";
import { type Participant } from "../../types/types";
import { type ParticipantFormValues } from "../participant-form";
import { getParticipantColumns } from "./columns";
import { TableSkeleton } from "./table-skeleton";

interface TableContentProps {
  data: Participant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isFiltering?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onEditParticipant: (data: ParticipantFormValues, id: string) => void;
  onDeleteParticipant: (id: string) => void;
  onViewParticipant?: (participant: Participant) => void;
  actionButtons: React.ReactNode;
  columnVisibility?: Record<string, boolean>;
  rowSelection?: Record<string, boolean>;
  onRowSelectionStateChange?: (selection: Record<string, boolean>) => void;
}

export function TableContent({
  data,
  pagination,
  isLoading,
  isFiltering = false,
  searchValue: _searchValue,
  onSearchChange: _onSearchChange,
  onEditParticipant,
  onDeleteParticipant,
  onViewParticipant,
  actionButtons: _actionButtons,
  columnVisibility,
  rowSelection,
  onRowSelectionStateChange,
}: TableContentProps) {
  const allColumns = getParticipantColumns({
    onEdit: (participant: Participant) => {
      onEditParticipant({} as ParticipantFormValues, participant.id);
    },
    onDelete: (participant: Participant) => {
      onDeleteParticipant(participant.id);
    },
    onView: (participant: Participant) => {
      if (onViewParticipant) {
        onViewParticipant(participant);
      } else {
        // Fallback to edit if no view handler provided
        onEditParticipant({} as ParticipantFormValues, participant.id);
      }
    },
  });

  // Filter columns based on visibility state
  const visibleColumns = columnVisibility
    ? allColumns.filter(column => {
        // Always show select and actions columns
        if (column.id === "select" || column.id === "actions") return true;
        // Show column if it's visible or if visibility not specified (default to true)
        return columnVisibility[column.id as string] !== false;
      })
    : allColumns;

  // Show skeleton while loading initially (no data)
  if (isLoading && data.length === 0) {
    return (
      <TableSkeleton
        rows={pagination.limit}
        columns={visibleColumns.length}
        showRealColumns={true}
      />
    );
  }

  // Show loading state for both initial loading and filtering
  const showLoading = isLoading || isFiltering;

  return (
    <DataTable
      columns={visibleColumns}
      data={data}
      showPagination={false}
      showRowSelection={true}
      pageSize={pagination.limit}
      rowSelection={rowSelection}
      onRowSelectionStateChange={onRowSelectionStateChange}
      serverSideTotal={pagination.total}
      serverSideFiltered={pagination.total}
      isLoading={showLoading} // Show loading overlay during initial load or filtering
      loadingText="Loading participants..."
    />
  );
}
