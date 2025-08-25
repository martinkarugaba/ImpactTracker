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
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LayoutGrid, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ReusableDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  showColumnToggle?: boolean;
  showPagination?: boolean;
  showRowSelection?: boolean;
  pageSize?: number;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  customActions?: React.ReactNode;
  customFilters?: React.ReactNode;
  // Server-side pagination props
  serverSidePagination?: boolean;
  paginationData?: PaginationData;
  onPaginationChange?: (page: number, pageSize: number) => void;
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

export function ReusableDataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter...",
  showColumnToggle = true,
  showPagination = true,
  pageSize = 10,
  onRowSelectionChange,
  onRowClick,
  customActions,
  customFilters,
  serverSidePagination = false,
  paginationData,
  onPaginationChange,
  isLoading = false,
  searchValue,
  onSearchChange,
  onSortingChange,
}: ReusableDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: serverSidePagination ? (paginationData?.page || 1) - 1 : 0,
    pageSize: serverSidePagination
      ? paginationData?.limit || pageSize
      : pageSize,
  });

  // Debug pagination state
  console.log(`ReusableDataTable initial pagination state:`, {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    serverSidePagination,
    paginationDataPage: paginationData?.page,
    paginationDataLimit: paginationData?.limit,
    paginationDataTotal: paginationData?.total,
    paginationDataTotalPages: paginationData?.totalPages,
    paginationDataHasNext: paginationData?.hasNext,
    paginationDataHasPrev: paginationData?.hasPrev,
  });

  // Notify parent of sorting changes
  React.useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  // Handle search for server-side pagination
  const [searchInput, setSearchInput] = React.useState(searchValue || "");

  // Set up debounced search effect
  React.useEffect(() => {
    if (!serverSidePagination) return;

    const handler = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchInput);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, onSearchChange, serverSidePagination]);

  // Update local pagination state when server pagination data changes
  React.useEffect(() => {
    if (serverSidePagination && paginationData) {
      console.log("ReusableDataTable: Server pagination data changed:", {
        currentPageIndex: pagination.pageIndex,
        currentPageSize: pagination.pageSize,
        newServerPage: paginationData.page,
        newServerPageSize: paginationData.limit,
        total: paginationData.total,
        totalPages: paginationData.totalPages,
      });

      const newPageIndex = paginationData.page - 1; // Convert 1-indexed to 0-indexed
      const newPageSize = paginationData.limit;

      // Only update if there's actually a change to prevent infinite loops
      setPagination(prev => {
        if (prev.pageIndex === newPageIndex && prev.pageSize === newPageSize) {
          console.log(
            "ReusableDataTable: No change in pagination, skipping update"
          );
          return prev;
        }

        console.log(
          `ReusableDataTable: Updating pagination state to pageIndex=${newPageIndex}, pageSize=${newPageSize}`
        );
        return {
          pageIndex: newPageIndex,
          pageSize: newPageSize,
        };
      });
    }
  }, [
    serverSidePagination,
    paginationData,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  interface PaginationState {
    pageIndex: number;
    pageSize: number;
  }

  type PaginationUpdater =
    | PaginationState
    | ((state: PaginationState) => PaginationState);

  // Handle pagination changes for server-side pagination
  const handlePaginationChange = React.useCallback(
    (updater: PaginationUpdater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;

      // If using server-side pagination, convert 0-indexed to 1-indexed and notify parent
      if (serverSidePagination && onPaginationChange) {
        const oneIndexedPage = newPagination.pageIndex + 1;
        onPaginationChange(oneIndexedPage, newPagination.pageSize);
      }

      // Always update local state
      setPagination(newPagination);
    },
    [serverSidePagination, onPaginationChange, pagination]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSidePagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    manualPagination: serverSidePagination,
    pageCount: serverSidePagination
      ? paginationData?.totalPages || 0
      : undefined,
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

  // Get server-side pagination information
  const getPageInfo = React.useCallback(() => {
    if (serverSidePagination && paginationData) {
      return {
        currentPage: paginationData.page,
        pageCount: paginationData.totalPages,
        hasPrev: paginationData.hasPrev,
        hasNext: paginationData.hasNext,
      };
    }
    return {
      currentPage: table.getState().pagination.pageIndex + 1,
      pageCount: table.getPageCount(),
      hasPrev: table.getCanPreviousPage(),
      hasNext: table.getCanNextPage(),
    };
  }, [serverSidePagination, paginationData, table]);

  // We now use direct pagination methods in the button handlers instead of this function

  // Get columns that can be hidden for the column toggle dropdown

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={
                serverSidePagination
                  ? searchInput
                  : ((table
                      .getColumn(filterColumn)
                      ?.getFilterValue() as string) ?? "")
              }
              onChange={event => {
                if (serverSidePagination) {
                  setSearchInput(event.target.value);
                } else {
                  table
                    .getColumn(filterColumn)
                    ?.setFilterValue(event.target.value);
                }
              }}
              className="max-w-sm"
            />
          )}
          {customFilters}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table &&
                  table.getAllColumns &&
                  table
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
                    })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {customActions}
      </div>
      <div className="overflow-hidden rounded-md border">
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "hover:bg-muted cursor-pointer" : ""}
                  onClick={() =>
                    onRowClick && onRowClick(row.original as TData)
                  }
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
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={value => {
                  const newSize = Number(value);
                  if (serverSidePagination && onPaginationChange) {
                    // For server-side pagination, we need to call the parent handler
                    onPaginationChange(getPageInfo().currentPage, newSize);
                  } else {
                    // For client-side pagination, just use the table's built-in method
                    table.setPageSize(newSize);
                  }
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
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
              {/* Show the correct page number and total pages based on pagination mode */}
              {`Page ${getPageInfo().currentPage} of ${getPageInfo().pageCount}`}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (serverSidePagination && onPaginationChange) {
                    onPaginationChange(1, pagination.pageSize);
                  } else {
                    table.setPageIndex(0); // Go to first page (0-indexed)
                  }
                }}
                disabled={!getPageInfo().hasPrev}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  if (serverSidePagination && onPaginationChange) {
                    const currentPage = getPageInfo().currentPage;
                    onPaginationChange(
                      Math.max(currentPage - 1, 1),
                      pagination.pageSize
                    );
                  } else {
                    table.previousPage(); // Use built-in method for client-side
                  }
                }}
                disabled={!getPageInfo().hasPrev}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  if (serverSidePagination && onPaginationChange) {
                    const currentPage = getPageInfo().currentPage;
                    const pageCount = getPageInfo().pageCount;
                    onPaginationChange(
                      Math.min(currentPage + 1, pageCount),
                      pagination.pageSize
                    );
                  } else {
                    table.nextPage(); // Use built-in method for client-side
                  }
                }}
                disabled={!getPageInfo().hasNext}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => {
                  if (serverSidePagination && onPaginationChange) {
                    onPaginationChange(
                      getPageInfo().pageCount,
                      pagination.pageSize
                    );
                  } else {
                    table.setPageIndex(table.getPageCount() - 1); // Go to last page (0-indexed)
                  }
                }}
                disabled={!getPageInfo().hasNext}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
