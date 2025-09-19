"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ParticipantFiltersLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Filter with icon placeholder */}
        <div className="relative">
          <Skeleton className="h-10 w-[280px]" />
          <div className="absolute top-3 left-3">
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>

        {/* Quick Filters - More realistic sizes */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-[60px] rounded-full" />
          <Skeleton className="h-8 w-[70px] rounded-full" />
          <Skeleton className="h-8 w-[80px] rounded-full" />
          <Skeleton className="h-8 w-[65px] rounded-full" />
        </div>

        {/* More Filters Button with icon */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-6 w-6 rounded-full opacity-60" />
        </div>
      </div>

      {/* Active Filter Badges - More varied and realistic */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-[90px] rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full opacity-40" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-[110px] rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full opacity-40" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-[75px] rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full opacity-40" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-[95px] rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full opacity-40" />
        </div>
      </div>
    </div>
  );
}
