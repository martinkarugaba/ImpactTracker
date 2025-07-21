import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 10,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="space-y-4">
          {/* Table toolbar skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-64" /> {/* Search input */}
              <Skeleton className="h-10 w-32" /> {/* Filter button */}
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-24" /> {/* View toggle */}
              <Skeleton className="h-10 w-28" /> {/* Export button */}
              <Skeleton className="h-10 w-32" /> {/* Add button */}
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
            <Skeleton className="h-4 w-20" /> {/* Gender column */}
            <Skeleton className="h-4 w-16" /> {/* Age column */}
            <Skeleton className="h-4 w-28" /> {/* District column */}
            <Skeleton className="h-4 w-32" /> {/* Organization column */}
            <Skeleton className="h-4 w-24" /> {/* Project column */}
            <Skeleton className="h-4 w-16" /> {/* PWD column */}
            <Skeleton className="h-4 w-20" /> {/* Actions column */}
          </div>
        </div>

        {/* Table rows skeleton */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" /> {/* Checkbox */}
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" /> {/* Name */}
                    <Skeleton className="h-3 w-24" /> {/* Email or subtitle */}
                  </div>
                </div>
                <Skeleton className="h-4 w-16" /> {/* Gender */}
                <Skeleton className="h-4 w-12" /> {/* Age */}
                <Skeleton className="h-4 w-24" /> {/* District */}
                <Skeleton className="h-4 w-28" /> {/* Organization */}
                <Skeleton className="h-4 w-20" /> {/* Project */}
                <Skeleton className="h-4 w-10" /> {/* PWD status */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded" /> {/* View button */}
                  <Skeleton className="h-8 w-8 rounded" /> {/* Edit button */}
                  <Skeleton className="h-8 w-8 rounded" /> {/* Delete button */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table pagination skeleton */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" /> {/* Results count */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20" /> {/* Previous button */}
              <div className="flex items-center space-x-1">
                <Skeleton className="h-8 w-8" /> {/* Page number */}
                <Skeleton className="h-8 w-8" /> {/* Page number */}
                <Skeleton className="h-8 w-8" /> {/* Page number */}
              </div>
              <Skeleton className="h-8 w-16" /> {/* Next button */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
