"use client";

import { useState } from "react";
import { type Intervention } from "../../types/types";
import { TableContent, useTableState, PaginationControls } from "./index";
import { type VisibilityState } from "@tanstack/react-table";

interface InterventionsDataTableProps {
  data: Intervention[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  columnVisibility?: VisibilityState;
  onPaginationChange: (page: number, limit: number) => void;
  onPageChange: (page: number) => void;
  onRowSelectionChange?: (selected: Intervention[]) => void;
}

export function InterventionsDataTable({
  data,
  pagination,
  isLoading,
  onPaginationChange,
  onPageChange,
  columnVisibility,
  onRowSelectionChange,
}: InterventionsDataTableProps) {
  const { search, handleSearchChange } = useTableState();
  const [rowSelection, setRowSelection] = useState({});

  const handleRowSelectionChange = (
    updater:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => {
    const newSelection =
      typeof updater === "function" ? updater(rowSelection) : updater;
    setRowSelection(newSelection);

    if (onRowSelectionChange) {
      const selected = Object.keys(newSelection)
        .filter(key => newSelection[key])
        .map(k => data[Number.parseInt(k)])
        .filter(Boolean);
      onRowSelectionChange(selected);
    }
  };

  return (
    <div className="space-y-4">
      <TableContent
        data={data}
        pagination={pagination}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={handleSearchChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={() => {}}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />

      <PaginationControls
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onPageChange={onPageChange}
      />
    </div>
  );
}
