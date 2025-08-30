"use client";

import { DataTable } from "@/components/ui/data-table";
import { type Participant } from "../../types/types";
import { type ParticipantFormValues } from "../participant-form";
import { getParticipantColumns } from "./columns";
import { type VisibilityState } from "@tanstack/react-table";

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
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
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
  columnVisibility: _columnVisibility,
  onColumnVisibilityChange: _onColumnVisibilityChange,
}: TableContentProps) {
  const columns = getParticipantColumns({
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

  return (
    <DataTable
      columns={columns}
      data={data}
      showColumnToggle={false} // Handled at top level
      showPagination={false}
      showRowSelection={false}
      pageSize={pagination.limit}
      isLoading={isLoading}
    />
  );
}
