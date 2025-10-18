"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAtomValue } from "jotai";
import { duplicatesDataAtom, totalDuplicateCountAtom } from "./atoms";
import { useDuplicatesActions } from "./hooks";

export function DialogHeader() {
  const duplicatesData = useAtomValue(duplicatesDataAtom);
  const totalDuplicateCount = useAtomValue(totalDuplicateCountAtom);
  const { handleRefresh, isLoading } = useDuplicatesActions();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            Enhanced Duplicate Detection
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="ml-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        {duplicatesData && (
          <div className="text-sm text-muted-foreground">
            Found {duplicatesData.totalGroups} duplicate groups with{" "}
            {totalDuplicateCount} participants
          </div>
        )}
      </div>

      <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>District-Based Detection:</strong> Only participants from the
          same district are considered for duplicate detection. Participants in
          different districts are treated as separate individuals, even with
          similar names or contact numbers.
        </p>
      </div>
    </div>
  );
}
