"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Search,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VSLA } from "../../types";

interface VSLAsDataTableProps {
  columns: ColumnDef<VSLA>[];
  data: VSLA[];
  filterColumn?: string;
  filterPlaceholder?: string;
  showColumnToggle?: boolean;
  showPagination?: boolean;
  showRowSelection?: boolean;
  pageSize?: number;
  onRowSelectionChange?: (selectedRows: VSLA[]) => void;
  actionButtons?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionStateChange?: (selection: Record<string, boolean>) => void;
  onRowClick?: (vsla: VSLA) => void;
}

export function VSLAsDataTable({
  columns,
  data,
  filterColumn = "name",
  filterPlaceholder = "Filter VSLAs...",
  showColumnToggle = true,
  showPagination = true,
  showRowSelection = false,
  pageSize = 20,
  onRowSelectionChange,
  actionButtons,
  searchValue,
  onSearchChange,
  isLoading = false,
  rowSelection: externalRowSelection,
  onRowSelectionStateChange,
  onRowClick,
}: VSLAsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState(
    externalRowSelection || {}
  );

  // Use ref to track previous external selection to prevent unnecessary updates
  const prevExternalRowSelection = React.useRef(externalRowSelection);

  // Update internal row selection when external selection changes
  React.useEffect(() => {
    if (externalRowSelection !== undefined) {
      // Only update if the external selection actually changed
      const hasChanged =
        JSON.stringify(prevExternalRowSelection.current) !==
        JSON.stringify(externalRowSelection);

      if (hasChanged) {
        prevExternalRowSelection.current = externalRowSelection;
        setRowSelection(externalRowSelection);
      }
    }
  }, [externalRowSelection]);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  // Update pagination state when pageSize prop changes
  React.useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize,
    }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: updater => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      // Always call external callback for user interactions
      if (onRowSelectionStateChange) {
        onRowSelectionStateChange(newSelection);
      }
    },
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // Call the onRowSelectionChange callback when row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  // Check if header should be shown
  const showHeader = filterColumn || showColumnToggle || actionButtons;

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mt-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {filterColumn && (
              <div className="relative max-w-sm">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder={filterPlaceholder}
                  value={searchValue ?? ""}
                  onChange={event => {
                    const value = event.target.value;
                    if (onSearchChange) {
                      onSearchChange(value);
                    } else {
                      table.getColumn(filterColumn)?.setFilterValue(value);
                    }
                  }}
                  className="max-w-sm pl-9"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actionButtons}
            {showColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">Customize Columns</span>
                    <span className="lg:hidden">Columns</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table && table.getAllColumns
                    ? table
                        .getAllColumns()
                        .filter(
                          column =>
                            typeof column.accessorFn !== "undefined" &&
                            column.getCanHide()
                        )
                        .map(column => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={value =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })
                    : null}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <div className="relative">
          <Table>
            <TableHeader className="bg-muted text-muted-foreground">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead
                        className="text-muted-foreground"
                        key={header.id}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
                              header.column.getCanSort() &&
                                "hover:text-foreground"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={e => {
                              if (
                                header.column.getCanSort() &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={
                              header.column.getCanSort() ? 0 : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <ChevronUp
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDown
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-muted/50 cursor-pointer",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No VSLAs found.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24" />
                </TableRow>
              )}
            </TableBody>
          </Table>
          {isLoading && (
            <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Loading VSLAs...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {showRowSelection ? (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            ) : (
              <>
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} VSLAs
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-[70px] rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
