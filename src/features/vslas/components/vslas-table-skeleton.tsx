import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface VSLAsTableSkeletonProps {
  rows?: number;
  showHeader?: boolean;
}

export function VSLAsTableSkeleton({
  rows = 10,
  showHeader = true,
}: VSLAsTableSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="space-y-4">
          {/* Table toolbar skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-64" /> {/* Search input */}
              <Skeleton className="h-10 w-32" /> {/* Columns toggle */}
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-28" /> {/* Export button */}
              <Skeleton className="h-10 w-28" /> {/* Import button */}
              <Skeleton className="h-10 w-32" /> {/* Add VSLA button */}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Table header skeleton */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" /> {/* Checkbox */}
            <Skeleton className="h-4 w-32" /> {/* Name column */}
            <Skeleton className="h-4 w-28" /> {/* Organization column */}
            <Skeleton className="h-4 w-24" /> {/* Cluster column */}
            <Skeleton className="h-4 w-20" /> {/* Members column */}
            <Skeleton className="h-4 w-28" /> {/* Total Savings column */}
            <Skeleton className="h-4 w-28" /> {/* Total Loans column */}
            <Skeleton className="h-4 w-32" /> {/* Meeting Frequency column */}
            <Skeleton className="h-4 w-20" /> {/* Status column */}
            <Skeleton className="h-4 w-24" /> {/* Formed Date column */}
            <Skeleton className="h-4 w-20" /> {/* Actions column */}
          </div>
        </div>

        {/* Table rows skeleton */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" /> {/* Checkbox */}
                {/* Name cell with VSLA name and code */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" /> {/* VSLA name */}
                  <Skeleton className="h-3 w-24" /> {/* VSLA code */}
                </div>
                {/* Organization cell */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" /> {/* Acronym */}
                  <Skeleton className="h-3 w-32" /> {/* Full name */}
                </div>
                <Skeleton className="h-4 w-24" /> {/* Cluster */}
                {/* Members cell with icon */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" /> {/* Users icon */}
                  <Skeleton className="h-4 w-8" /> {/* Member count */}
                </div>
                <Skeleton className="h-4 w-24" /> {/* Total Savings */}
                <Skeleton className="h-4 w-24" /> {/* Total Loans */}
                {/* Meeting Frequency badge */}
                <Skeleton className="h-6 w-16 rounded-full" />
                {/* Status badge */}
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" /> {/* Formed Date */}
                {/* Actions dropdown */}
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Table pagination skeleton */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" /> {/* Selected rows count */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" /> {/* Rows per page label */}
                <Skeleton className="h-8 w-16" /> {/* Page size selector */}
              </div>
              <Skeleton className="h-4 w-24" /> {/* Page info */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" /> {/* First page button */}
                <Skeleton className="h-8 w-8" /> {/* Previous button */}
                <Skeleton className="h-8 w-8" /> {/* Next button */}
                <Skeleton className="h-8 w-8" /> {/* Last page button */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
