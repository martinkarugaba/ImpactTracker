"use client";

import { useState } from "react";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { type Project } from "@/features/projects/types";
import { type Organization } from "@/features/organizations/types";
import { type Participant } from "../types/types";
import { type ParticipantFormValues } from "./participant-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AddParticipantDialog,
  BulkDeleteButton,
  getParticipantColumns,
  ParticipantTableFilters,
} from "./table";
import { ImportParticipants } from "./import/import-participants";
import PaginationControls from "./pagination-controls";

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

interface ParticipantsTableProps {
  data: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
  onAdd: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingParticipant: Participant | null;
  handleSubmit: (data: ParticipantFormValues) => Promise<void>;
  onImportParticipants: (data: ParticipantFormValues[]) => Promise<void>;
  isLoading: boolean;
  tableIsLoading?: boolean;
  tableError?: string;
  projects: Project[];
  organizations: Organization[];
  clusters: { id: string; name: string }[];
  districts: string[];
  sexOptions: string[];
  filters: {
    cluster: string;
    project: string;
    district: string;
    sex: string;
    isPWD: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      cluster: string;
      project: string;
      district: string;
      sex: string;
      isPWD: string;
    }>
  >;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onSearchChange: (search: string) => void;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ParticipantsTable({
  data,
  onEdit,
  onDelete,
  isOpen,
  setIsOpen,
  editingParticipant,
  handleSubmit,
  onImportParticipants,
  isLoading,
  tableIsLoading,
  projects,
  organizations,
  clusters,
  districts,
  sexOptions,
  filters,
  setFilters,
  pagination,
  onSearchChange,
  searchTerm,
  onPageChange,
  onPageSizeChange,
}: ParticipantsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Participant[]>([]);
  const columns = getParticipantColumns({ onEdit, onDelete, onView: onEdit });
  const [search, setSearch] = useState(searchTerm || "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Card */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm">
        <div className="">
          <ParticipantTableFilters
            organizations={organizations}
            projects={projects}
            districts={districts}
            sexOptions={sexOptions}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
        <div className="flex items-center justify-between border-t px-6 py-4">
          <BulkDeleteButton
            selectedRows={selectedRows}
            onDelete={onDelete}
            onClearSelection={() => setSelectedRows([])}
          />
          <div className="flex w-full items-center gap-2">
            <ImportParticipants
              onImport={onImportParticipants}
              clusterId={clusters[0]?.id || ""}
              projects={projects}
            />
            <AddParticipantDialog
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              editingParticipant={editingParticipant}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              projects={projects}
              clusters={clusters}
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="min-h-[600px] p-6">
          {tableIsLoading ? (
            <TableSkeleton />
          ) : (
            <ReusableDataTable
              columns={columns}
              data={data}
              filterColumn="fullName"
              filterPlaceholder="Filter by name..."
              showColumnToggle={true}
              showPagination={false}
              isLoading={false}
              searchValue={search}
              onSearchChange={handleSearchChange}
              showRowSelection={true}
              pageSize={pagination?.limit || 10}
              onRowSelectionChange={setSelectedRows}
            />
          )}
        </div>
        {pagination && (
          <div className="bg-card sticky bottom-0 border-t px-6 py-4">
            <PaginationControls
              hasNextPage={pagination.hasNext}
              hasPrevPage={pagination.hasPrev}
              totalPages={pagination.totalPages}
              currentPage={pagination.page}
              pageSize={pagination.limit}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>

      {/* Floating Dialog */}
      {isOpen && (
        <AddParticipantDialog
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingParticipant={editingParticipant}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          projects={projects}
          clusters={clusters}
        />
      )}
    </div>
  );
}
