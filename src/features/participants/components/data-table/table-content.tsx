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
}

export function TableContent({
  data,
  pagination,
  isLoading,
  searchValue,
  onSearchChange,
  onEditParticipant,
  onDeleteParticipant,
  actionButtons,
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
      filterColumn="firstName"
      filterPlaceholder="Search participants..."
      showColumnToggle={true}
      showPagination={false}
      showRowSelection={false}
      pageSize={pagination.limit}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      isLoading={isLoading}
      actionButtons={actionButtons}
    />
  );
}
