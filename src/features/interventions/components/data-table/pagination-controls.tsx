"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";

interface PaginationControlsProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedCount?: number;
  onPaginationChange: (page: number, limit: number) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  position?: "top" | "bottom";
}

export function PaginationControls({
  pagination,
  selectedCount = 0,
  onPaginationChange,
  onPageChange,
  isLoading = false,
  position = "bottom",
}: PaginationControlsProps) {
  const isDisabled = isLoading || pagination.totalPages === 0;

  return (
    <div className="flex items-center justify-between px-4">
      {position === "bottom" && (
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading interventions...</span>
            </div>
          ) : (
            `${selectedCount} of ${pagination.total} row(s) selected.`
          )}
        </div>
      )}
      <div className="flex w-full items-center gap-8 lg:w-fit">
        {position === "bottom" && (
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${pagination.limit}`}
              onValueChange={value => {
                const newSize = Number(value);
                onPaginationChange(pagination.page, newSize);
              }}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[20, 30, 40, 50, 100].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            `Page ${pagination.page} of ${pagination.totalPages}`
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={isDisabled || pagination.page === 1}
          >
            <span className="sr-only">Go to first page</span>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(Math.max(pagination.page - 1, 1))}
            disabled={isDisabled || pagination.page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => {
              onPageChange(
                Math.min(pagination.page + 1, pagination.totalPages)
              );
            }}
            disabled={isDisabled || pagination.page >= pagination.totalPages}
          >
            <span className="sr-only">Go to next page</span>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={isDisabled || pagination.page >= pagination.totalPages}
          >
            <span className="sr-only">Go to last page</span>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronsRight className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
