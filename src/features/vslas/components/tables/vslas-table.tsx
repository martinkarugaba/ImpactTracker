"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  Search,
  LayoutGrid,
  ChevronDown,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createColumns } from "./vsla-table-columns";
import { VSLAsDataTable } from "./vslas-data-table";
import type { VSLA } from "../../types";
import { CreateVSLADialog } from "../dialogs";
import { ExcelImportDialog } from "@/components/shared/excel-import-dialog";
import { createVSLAImportConfig } from "../../config/vsla-import-config";
import {
  VSLAFiltersComponent,
  type VSLAFilters,
} from "../filters/vsla-filters";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";

interface VSLAsTableProps {
  data: VSLA[];
  onRowClick?: (vsla: VSLA) => void;
  onEdit?: (vsla: VSLA) => void;
  onDelete?: (vsla: VSLA) => void;
  onBulkDelete?: (vslas: VSLA[]) => void;
  onExportToExcel?: () => void;
  onExportToCSV?: () => void;
  isLoading?: boolean;
  pageSize?: number;
  organizations?: Organization[];
  clusters?: Cluster[];
  projects?: Project[];
  onSuccess?: () => void;
  filters?: VSLAFilters;
  onFiltersChange?: (filters: VSLAFilters) => void;
  districts?: string[];
  subCounties?: string[];
}

export function VSLAsTable({
  data,
  onRowClick,
  onEdit,
  onDelete,
  onBulkDelete,
  onExportToExcel,
  onExportToCSV,
  isLoading = false,
  pageSize = 10,
  organizations = [],
  clusters = [],
  projects = [],
  onSuccess,
  filters,
  onFiltersChange,
  districts = [],
  subCounties = [],
}: VSLAsTableProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<VSLA[]>([]);
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

  // Create columns with action handlers
  const columns = createColumns(onRowClick, onEdit, onDelete, onRowClick);

  // Available columns for toggle
  const availableColumns = [
    { id: "name", label: "Name" },
    { id: "code", label: "Code" },
    { id: "district", label: "District" },
    { id: "sub_county", label: "Sub County" },
    { id: "organization", label: "Organization" },
    { id: "cluster", label: "Cluster" },
    { id: "total_members", label: "Members" },
    { id: "total_savings", label: "Savings" },
    { id: "total_loans", label: "Loans" },
    { id: "status", label: "Status" },
  ];

  const handleBulkDelete = () => {
    if (selectedRows.length > 0 && onBulkDelete) {
      onBulkDelete(selectedRows);
      setSelectedRows([]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Filters Section */}
      {filters && onFiltersChange && (
        <VSLAFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          organizations={organizations}
          clusters={clusters}
          projects={projects}
          districts={districts}
          subCounties={subCounties}
        />
      )}

      {/* Action Buttons Section - At the very top */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Search and Bulk Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search VSLAs..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="w-80 pl-9"
            />
          </div>
          {selectedRows.length > 0 && onBulkDelete && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedRows.length} selected
            </Button>
          )}
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
          {(onExportToExcel || onExportToCSV) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExportToExcel && (
                  <DropdownMenuItem onClick={onExportToExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to Excel
                  </DropdownMenuItem>
                )}
                {onExportToCSV && (
                  <DropdownMenuItem onClick={onExportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ExcelImportDialog
            config={createVSLAImportConfig(organizations, clusters, projects)}
            onImportComplete={onSuccess}
          />
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
        columns={columns}
        data={data}
        searchValue={searchValue}
        showPagination={true}
        showRowSelection={true}
        pageSize={pageSize}
        isLoading={isLoading}
        onRowClick={onRowClick}
        onRowSelectionChange={setSelectedRows}
      />
    </div>
  );
}
