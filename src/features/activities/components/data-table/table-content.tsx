"use client";

import { DataTable } from "@/components/ui/data-table";
import { type Activity } from "../../types/types";
import { getActivityColumns } from "../table/columns";
import { type VisibilityState } from "@tanstack/react-table";

interface TableContentProps {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onViewActivity: (activity: Activity) => void;
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
  onEditActivity,
  onDeleteActivity,
  onViewActivity,
  actionButtons: _actionButtons,
  columnVisibility: _columnVisibility,
  onColumnVisibilityChange: _onColumnVisibilityChange,
}: TableContentProps) {
  const columns = getActivityColumns({
    onEdit: onEditActivity,
    onDelete: onDeleteActivity,
    onView: onViewActivity,
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
