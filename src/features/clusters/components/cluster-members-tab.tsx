"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getClusterMembers,
  getNonMemberOrganizations,
  addClusterMember,
  removeClusterMember,
} from "../actions/clusters";

interface ClusterMembersTabProps {
  clusterId: string;
}

// Import the ClusterMember type from types.ts instead of redefining it
import type { ClusterMember } from "../actions/types";

interface Organization {
  id: string;
  name: string;
  acronym: string;
}

export function ClusterMembersTab({ clusterId }: ClusterMembersTabProps) {
  const [members, setMembers] = useState<ClusterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [availableOrganizations, setAvailableOrganizations] = useState<
    Organization[]
  >([]);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemoving, setIsRemoving] = useState<{ [key: string]: boolean }>({});

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClusterMembers(clusterId);
      if (result.success && result.data) {
        setMembers(result.data);
      } else {
        toast.error(result.error || "Failed to load cluster members");
      }
    } catch {
      toast.error("An error occurred while fetching cluster members");
    } finally {
      setLoading(false);
    }
  }, [clusterId]);

  const fetchAvailableOrganizations = async () => {
    try {
      const result = await getNonMemberOrganizations(clusterId);
      if (result.success && result.data) {
        const organizations = result.data.map(org => ({
          id: org.id as string,
          name: org.name as string,
          acronym: org.acronym as string,
        }));
        setAvailableOrganizations(organizations);
      } else {
        toast.error(result.error || "Failed to load available organizations");
      }
    } catch {
      toast.error("An error occurred while fetching available organizations");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddDialogOpen = async () => {
    await fetchAvailableOrganizations();
    setIsAddDialogOpen(true);
  };

  const handleAddMember = async () => {
    if (!selectedOrganizationId) {
      toast.error("Please select an organization to add");
      return;
    }

    setIsAddingMember(true);
    try {
      const result = await addClusterMember(clusterId, selectedOrganizationId);
      if (result.success) {
        toast.success("Organization added to cluster successfully");
        fetchMembers(); // Refresh the member list
        setIsAddDialogOpen(false);
        setSelectedOrganizationId("");
      } else {
        toast.error(result.error || "Failed to add organization to cluster");
      }
    } catch {
      toast.error("An error occurred while adding organization to cluster");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsRemoving(prev => ({ ...prev, [memberId]: true }));
    try {
      const result = await removeClusterMember(memberId, clusterId);
      if (result.success) {
        toast.success("Organization removed from cluster successfully");
        fetchMembers(); // Refresh the member list
      } else {
        toast.error(
          result.error || "Failed to remove organization from cluster"
        );
      }
    } catch {
      toast.error("An error occurred while removing organization from cluster");
    } finally {
      setIsRemoving(prev => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cluster Members</CardTitle>
          <CardDescription>
            Organizations that belong to this cluster
          </CardDescription>
        </div>
        <Button onClick={handleAddDialogOpen} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Member
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <p>Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">
              No organizations are members of this cluster yet
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Acronym</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>{member.organization.name}</TableCell>
                  <TableCell>{member.organization.acronym}</TableCell>
                  <TableCell>
                    {member.created_at
                      ? new Date(member.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isRemoving[member.id]}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Organization to Cluster</DialogTitle>
            <DialogDescription>
              Select an organization to add as a member of this cluster
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Organization
              </label>
              <Select
                value={selectedOrganizationId}
                onValueChange={setSelectedOrganizationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableOrganizations.length === 0 ? (
                      <SelectItem value="no-orgs" disabled>
                        No available organizations
                      </SelectItem>
                    ) : (
                      availableOrganizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.acronym})
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={isAddingMember || !selectedOrganizationId}
              >
                {isAddingMember ? "Adding..." : "Add Organization"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
