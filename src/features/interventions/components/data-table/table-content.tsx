"use client";

import { DataTable } from "@/components/ui/data-table";
import { type Intervention } from "../../types/types";
import { getInterventionColumns } from "./columns";
import { type VisibilityState } from "@tanstack/react-table";

interface TableContentProps {
  data: Intervention[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  searchValue: string;
  onSearchChange: (v: string) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (v: VisibilityState) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (
    updater:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
}

export function TableContent({
  data,
  pagination,
  isLoading,
  searchValue: _searchValue,
  onSearchChange: _onSearchChange,
  columnVisibility: _columnVisibility,
  onColumnVisibilityChange: _onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
}: TableContentProps) {
  const columns = getInterventionColumns();

  return (
    <div className="rounded-lg shadow-xs">
      <DataTable<Intervention, unknown>
        columns={columns}
        data={data}
        showColumnToggle={false}
        showPagination={false}
        showRowSelection={true}
        pageSize={pagination.limit}
        isLoading={isLoading}
        loadingText="Loading interventions..."
        rowSelection={rowSelection}
        onRowSelectionStateChange={onRowSelectionChange}
      />
    </div>
  );
}
