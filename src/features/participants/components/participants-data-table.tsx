"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { type Project } from "@/features/projects/types";
import { type Organization } from "@/features/organizations/types";
import { type Participant } from "../types/types";
import { type ParticipantFormValues } from "./participant-form";
import { Button } from "@/components/ui/button";
import {
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { BulkDeleteButton, getParticipantColumns } from "./table";
import { ImportParticipants } from "./import/import-participants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  isLoading: _isLoading,
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
  const [search, setSearch] = useState(searchTerm || "");
  const [selectedRows, setSelectedRows] = useState<Participant[]>([]);
  const [_rowSelectionState, _setRowSelectionState] = useState<
    Record<string, boolean>
  >({});

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const _handleRowSelectionChange = (rows: Participant[]) => {
    setSelectedRows(rows);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
    _setRowSelectionState({});
  };

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
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={data}
        filterColumn="firstName"
        filterPlaceholder="Search participants..."
        showColumnToggle={true}
        showPagination={false}
        showRowSelection={false}
        pageSize={pagination.limit}
        searchValue={search}
        onSearchChange={handleSearchChange}
        // onRowSelectionChange={handleRowSelectionChange}
        // rowSelection={rowSelectionState}
        // onRowSelectionStateChange={setRowSelectionState}
        isLoading={_isLoading}
        actionButtons={
          <>
            {onImport ? (
              <ImportParticipants
                clusterId={clusterId}
                onImportComplete={() => {
                  if (onImport) {
                    onImport([]);
                  }
                }}
              />
            ) : null}

            {onExportData ? (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={onExportData}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            ) : null}

            {onFixOrganizations ? (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={onFixOrganizations}
              >
                <span>Fix Organizations</span>
              </Button>
            ) : null}

            <BulkDeleteButton
              selectedRows={selectedRows}
              onDelete={(participant: Participant) => {
                onDeleteParticipant(participant.id);
              }}
              onClearSelection={handleClearSelection}
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
        }
      />
      {/* Pagination footer matching ReusableDataTable layout */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {selectedRows.length} of {pagination.total} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${pagination.limit}`}
              onValueChange={value => {
                const newSize = Number(value);
                console.log(
                  `ParticipantsDataTable: Changing page size from ${pagination.limit} to ${newSize}`
                );
                onPaginationChange(pagination.page, newSize);
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange(Math.max(pagination.page - 1, 1))}
              disabled={pagination.page === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => {
                onPageChange(
                  Math.min(pagination.page + 1, pagination.totalPages)
                );
              }}
              disabled={pagination.page >= pagination.totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
