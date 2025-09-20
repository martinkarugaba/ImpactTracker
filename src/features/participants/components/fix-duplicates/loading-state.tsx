"use client";

import { useAtomValue } from "jotai";
import { UserX } from "lucide-react";
import { isLoadingDuplicatesAtom } from "./atoms";
import { LoadingSkeleton } from "./loading-skeleton";

export function LoadingState() {
  const isLoading = useAtomValue(isLoadingDuplicatesAtom);

  if (!isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <UserX className="mx-auto h-12 w-12 animate-pulse text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Scanning for Duplicates</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Analyzing participant data across the entire database...
          </p>
        </div>
      </div>
      <LoadingSkeleton />
    </div>
  );
}
