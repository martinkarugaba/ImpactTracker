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
  showRealColumns?: boolean;
}

export function TableSkeleton({
  rows = 10,
  columns = 8,
  showRealColumns = true,
}: TableSkeletonProps) {
  if (showRealColumns) {
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
              {/* Name column */}
              <TableHead className="w-[180px]">
                <Skeleton className="h-4 w-[80px]" />
              </TableHead>
              {/* Contact column */}
              <TableHead className="w-[140px]">
                <Skeleton className="h-4 w-[60px]" />
              </TableHead>
              {/* Age column */}
              <TableHead className="w-[80px]">
                <Skeleton className="h-4 w-[35px]" />
              </TableHead>
              {/* Gender column */}
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-[50px]" />
              </TableHead>
              {/* Location column */}
              <TableHead className="w-[200px]">
                <Skeleton className="h-4 w-[70px]" />
              </TableHead>
              {/* Skills column */}
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-[45px]" />
              </TableHead>
              {/* Organization column */}
              <TableHead className="w-[160px]">
                <Skeleton className="h-4 w-[85px]" />
              </TableHead>
              {/* Actions column */}
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-[50px]" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {/* Checkbox */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-4 w-4" />
                  </div>
                </TableCell>
                {/* Name - More detailed */}
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[140px]" />
                    <Skeleton className="h-3 w-[100px] opacity-60" />
                  </div>
                </TableCell>
                {/* Contact */}
                <TableCell>
                  <Skeleton className="h-4 w-[110px]" />
                </TableCell>
                {/* Age */}
                <TableCell>
                  <Skeleton className="h-4 w-[25px]" />
                </TableCell>
                {/* Gender - Badge style */}
                <TableCell>
                  <Skeleton className="h-6 w-[60px] rounded-full" />
                </TableCell>
                {/* Location - Multi-line */}
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-[120px]" />
                    <Skeleton className="h-3 w-[90px] opacity-60" />
                  </div>
                </TableCell>
                {/* Skills - Multiple badges */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-[45px] rounded" />
                    <Skeleton className="h-5 w-[40px] rounded" />
                    {rowIndex % 3 === 0 && (
                      <Skeleton className="h-5 w-[35px] rounded" />
                    )}
                  </div>
                </TableCell>
                {/* Organization */}
                <TableCell>
                  <Skeleton className="h-4 w-[130px]" />
                </TableCell>
                {/* Actions */}
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

  // Fallback to generic table skeleton
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
                <Skeleton
                  className={`h-4 ${
                    index === 0
                      ? "w-[120px]"
                      : index === 1
                        ? "w-[100px]"
                        : index === 2
                          ? "w-[80px]"
                          : "w-[60px]"
                  }`}
                />
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
