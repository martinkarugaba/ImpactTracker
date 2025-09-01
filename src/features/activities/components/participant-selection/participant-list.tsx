"use client";

import { Loader2, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticipantCard } from "./participant-card";
import { type ParticipantListProps } from "./types";

export function ParticipantList({
  participants,
  selectedParticipants,
  onParticipantToggle,
  isLoading = false,
  isFetching = false,
}: ParticipantListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground mt-2 text-sm">
            Loading participants...
          </p>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Users className="text-muted-foreground h-6 w-6" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            No participants yet
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Get started by creating your first participant.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Create First Participant
        </Button>
      </div>
    );
  }

  return (
    <div className="relative divide-y">
      {isFetching && !isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500" />
            <p className="text-muted-foreground mt-1 text-xs">Searching...</p>
          </div>
        </div>
      )}
      <div className="bg-muted/30 px-4 py-2">
        <p className="text-muted-foreground text-xs font-medium">
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {participants.map(participant => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            isSelected={selectedParticipants.some(p => p.id === participant.id)}
            onToggle={onParticipantToggle}
          />
        ))}
      </div>
    </div>
  );
}
