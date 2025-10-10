"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { OrganizationMember } from "../../types";
import { MembersTable } from "./MembersTable";
import {
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "../../actions/organization-members";
import { AddMemberDialog } from "./AddMemberDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { userRole } from "@/lib/db/schema";

interface OrganizationMembersProps {
  organizationId: string;
  members: OrganizationMember[];
}

export function OrganizationMembers({
  organizationId,
  members,
}: OrganizationMembersProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddMember = async (userId: string) => {
    if (!userId) {
      toast.error("Please select a user");
      return;
    }

    setIsLoading(true);
    try {
      const result = await addOrganizationMember(organizationId, userId);

      if (result.success) {
        toast.success("Member added successfully");
        setDialogOpen(false);
        router.refresh();
      } else {
        if (result.error === "Not authenticated") {
          toast.error("Your session has expired. Please log in again.");
          router.push("/auth/login");
        } else {
          toast.error(result.error || "Failed to add member");
        }
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!session) {
      toast.error("You need to be logged in to remove members");
      router.push("/sign-in");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    try {
      const result = await removeOrganizationMember(organizationId, userId);
      if (result.success) {
        toast.success("Member removed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUpdateRole = async (
    userId: string,
    role: (typeof userRole.enumValues)[number]
  ) => {
    if (!session) {
      toast.error("You need to be logged in to update member roles");
      router.push("/sign-in");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    try {
      const result = await updateOrganizationMemberRole(
        organizationId,
        userId,
        role
      );
      if (result.success) {
        toast.success("Role updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update role");
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Organization Members</h2>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <MembersTable
        members={members}
        onRemoveMember={handleRemoveMember}
        onUpdateRole={handleUpdateRole}
        loadingStates={loadingStates}
      />

      <AddMemberDialog
        organizationId={organizationId}
        members={members}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddMember={handleAddMember}
        isLoading={isLoading}
      />
    </div>
  );
}
