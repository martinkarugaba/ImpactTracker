"use client";

import { useState } from "react";
import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  Search,
  LayoutGrid,
  ChevronDown,
  FileUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { columns } from "./vsla-table-columns";
import { VSLAsDataTable } from "./vslas-data-table";
import { VSLA } from "../../types";
import { CreateVSLADialog } from "../dialogs";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";

interface VSLAsTableProps {
  data: VSLA[];
  onRowClick?: (vsla: VSLA) => void;
  onEdit?: (vsla: VSLA) => void;
  onDelete?: (vsla: VSLA) => void;
  onImport?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  pageSize?: number;
  organizations?: Organization[];
  clusters?: Cluster[];
  projects?: Project[];
  onSuccess?: () => void;
}

export function VSLAsTable({
  data,
  onRowClick,
  onEdit,
  onDelete,
  onImport,
  onExport,
  isLoading = false,
  pageSize = 10,
  organizations = [],
  clusters = [],
  projects = [],
  onSuccess,
}: VSLAsTableProps) {
  const [searchValue, setSearchValue] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    code: true,
    organization: true,
    cluster: true,
    total_members: true,
    total_savings: true,
    total_loans: true,
    status: true,
  });

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

  // Available columns for toggle
  const availableColumns = [
    { id: "name", label: "Name" },
    { id: "code", label: "Code" },
    { id: "organization", label: "Organization" },
    { id: "cluster", label: "Cluster" },
    { id: "total_members", label: "Members" },
    { id: "total_savings", label: "Savings" },
    { id: "total_loans", label: "Loans" },
    { id: "status", label: "Status" },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Action Buttons Section - At the very top */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Search */}
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search VSLAs..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-80 pl-9"
          />
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableColumns.map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={
                    columnVisibility[column.id as keyof typeof columnVisibility]
                  }
                  onCheckedChange={checked =>
                    setColumnVisibility(prev => ({
                      ...prev,
                      [column.id]: !!checked,
                    }))
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
          )}
          <CreateVSLADialog
            organizations={organizations}
            clusters={clusters}
            projects={projects}
            onSuccess={onSuccess}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add VSLA
            </Button>
          </CreateVSLADialog>
        </div>
      </div>

      {/* VSLAs Table */}
      <VSLAsDataTable
        columns={enhancedColumns}
        data={data}
        searchValue={searchValue}
        showPagination={true}
        showRowSelection={false}
        pageSize={pageSize}
        isLoading={isLoading}
        onRowClick={onRowClick}
      />
    </div>
  );
}
