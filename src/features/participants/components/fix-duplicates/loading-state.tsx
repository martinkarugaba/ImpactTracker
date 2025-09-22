"use client";

import { useAtomValue } from "jotai";
import { Search } from "lucide-react";
import { isLoadingDuplicatesAtom } from "./atoms";

export function LoadingState() {
  const isLoading = useAtomValue(isLoadingDuplicatesAtom);

  if (!isLoading) return null;

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Search className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
          <div className="absolute inset-0 mx-auto h-16 w-16 animate-ping rounded-full bg-blue-100 opacity-30 dark:bg-blue-900" />
        </div>
        <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-gray-100">
          Scanning for duplicates
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This may take a moment...
        </p>
      </div>
    </div>
  );
}
