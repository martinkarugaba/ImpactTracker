"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Users, Building2 } from "lucide-react";
import { assignParticipantsBySubCounty } from "../../actions/fix-organization-assignments";

interface AdvancedAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subCounties: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string; acronym?: string }>;
}

export function AdvancedAssignmentDialog({
  isOpen,
  onOpenChange,
  subCounties,
  organizations,
}: AdvancedAssignmentDialogProps) {
  const [selectedSubCounty, setSelectedSubCounty] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const queryClient = useQueryClient();

  // Mutation for assigning participants by subcounty
  const assignMutation = useMutation({
    mutationFn: ({
      subCounty,
      organizationId,
    }: {
      subCounty: string;
      organizationId: string;
    }) => assignParticipantsBySubCounty(subCounty, organizationId),
    onSuccess: result => {
      if (result.success) {
        toast.success("Assignment completed", {
          description: result.message,
        });
        // Invalidate participants query to refresh the table
        queryClient.invalidateQueries({ queryKey: ["participants"] });
        onOpenChange(false);
        setSelectedSubCounty("");
        setSelectedOrganization("");
      } else {
        toast.error("Assignment failed", {
          description: result.error,
        });
      }
    },
    onError: error => {
      toast.error("Error during assignment", {
        description: error.message,
      });
    },
  });

  const handleAssign = () => {
    if (!selectedSubCounty || !selectedOrganization) {
      toast.error("Please select both subcounty and organization");
      return;
    }

    const subCountyName = subCounties.find(
      sc => sc.id === selectedSubCounty
    )?.name;
    if (!subCountyName) {
      toast.error("Invalid subcounty selection");
      return;
    }

    assignMutation.mutate({
      subCounty: subCountyName,
      organizationId: selectedOrganization,
    });
  };

  const selectedSubCountyName = subCounties.find(
    sc => sc.id === selectedSubCounty
  )?.name;

  const selectedOrg = organizations.find(
    org => org.id === selectedOrganization
  );

  // Helper function to get organization display name
  const getOrgDisplayName = (org: { name: string; acronym?: string }) => {
    if (org.acronym && org.acronym.trim()) {
      return `${org.acronym} (${org.name})`;
    }
    return org.name;
  };

  const selectedOrganizationName = selectedOrg
    ? getOrgDisplayName(selectedOrg)
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Participants by Subcounty</DialogTitle>
          <DialogDescription>
            Assign all participants from a specific subcounty to an
            organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subcounty">Subcounty</Label>
              <Select
                value={selectedSubCounty}
                onValueChange={setSelectedSubCounty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcounty" />
                </SelectTrigger>
                <SelectContent>
                  {subCounties.map(subCounty => (
                    <SelectItem key={subCounty.id} value={subCounty.id}>
                      {subCounty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Target Organization</Label>
              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {getOrgDisplayName(org)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Section */}
          {selectedSubCountyName && selectedOrganizationName && (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Assignment Preview
              </div>
              <div className="text-muted-foreground text-sm">
                All participants from{" "}
                <Badge variant="outline">{selectedSubCountyName}</Badge> will be
                assigned to{" "}
                <Badge variant="default">{selectedOrganizationName}</Badge>
              </div>
            </div>
          )}

          {/* Success Message */}
          {assignMutation.isSuccess && assignMutation.data?.success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Assignment Completed</span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                {assignMutation.data.message}
              </p>
              {assignMutation.data.details && (
                <div className="mt-2 text-xs text-green-600">
                  <p>
                    Updated{" "}
                    {assignMutation.data.details.participantsUpdated || 0} out
                    of {assignMutation.data.details.participantsFound || 0}{" "}
                    participants
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                !selectedSubCounty ||
                !selectedOrganization ||
                assignMutation.isPending
              }
            >
              {assignMutation.isPending ? (
                "Assigning..."
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Assign Participants
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
