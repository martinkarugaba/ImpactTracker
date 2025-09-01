"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";
import { type ParticipantCardProps } from "./types";

export function ParticipantCard({
  participant,
  isSelected,
  onToggle,
}: ParticipantCardProps) {
  return (
    <div
      className={`group hover:bg-muted/50 cursor-pointer border-b border-gray-100 p-4 transition-all dark:border-gray-800 ${
        isSelected
          ? "bg-blue-50/50 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:ring-blue-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
      onClick={() => onToggle(participant, !isSelected)}
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={isSelected}
          onChange={() => {}} // Handled by parent div click
          className="pointer-events-none"
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {participant.firstName} {participant.lastName}
              </h4>
              {(participant.designation || participant.organizationName) && (
                <p className="text-muted-foreground text-sm">
                  {[participant.designation, participant.organizationName]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
            </div>
            {isSelected && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                Selected
              </Badge>
            )}
          </div>
          {participant.contact && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {participant.contact}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
