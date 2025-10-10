/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Search,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Header",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Target</div>,
    cell: ({ row }) => (
      <form
        onSubmit={e => {
          e.preventDefault();
          toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Limit</div>,
    cell: ({ row }) => (
      <form
        onSubmit={e => {
          e.preventDefault();
          toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Limit
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Assign reviewer";

      if (isAssigned) {
        return row.original.reviewer;
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select>
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
              <SelectItem value="Jamik Tashpulatov">
                Jamik Tashpulatov
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map(cell => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showToolbar?: boolean;
  showPagination?: boolean;
  showRowSelection?: boolean;
  pageSize?: number;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  // Server-side pagination support
  serverSideTotal?: number; // Total count from server for filtered results
  serverSideFiltered?: number; // Total filtered count from server
  // Column visibility
  columnVisibility?: VisibilityState;
  rowSelection?: Record<string, boolean>;
  onRowSelectionStateChange?: (selection: Record<string, boolean>) => void;
  // Additional props
  filterColumn?: string;
  filterPlaceholder?: string;
  showColumnToggle?: boolean;
  actionButtons?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  loadingText?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showToolbar = true,
  showPagination = true,
  showRowSelection = false,
  pageSize = 20,
  onRowSelectionChange,
  // Server-side pagination
  serverSideTotal,
  serverSideFiltered,
  // Column visibility
  columnVisibility: externalColumnVisibility,
  rowSelection: externalRowSelection,
  onRowSelectionStateChange,
  // Additional props
  filterColumn,
  filterPlaceholder = "Filter...",
  showColumnToggle = true,
  actionButtons,
  searchValue,
  onSearchChange,
  isLoading = false,
  loadingText = "Loading data...",
}: DataTableProps<TData, TValue>) {
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

  // Use ref to track if we're in the middle of a selection update
  const isUpdatingSelection = React.useRef(false);

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
          <div className="flex items-center gap-2">{actionButtons}</div>
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
                    No results.
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
                  {loadingText}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPagination && (
        <EnhancedPaginationControls
          table={table}
          showRowSelection={showRowSelection}
          serverSideTotal={serverSideTotal}
          serverSideFiltered={serverSideFiltered}
          data={data}
          pageSize={pageSize}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Enhanced Pagination Controls Component
interface EnhancedPaginationControlsProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  showRowSelection?: boolean;
  serverSideTotal?: number;
  serverSideFiltered?: number;
  data: TData[];
  pageSize: number;
  isLoading?: boolean;
}

function EnhancedPaginationControls<TData>({
  table,
  showRowSelection,
  serverSideTotal,
  serverSideFiltered,
  data,
  pageSize,
  isLoading,
}: EnhancedPaginationControlsProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount =
    serverSideFiltered ?? table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-4 max-sm:flex-col">
      {/* Left section - Row selection info or page info */}
      <div className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
        {showRowSelection ? (
          <>
            {selectedCount} of {totalCount} row(s) selected
            {serverSideTotal && serverSideTotal !== serverSideFiltered && (
              <> (filtered from {serverSideTotal} total)</>
            )}
          </>
        ) : (
          <>
            Page{" "}
            <span className="text-foreground font-medium">{currentPage}</span>{" "}
            of <span className="text-foreground font-medium">{totalPages}</span>
          </>
        )}
      </div>

      {/* Center section - Pagination buttons */}
      <div className="grow">
        <Pagination>
          <PaginationContent>
            {/* First page button */}
            <PaginationItem className="hidden sm:block">
              <Button
                size="icon"
                variant="outline"
                className="size-8 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || isLoading}
                aria-label="Go to first page"
              >
                <IconChevronsLeft size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>

            {/* Previous page button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="size-8 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
                aria-label="Go to previous page"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <IconChevronLeft size={16} aria-hidden="true" />
                )}
              </Button>
            </PaginationItem>

            {/* Left ellipsis (...) */}
            {showLeftEllipsis && (
              <PaginationItem className="hidden sm:block">
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Page number buttons */}
            {pages.map(page => {
              const isActive = page === currentPage;
              return (
                <PaginationItem key={page} className="hidden sm:block">
                  <Button
                    size="icon"
                    variant={isActive ? "outline" : "ghost"}
                    className="size-8"
                    onClick={() => table.setPageIndex(page - 1)}
                    disabled={isLoading}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              );
            })}

            {/* Right ellipsis (...) */}
            {showRightEllipsis && (
              <PaginationItem className="hidden sm:block">
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Next page button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="size-8 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
                aria-label="Go to next page"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <IconChevronRight size={16} aria-hidden="true" />
                )}
              </Button>
            </PaginationItem>

            {/* Last page button */}
            <PaginationItem className="hidden sm:block">
              <Button
                size="icon"
                variant="outline"
                className="size-8 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage() || isLoading}
                aria-label="Go to last page"
              >
                <IconChevronsRight size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Right section - Results per page selector */}
      <div className="flex flex-1 justify-end">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="results-per-page"
            className="hidden text-sm font-medium whitespace-nowrap sm:block"
          >
            Rows per page
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={value => {
              const newSize = parseInt(value);
              table.setPageSize(newSize);
            }}
            disabled={isLoading}
            aria-label="Results per page"
          >
            <SelectTrigger
              id="results-per-page"
              className="h-8 w-fit whitespace-nowrap"
            >
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            Showing total visitors for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={value => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Header</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Table of Contents">
                      Table of Contents
                    </SelectItem>
                    <SelectItem value="Executive Summary">
                      Executive Summary
                    </SelectItem>
                    <SelectItem value="Technical Approach">
                      Technical Approach
                    </SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Capabilities">Capabilities</SelectItem>
                    <SelectItem value="Focus Documents">
                      Focus Documents
                    </SelectItem>
                    <SelectItem value="Narrative">Narrative</SelectItem>
                    <SelectItem value="Cover Page">Cover Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Target</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Limit</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">Reviewer</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue placeholder="Select a reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                  <SelectItem value="Jamik Tashpulatov">
                    Jamik Tashpulatov
                  </SelectItem>
                  <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
