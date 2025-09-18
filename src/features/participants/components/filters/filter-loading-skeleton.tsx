"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ParticipantFiltersLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Filter */}
        <Skeleton className="h-10 w-[250px]" />

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[80px]" />
          <Skeleton className="h-10 w-[70px]" />
          <Skeleton className="h-10 w-[90px]" />
        </div>

        {/* More Filters Button */}
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Active Filter Badges Area (sometimes present) */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-[80px] rounded-full" />
        <Skeleton className="h-6 w-[100px] rounded-full" />
        <Skeleton className="h-6 w-[60px] rounded-full" />
      </div>
    </div>
  );
}
