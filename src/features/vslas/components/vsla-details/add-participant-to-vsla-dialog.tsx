"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Search, Users } from "lucide-react";
import { getParticipants } from "@/features/participants/actions";
import { createVSLAMember } from "../../actions/vsla-members";
import { Participant } from "@/features/participants/types/types";
import { toast } from "sonner";

interface AddParticipantToVSLADialogProps {
  vslaId: string;
  clusterId?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddParticipantToVSLADialog({
  vslaId,
  clusterId,
  children,
  onSuccess,
}: AddParticipantToVSLADialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const loadParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      if (clusterId) {
        const result = await getParticipants(clusterId);
        if (result.success && result.data?.data) {
          setParticipants(result.data.data);
        }
      } else {
        // Try to get participants by fetching VSLA data first
        const vslaResult = await fetch(`/api/vslas/${vslaId}`);
        if (vslaResult.ok) {
          const vslaData = await vslaResult.json();
          const vslaClusterId = vslaData.cluster_id;

          if (vslaClusterId) {
            const result = await getParticipants(vslaClusterId);
            if (result.success && result.data?.data) {
              setParticipants(result.data.data);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, [clusterId, vslaId]);

  useEffect(() => {
    if (open) {
      loadParticipants();
    }
  }, [open, loadParticipants]);

  useEffect(() => {
    const filtered = participants.filter(
      participant =>
        participant.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.contact.includes(searchTerm)
    );
    setFilteredParticipants(filtered);
  }, [participants, searchTerm]);

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleAddToVSLA = async () => {
    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedParticipants.map(participantId => {
        const participant = participants.find(p => p.id === participantId);
        if (!participant) return Promise.resolve();

        return createVSLAMember({
          vsla_id: vslaId,
          first_name: participant.firstName,
          last_name: participant.lastName,
          phone: participant.contact,
          email: "", // Participants don't have email in the schema
          role: "member",
          joined_date: new Date(),
          total_savings: 0,
          total_loans: 0,
          status: "active",
        });
      });

      const results = await Promise.all(promises);
      const successful = results.filter(
        result => result && result.success
      ).length;

      if (successful > 0) {
        toast.success(
          `Successfully added ${successful} participant${
            successful > 1 ? "s" : ""
          } to VSLA`
        );
        setOpen(false);
        setSelectedParticipants([]);
        onSuccess?.();
      } else {
        toast.error("Failed to add participants to VSLA");
      }
    } catch (error) {
      console.error("Error adding participants to VSLA:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Participants to VSLA</DialogTitle>
          <DialogDescription>
            Select existing participants to add as members to this VSLA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search participants by name or contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Count */}
          {selectedParticipants.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedParticipants.length} participant
                {selectedParticipants.length > 1 ? "s" : ""} selected
              </Badge>
            </div>
          )}

          {/* Participants List */}
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="text-muted-foreground">
                  Loading participants...
                </div>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <div className="text-muted-foreground">
                  {searchTerm
                    ? "No participants found"
                    : "No participants available"}
                </div>
              </div>
            ) : (
              filteredParticipants.map(participant => (
                <div
                  key={participant.id}
                  className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3"
                >
                  <Checkbox
                    checked={selectedParticipants.includes(participant.id)}
                    onCheckedChange={() =>
                      handleParticipantToggle(participant.id)
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
                        className="capitalize"
                      >
                        {participant.isActive === "yes" ? "active" : "inactive"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <span>{participant.contact}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedParticipants([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToVSLA}
              disabled={isLoading || selectedParticipants.length === 0}
            >
              {isLoading
                ? "Adding..."
                : `Add ${selectedParticipants.length} Participant${
                    selectedParticipants.length > 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
