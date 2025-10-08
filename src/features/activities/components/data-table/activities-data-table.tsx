"use client";

import { useState } from "react";
import { type Activity } from "../../types/types";
import { PaginationControls } from "./pagination-controls";
import { TableContent } from "./table-content";
import { useTableState } from "./use-table-state";
import { type VisibilityState } from "@tanstack/react-table";

interface ActivitiesDataTableProps {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  clusterId?: string;
  onPaginationChange: (page: number, limit: number) => void;
  onPageChange: (page: number) => void;
  onSearchChange?: (search: string) => void;
  searchTerm?: string;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onDeleteMultipleActivities?: (ids: string[]) => void;
  onExportData?: () => void;
  onImport?: (data: unknown[]) => void;
  columnVisibility?: VisibilityState;
  onRowSelectionChange?: (selectedActivities: Activity[]) => void;
}

export function ActivitiesDataTable({
  data,
  pagination,
  isLoading,
  clusterId: _clusterId,
  onPaginationChange,
  onPageChange,
  onSearchChange,
  searchTerm,
  onAddActivity: _onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onDeleteMultipleActivities: _onDeleteMultipleActivities,
  onExportData: _onExportData,
  onImport: _onImport,
  columnVisibility,
  onRowSelectionChange,
}: ActivitiesDataTableProps) {
  const {
    search,
    selectedRows: _selectedRows,
    handleSearchChange,
  } = useTableState(searchTerm);

  const [rowSelection, setRowSelection] = useState({});

  const handleSearchChangeWithCallback = (value: string) => {
    handleSearchChange(value);
    onSearchChange?.(value);
  };

  const handleViewActivity = (activity: Activity) => {
    // Navigate to activity details page
    // This will be handled by the router in the tab component
    onEditActivity(activity);
  };

  // When row selection changes, pass selected activities to parent
  const handleRowSelectionChange = (
    updater:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => {
    const newSelection =
      typeof updater === "function" ? updater(rowSelection) : updater;
    setRowSelection(newSelection);

    if (onRowSelectionChange) {
      const selectedRows = Object.keys(newSelection)
        .filter(key => newSelection[key])
        .map(key => data[Number.parseInt(key)])
        .filter(Boolean);
      onRowSelectionChange(selectedRows);
    }
  };

  return (
    <div className="space-y-4">
      <TableContent
        data={data}
        pagination={pagination}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={handleSearchChangeWithCallback}
        onEditActivity={onEditActivity}
        onDeleteActivity={onDeleteActivity}
        onViewActivity={handleViewActivity}
        actionButtons={null} // Remove action buttons from table header
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={() => {}} // Handle at parent level
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onPageChange={onPageChange}
      />
    </div>
  );
}
