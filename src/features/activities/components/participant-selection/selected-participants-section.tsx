"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type SelectedParticipantsSectionProps } from "./types";

export function SelectedParticipantsSection({
  selectedParticipants,
  onClearAll,
}: SelectedParticipantsSectionProps) {
  if (selectedParticipants.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-blue-50/50 p-4 transition-all duration-200 ease-in-out dark:bg-blue-950/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            {selectedParticipants.length}
          </div>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Selected for addition
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-auto p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-300"
        >
          Clear all
        </Button>
      </div>
      <div className="mt-3 max-h-20 overflow-y-auto">
        <div className="flex flex-wrap gap-1.5">
          {selectedParticipants.map(participant => (
            <Badge
              key={participant.id}
              variant="secondary"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              {participant.firstName} {participant.lastName}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
