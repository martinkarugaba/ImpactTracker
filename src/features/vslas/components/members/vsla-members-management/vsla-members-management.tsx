"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Filter, Download, Upload } from "lucide-react";
import { VSLA } from "../../../types";
import { VSLAMember, getVSLAMembers } from "../../../actions/vsla-members";
import {
  AddVSLAMemberDialog,
  AddParticipantToVSLADialog,
  EditVSLAMemberDialog,
} from "../../dialogs";
import { createVSLAMembersColumns } from "./vsla-members-columns";
import { VSLAMembersStats } from "./vsla-members-stats";
import { toast } from "sonner";

interface VSLAMembersManagementProps {
  vsla: VSLA;
}

export function VSLAMembersManagement({ vsla }: VSLAMembersManagementProps) {
  const [members, setMembers] = useState<VSLAMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<VSLAMember | null>(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getVSLAMembers(vsla.id);
      if (result.success && result.data) {
        setMembers(result.data);
      } else {
        toast.error("Failed to load members");
      }
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Error loading members");
    } finally {
      setIsLoading(false);
    }
  }, [vsla.id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const columns = createVSLAMembersColumns({
    onMemberUpdated: loadMembers,
    onEditMember: setEditingMember,
  });

  const handleSuccess = () => {
    loadMembers();
    toast.success("Member added successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Member Management</h1>
            <p className="text-muted-foreground">
              Manage members for {vsla.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {vsla.cluster_id && (
            <AddParticipantToVSLADialog
              vslaId={vsla.id}
              clusterId={vsla.cluster_id}
              onSuccess={handleSuccess}
            />
          )}
          <AddVSLAMemberDialog vslaId={vsla.id} onSuccess={handleSuccess}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Member
            </Button>
          </AddVSLAMemberDialog>
        </div>
      </div>

      {/* Stats Overview */}
      <VSLAMembersStats members={members} />

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Members ({members.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Members Table */}
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-muted-foreground">Loading members...</div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={members}
                filterColumn="name"
                filterPlaceholder="Search members..."
                showColumnToggle={true}
                showPagination={true}
                showRowSelection={true}
                pageSize={10}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      {editingMember && (
        <EditVSLAMemberDialog
          member={editingMember}
          open={!!editingMember}
          onOpenChange={(open: boolean) => !open && setEditingMember(null)}
        />
      )}
    </div>
  );
}
