"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ParticipantsPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-muted flex items-center space-x-1 rounded-lg p-1">
        <div className="flex-1">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filters Card */}
      <div className="rounded-lg border p-4">
        <div className="mb-3">
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-18" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Table/Content Rows */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded" />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep existing exports for compatibility
export const ParticipantsActionsLoadingSkeleton = ParticipantsPageSkeleton;
export const ParticipantsTableLoadingSkeleton = ParticipantsPageSkeleton;
export const ParticipantsFiltersLoadingSkeleton = ParticipantsPageSkeleton;
