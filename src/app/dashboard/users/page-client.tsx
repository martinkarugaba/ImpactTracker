"use client";

import * as React from "react";
import { useState } from "react";
import { UsersTable } from "@/features/users/components/users-table";
import { User } from "@/features/users/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  updateUserRole,
  updateUserCluster,
  updateUserOrganization,
  getUsers,
} from "@/features/users/actions/users";
import { toast } from "sonner";
import { AddUserDialog } from "@/features/users/components/add-user-dialog";
import { DeleteUserDialog } from "@/features/users/components/delete-user-dialog";
import { userRole } from "@/lib/db/schema";

interface UsersClientProps {
  users: User[];
  clusters: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
}

export function UsersClient({
  users,
  clusters,
  organizations,
}: UsersClientProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>(users);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter users by role
  const staffUsers = activeUsers.filter(user => user.role !== "user");

  const clientUsers = activeUsers.filter(user => user.role === "user");

  const handleEdit = (user: User) => {
    // Handle editing user
    toast.info("Edit functionality coming soon");
    console.log("Editing user:", user);
  };

  const handleDelete = (user: User) => {
    setSelectedUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleUserDeleted = () => {
    if (selectedUserToDelete) {
      setActiveUsers(prev =>
        prev.filter(u => u.id !== selectedUserToDelete.id)
      );
    }
  };

  const handleUserAdded = async () => {
    try {
      // Refetch the users using the server action
      const result = await getUsers();
      if (result.success) {
        setActiveUsers(result.data);
        toast.success("User added successfully");
      } else {
        toast.error("Failed to refresh user list");
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Error refreshing user list");
    }
  };

  const handleRoleChange = async (
    user: User,
    newRole: (typeof userRole.enumValues)[number]
  ) => {
    try {
      const response = await updateUserRole(user.id, newRole);
      if (response.success) {
        // Update local state
        setActiveUsers(prev =>
          prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        toast.success(`User role updated to ${newRole.replace(/_/g, " ")}`);
      } else {
        toast.error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("An error occurred while updating the role");
    }
  };

  const handleClusterChange = async (user: User, clusterId: string | null) => {
    try {
      const response = await updateUserCluster(user.id, clusterId);
      if (response.success) {
        // Refetch users to get updated cluster data
        const result = await getUsers();
        if (result.success) {
          setActiveUsers(result.data);
        }
      } else {
        toast.error("Failed to update user cluster");
      }
    } catch (error) {
      console.error("Error updating user cluster:", error);
      toast.error("An error occurred while updating the cluster");
    }
  };

  const handleOrganizationChange = async (
    user: User,
    organizationId: string | null
  ) => {
    try {
      const response = await updateUserOrganization(user.id, organizationId);
      if (response.success) {
        // Refetch users to get updated organization data
        const result = await getUsers();
        if (result.success) {
          setActiveUsers(result.data);
        }
      } else {
        toast.error("Failed to update user organization");
      }
    } catch (error) {
      console.error("Error updating user organization:", error);
      toast.error("An error occurred while updating the organization");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="sr-only text-3xl font-bold tracking-tight">
          Users Management
        </h2>
        <AddUserDialog onUserAdded={handleUserAdded} />
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList>
          <TabsTrigger value="staff">Staff ({staffUsers.length})</TabsTrigger>
          <TabsTrigger value="clients">
            Clients ({clientUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="mt-4">
          <UsersTable
            users={staffUsers}
            clusters={clusters}
            organizations={organizations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRoleChange={handleRoleChange}
            onClusterChange={handleClusterChange}
            onOrganizationChange={handleOrganizationChange}
          />
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <UsersTable
            users={clientUsers}
            clusters={clusters}
            organizations={organizations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRoleChange={handleRoleChange}
            onClusterChange={handleClusterChange}
            onOrganizationChange={handleOrganizationChange}
          />
        </TabsContent>
      </Tabs>

      <DeleteUserDialog
        user={selectedUserToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
}
