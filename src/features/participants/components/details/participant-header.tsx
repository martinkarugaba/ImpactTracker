"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { EditParticipantDialog } from "../edit-participant-dialog";
import {
  getInitials,
  getGenderBadge,
  getAgeBadge,
  getStatusBadge,
} from "./details-utils";
import { type Participant } from "../../types/types";

interface ParticipantHeaderProps {
  participant: Participant;
  profilePhoto: string | null;
  onBack?: () => void;
  showActions?: boolean;
  onSuccess?: () => void;
}

export function ParticipantHeader({
  participant,
  profilePhoto,
  onBack,
  showActions = true,
  onSuccess,
}: ParticipantHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Profile Photo Section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage
                  src={profilePhoto || undefined}
                  alt={`${participant.firstName} ${participant.lastName}`}
                />
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {getInitials(participant.firstName, participant.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Participant Info */}
            <div>
              <CardTitle className="text-2xl">
                {participant.firstName} {participant.lastName}
              </CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {getGenderBadge(participant.sex)}
                {getAgeBadge(participant.age)}
                {getStatusBadge(participant.isPWD)}
              </div>
            </div>
          </div>
          {showActions && (
            <EditParticipantDialog
              participant={participant}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
