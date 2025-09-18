"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 10, columns = 8 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted text-muted-foreground">
          <TableRow>
            {/* Checkbox column */}
            <TableHead className="w-[50px]">
              <div className="flex items-center justify-center">
                <Skeleton className="h-4 w-4" />
              </div>
            </TableHead>
            {/* Data columns */}
            {Array.from({ length: columns - 2 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-[100px]" />
              </TableHead>
            ))}
            {/* Actions column */}
            <TableHead className="w-[50px]">
              <Skeleton className="h-4 w-[60px]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {/* Checkbox column */}
              <TableCell>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-4" />
                </div>
              </TableCell>
              {/* Data columns */}
              {Array.from({ length: columns - 2 }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    className={`h-4 ${
                      colIndex === 0
                        ? "w-[120px]" // Name columns wider
                        : colIndex === 1
                          ? "w-[100px]" // Second column medium
                          : colIndex === 2
                            ? "w-[80px]" // Contact/location columns
                            : "w-[60px]" // Other columns smaller
                    }`}
                  />
                </TableCell>
              ))}
              {/* Actions column */}
              <TableCell>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
