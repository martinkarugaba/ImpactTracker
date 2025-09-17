"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Search, Users, Loader2 } from "lucide-react";
import { useParticipants } from "@/features/participants/hooks/use-participants";
import { type Participant } from "@/features/participants/types/types";
import { toast } from "sonner";

interface VSLAParticipantSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParticipantsSelected: (participants: Participant[]) => Promise<void>;
  clusterId: string;
  title?: string;
  description?: string;
  maxSelection?: number;
}

export function VSLAParticipantSelectionDialog({
  open,
  onOpenChange,
  onParticipantsSelected,
  clusterId,
  title = "Add Participants to VSLA",
  description = "Select existing participants to add as members to this VSLA.",
  maxSelection,
}: VSLAParticipantSelectionDialogProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch participants
  const { data: participantsResponse, isLoading: loadingParticipants } =
    useParticipants(clusterId, {
      limit: 100,
      search: debouncedSearchTerm,
    });

  const availableParticipants = participantsResponse?.data?.data || [];

  const handleParticipantToggle = (
    participant: Participant,
    checked: boolean
  ) => {
    if (checked) {
      if (maxSelection && selectedParticipants.length >= maxSelection) {
        toast.error(`You can only select up to ${maxSelection} participants`);
        return;
      }
      setSelectedParticipants(prev => [...prev, participant]);
    } else {
      setSelectedParticipants(prev =>
        prev.filter(p => p.id !== participant.id)
      );
    }
  };

  const handleClearAll = () => {
    setSelectedParticipants([]);
  };

  const handleAddSelected = async () => {
    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    setIsSubmitting(true);
    try {
      await onParticipantsSelected(selectedParticipants);
      setSelectedParticipants([]);
      setSearchTerm("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredParticipants = availableParticipants.filter(participant =>
    selectedParticipants.every(selected => selected.id !== participant.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search participants by name or contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Selected Participants */}
          {selectedParticipants.length > 0 && (
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Selected Participants ({selectedParticipants.length})
                  {maxSelection && ` / ${maxSelection}`}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedParticipants.map(participant => (
                  <Badge
                    key={participant.id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleParticipantToggle(participant, false)}
                  >
                    {participant.firstName} {participant.lastName}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Participants List */}
          <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border">
            {loadingParticipants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading participants...</span>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="text-muted-foreground mb-4 h-12 w-12" />
                <div className="text-muted-foreground text-center">
                  {searchTerm
                    ? `No participants found matching "${searchTerm}"`
                    : "No participants available"}
                </div>
              </div>
            ) : (
              <div className="p-2">
                {filteredParticipants.map(participant => (
                  <div
                    key={participant.id}
                    className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg p-3"
                  >
                    <Checkbox
                      checked={selectedParticipants.some(
                        p => p.id === participant.id
                      )}
                      onCheckedChange={checked =>
                        handleParticipantToggle(participant, !!checked)
                      }
                      disabled={
                        !!maxSelection &&
                        selectedParticipants.length >= maxSelection &&
                        !selectedParticipants.some(p => p.id === participant.id)
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {participant.firstName} {participant.lastName}
                        </span>
                        <Badge
                          variant={
                            participant.isActive === "yes"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {participant.isActive === "yes"
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <span>{participant.contact}</span>
                        {participant.designation && (
                          <span>• {participant.designation}</span>
                        )}
                        {participant.enterprise && (
                          <span>• {participant.enterprise}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedParticipants([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={isSubmitting || selectedParticipants.length === 0}
            >
              {isSubmitting
                ? "Adding..."
                : `Add ${selectedParticipants.length} Participant${
                    selectedParticipants.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
