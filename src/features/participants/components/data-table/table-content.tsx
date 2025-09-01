"use client";

import { DataTable } from "@/components/ui/data-table";
import { type Participant } from "../../types/types";
import { type ParticipantFormValues } from "../participant-form";
import { getParticipantColumns } from "./columns";

interface TableContentProps {
  data: Participant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onEditParticipant: (data: ParticipantFormValues, id: string) => void;
  onDeleteParticipant: (id: string) => void;
  actionButtons: React.ReactNode;
  columnVisibility?: Record<string, boolean>;
}

export function TableContent({
  data,
  pagination,
  isLoading,
  searchValue: _searchValue,
  onSearchChange: _onSearchChange,
  onEditParticipant,
  onDeleteParticipant,
  actionButtons: _actionButtons,
  columnVisibility,
}: TableContentProps) {
  const allColumns = getParticipantColumns({
    onEdit: (participant: Participant) => {
      onEditParticipant({} as ParticipantFormValues, participant.id);
    },
    onDelete: (participant: Participant) => {
      onDeleteParticipant(participant.id);
    },
    onView: (participant: Participant) => {
      onEditParticipant({} as ParticipantFormValues, participant.id);
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

  return (
    <DataTable
      columns={visibleColumns}
      data={data}
      showColumnToggle={false}
      showPagination={false}
      showRowSelection={false}
      pageSize={pagination.limit}
      isLoading={isLoading}
    />
  );
}
