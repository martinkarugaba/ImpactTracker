"use client";

import { useState, useEffect } from "react";
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
import {
  UserX,
  Users,
  AlertTriangle,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  findAllDuplicates,
  deleteParticipants,
  type DuplicateGroup,
  type AllDuplicatesResult,
} from "../../actions/find-all-duplicates";
import toast from "react-hot-toast";

interface EnhancedFixDuplicatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteCompleted?: (deletedCount: number) => void;
}

export function EnhancedFixDuplicatesDialog({
  open,
  onOpenChange,
  onDeleteCompleted,
}: EnhancedFixDuplicatesDialogProps) {
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicatesData, setDuplicatesData] =
    useState<AllDuplicatesResult | null>(null);

  // Load duplicates when dialog opens
  useEffect(() => {
    if (open && !duplicatesData) {
      loadDuplicates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadDuplicates = async () => {
    setIsLoading(true);
    try {
      const result = await findAllDuplicates();
      setDuplicatesData(result);
      setSelectedForDeletion([]); // Reset selection
    } catch (error) {
      console.error("Error loading duplicates:", error);
      toast.error("Failed to load duplicate participants");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setDuplicatesData(null);
    loadDuplicates();
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

  const handleDeleteSelected = async () => {
    if (selectedForDeletion.length === 0) {
      toast.error("Please select participants to delete");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedForDeletion.length} participants? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteParticipants(selectedForDeletion);
      toast.success(
        `Successfully deleted ${selectedForDeletion.length} duplicate participants`
      );

      onDeleteCompleted?.(selectedForDeletion.length);
      setSelectedForDeletion([]);

      // Refresh the duplicates data
      await loadDuplicates();
    } catch (error) {
      toast.error("Failed to delete participants");
      console.error("Error deleting participants:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatParticipantName = (
    participant: DuplicateGroup["participants"][0]
  ) => {
    return `${participant.firstName || ""} ${participant.lastName || ""}`.trim();
  };

  const formatContact = (contact: string | null) => {
    if (!contact) return "—";
    // Format phone number with spaces for readability
    return contact.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  };

  const getGroupTypeLabel = (type: "name" | "contact") => {
    return type === "name" ? "Name Match" : "Contact Match";
  };

  const getGroupTypeColor = (type: "name" | "contact") => {
    return type === "name"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Loading Duplicates
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-600">
              Scanning all participants for duplicates...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const duplicateGroups = duplicatesData?.duplicateGroups || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-6xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <DialogTitle>
                Fix Duplicate Participants - All Database
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <DialogDescription>
            {duplicateGroups.length > 0 ? (
              <>
                Found {duplicateGroups.length} groups of potential duplicates
                across{" "}
                <strong>{duplicatesData?.totalDuplicates} participants</strong>{" "}
                in the entire database. Review and select participants to
                remove.
              </>
            ) : (
              "No duplicate participants found based on name and contact information across the entire database."
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
                contact information across the entire database.
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
                      <Badge
                        variant="outline"
                        className={`${getGroupTypeColor(group.type)} border-current`}
                      >
                        {getGroupTypeLabel(group.type)}
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
                      <span className="text-sm text-gray-600">Select All</span>
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
                          <TableHead>Sub County</TableHead>
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
                              {participant.subCounty || "—"}
                            </TableCell>
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
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete Selected`
              )}
              {selectedForDeletion.length > 0 &&
                ` (${selectedForDeletion.length})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
