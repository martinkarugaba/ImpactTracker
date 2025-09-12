"use client";

import { useState } from "react";
import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { columns } from "./vsla-table-columns";
import { VSLAsDataTable } from "./vslas-data-table";
import { VSLA } from "../../types";

interface VSLAsTableProps {
  data: VSLA[];
  onRowClick?: (vsla: VSLA) => void;
  onEdit?: (vsla: VSLA) => void;
  onDelete?: (vsla: VSLA) => void;
  onAdd?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  showActions?: boolean;
  pageSize?: number;
}

export function VSLAsTable({
  data,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
  onImport,
  onExport,
  isLoading = false,
  showActions = true,
  pageSize = 10,
}: VSLAsTableProps) {
  const [selectedRows, setSelectedRows] = useState<VSLA[]>([]);

  // Enhanced columns with action handlers
  const enhancedColumns = columns.map(column => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: Row<VSLA> }) => {
          const vsla = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onEdit?.(vsla);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={e => {
                  e.stopPropagation();
                  onDelete?.(vsla);
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      };
    }
    return column;
  });

  // Action buttons for the table header
  const actionButtons = showActions ? (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            selectedRows.forEach(vsla => onDelete?.(vsla));
            setSelectedRows([]);
          }}
        >
          Delete Selected ({selectedRows.length})
        </Button>
      )}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      )}
      {onImport && (
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      )}
      {onAdd && (
        <Button size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add VSLA
        </Button>
      )}
    </div>
  ) : undefined;

  return (
    <div className="w-full">
      <VSLAsDataTable
        columns={enhancedColumns}
        data={data}
        filterColumn="name"
        filterPlaceholder="Filter VSLAs..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={pageSize}
        onRowSelectionChange={setSelectedRows}
        actionButtons={actionButtons}
        isLoading={isLoading}
        onRowClick={onRowClick}
      />
    </div>
  );
}
