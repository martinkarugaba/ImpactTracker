"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { MembersMetrics } from "./members-metrics";
import { MembersFilters } from "./members-filters";
import { MembersTable } from "./members-table";
import {
  getClusterMembers,
  getMembersMetrics,
  type MembersFilters as MembersFiltersType,
  type ClusterMember,
} from "../actions/members";

export function MembersContainer() {
  const [filters, setFilters] = useState<MembersFiltersType>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ClusterMember | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState<{ [key: string]: boolean }>({});

  // Fetch members
  const {
    data: membersResult,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["cluster-members", filters],
    queryFn: () => getClusterMembers(1, 20, filters),
  });

  // Fetch metrics
  const { data: metricsResult, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["members-metrics"],
    queryFn: getMembersMetrics,
  });

  const handleViewMember = (member: ClusterMember) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsRemoving(prev => ({ ...prev, [memberId]: true }));
    try {
      // TODO: Implement remove member functionality
      console.log("Remove member:", memberId);
      await refetchMembers();
    } finally {
      setIsRemoving(prev => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <MembersMetrics
        metrics={metricsResult?.data || null}
        isLoading={isLoadingMetrics}
      />

      {/* Content Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-80">
          <MembersFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoadingMembers}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Cluster Members</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  {/* TODO: Add AddMemberDialog component */}
                  <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Add Member</h3>
                    <p className="text-muted-foreground">
                      Add member dialog component will be implemented here.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Members Table */}
            <MembersTable
              members={membersResult?.data?.members || []}
              isLoading={isLoadingMembers}
              onViewMember={handleViewMember}
              onRemoveMember={handleRemoveMember}
              isRemoving={isRemoving}
            />

            {/* TODO: Add pagination if needed */}
          </div>
        </main>
      </div>

      {/* Member Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedMember && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedMember.organization.name}
                </h3>
                <p className="text-muted-foreground">
                  {selectedMember.organization.acronym}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Organization Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      Acronym: {selectedMember.organization.acronym || "N/A"}
                    </p>
                    <p>
                      Address: {selectedMember.organization.address || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Location</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      District: {selectedMember.organization.district || "N/A"}
                    </p>
                    <p>
                      Country: {selectedMember.organization.country || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedMember.project && (
                  <div className="md:col-span-2">
                    <h4 className="mb-2 font-medium">Current Project</h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">
                        {selectedMember.project.name}
                      </p>
                      {selectedMember.project.acronym && (
                        <p className="text-muted-foreground">
                          {selectedMember.project.acronym}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h4 className="mb-2 font-medium">Membership Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      Added:{" "}
                      {new Date(selectedMember.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      Last Updated:{" "}
                      {new Date(selectedMember.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
