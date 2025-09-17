"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserX, Users, AlertTriangle, Trash2 } from "lucide-react";
import { type Participant } from "../../types/types";
import toast from "react-hot-toast";

interface FixDuplicatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  onDeleteParticipants?: (ids: string[]) => void;
}

interface DuplicateGroup {
  key: string;
  participants: Participant[];
  duplicateFields: string[];
}

export function FixDuplicatesDialog({
  open,
  onOpenChange,
  participants,
  onDeleteParticipants,
}: FixDuplicatesDialogProps) {
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find duplicate participants based on name and contact
  const findDuplicates = (): DuplicateGroup[] => {
    const groups: Record<string, Participant[]> = {};

    participants.forEach(participant => {
      // Create a key based on name and contact for duplicate detection
      const nameKey = `${participant.firstName?.toLowerCase().trim()} ${participant.lastName?.toLowerCase().trim()}`;
      const contactKey = participant.contact?.replace(/\D/g, ""); // Remove non-digits from contact

      // Check for name duplicates
      if (nameKey && nameKey !== " ") {
        const key = `name:${nameKey}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(participant);
      }

      // Check for contact duplicates
      if (contactKey && contactKey.length >= 9) {
        // Only consider valid phone numbers
        const key = `contact:${contactKey}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(participant);
      }
    });

    // Filter groups that have more than one participant
    return Object.entries(groups)
      .filter(([_, participants]) => participants.length > 1)
      .map(([key, participants]) => {
        const [type] = key.split(":");
        return {
          key,
          participants,
          duplicateFields: [type === "name" ? "Name" : "Contact"],
        };
      });
  };

  const duplicateGroups = findDuplicates();

  const handleSelectAllInGroup = (group: DuplicateGroup, checked: boolean) => {
    const groupIds = group.participants.map(p => p.id);
    setSelectedForDeletion(prev => {
      if (checked) {
        // Add all IDs from this group that aren't already selected
        const newIds = groupIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      } else {
        // Remove all IDs from this group
        return prev.filter(id => !groupIds.includes(id));
      }
    });
  };

  const isGroupFullySelected = (group: DuplicateGroup) => {
    return group.participants.every(p => selectedForDeletion.includes(p.id));
  };

  const isGroupPartiallySelected = (group: DuplicateGroup) => {
    return (
      group.participants.some(p => selectedForDeletion.includes(p.id)) &&
      !isGroupFullySelected(group)
    );
  };

  const handleSelectForDeletion = (participantId: string, checked: boolean) => {
    setSelectedForDeletion(prev => {
      if (checked) {
        return [...prev, participantId];
      } else {
        return prev.filter(id => id !== participantId);
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedForDeletion.length === 0) {
      toast.error("Please select participants to delete");
      return;
    }

    setIsProcessing(true);
    try {
      if (onDeleteParticipants) {
        await onDeleteParticipants(selectedForDeletion);
        toast.success(
          `Successfully deleted ${selectedForDeletion.length} duplicate participants`
        );
        setSelectedForDeletion([]);
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to delete participants");
      console.error("Error deleting participants:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatParticipantName = (participant: Participant) => {
    return `${participant.firstName || ""} ${participant.lastName || ""}`.trim();
  };

  const formatContact = (contact: string | null) => {
    if (!contact) return "—";
    // Format phone number with spaces for readability
    return contact.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-[95vw] flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Duplicate Participants
          </DialogTitle>
          <DialogDescription>
            {duplicateGroups.length > 0 ? (
              <>
                Found {duplicateGroups.length} groups of potential duplicates.
                Review and select participants to remove.
              </>
            ) : (
              "No duplicate participants found based on name and contact information."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {duplicateGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                <UserX className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No Duplicates Found</h3>
              <p className="text-muted-foreground mt-2 text-center text-sm">
                All participants appear to be unique based on their name and
                contact information.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pr-4">
              {duplicateGroups.map((group, groupIndex) => (
                <div
                  key={group.key}
                  className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        Duplicate Group {groupIndex + 1}
                      </h4>
                      <Badge variant="outline" className="text-orange-700">
                        {group.duplicateFields.join(", ")} Match
                      </Badge>
                      <Badge variant="secondary">
                        {group.participants.length} participants
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isGroupFullySelected(group)}
                        ref={ref => {
                          if (ref && "indeterminate" in ref) {
                            (ref as HTMLInputElement).indeterminate =
                              isGroupPartiallySelected(group);
                          }
                        }}
                        onCheckedChange={checked =>
                          handleSelectAllInGroup(group, !!checked)
                        }
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Select All in Group
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Select</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.participants.map(participant => (
                          <TableRow key={participant.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedForDeletion.includes(
                                  participant.id
                                )}
                                onCheckedChange={checked =>
                                  handleSelectForDeletion(
                                    participant.id,
                                    !!checked
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatParticipantName(participant)}
                            </TableCell>
                            <TableCell>
                              {formatContact(participant.contact)}
                            </TableCell>
                            <TableCell>{participant.district || "—"}</TableCell>
                            <TableCell>
                              {participant.organizationName ||
                                participant.organization_id ||
                                "—"}
                            </TableCell>
                            <TableCell>
                              {participant.created_at
                                ? new Date(
                                    participant.created_at
                                  ).toLocaleDateString()
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}

              {selectedForDeletion.length > 0 && (
                <div className="bg-muted sticky bottom-0 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span className="font-medium">
                        {selectedForDeletion.length} participant(s) selected for
                        deletion
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedForDeletion([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {duplicateGroups.length === 0 ? "Close" : "Cancel"}
          </Button>
          {duplicateGroups.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={selectedForDeletion.length === 0 || isProcessing}
            >
              {isProcessing ? "Deleting..." : `Delete Selected`}
              {selectedForDeletion.length > 0 &&
                ` (${selectedForDeletion.length})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
