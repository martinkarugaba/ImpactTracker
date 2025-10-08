"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ParticipantsPageSkeletonProps {
  showActions?: boolean;
  showFilters?: boolean;
  showTable?: boolean;
  tableRows?: number;
}

export function ParticipantsPageSkeleton({
  showActions = true,
  showFilters = true,
  showTable = true,
  tableRows = 6,
}: ParticipantsPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Action Buttons Header - Minimal */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[80px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
          <Skeleton className="h-9 w-[120px]" />
        </div>
      )}

      {/* Filters Section - Minimal Card */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-[50px]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full max-w-[300px]" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Section - Simplified */}
      {showTable && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[140px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>

          <div className="space-y-2 rounded-md border p-4">
            {/* Table Header */}
            <div className="flex items-center gap-4 border-b pb-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>

            {/* Table Rows */}
            {Array.from({ length: tableRows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-4 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[40px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Specific skeleton components for different sections
export function ParticipantsActionsLoadingSkeleton() {
  return (
    <ParticipantsPageSkeleton
      showActions={true}
      showFilters={false}
      showTable={false}
    />
  );
}

export function ParticipantsTableLoadingSkeleton({
  rows = 6,
}: {
  rows?: number;
}) {
  return (
    <ParticipantsPageSkeleton
      showActions={false}
      showFilters={false}
      showTable={true}
      tableRows={rows}
    />
  );
}

export function ParticipantsFiltersLoadingSkeleton() {
  return (
    <ParticipantsPageSkeleton
      showActions={false}
      showFilters={true}
      showTable={false}
    />
  );
}
