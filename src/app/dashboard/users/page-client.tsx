"use client";

import * as React from "react";
import { useState } from "react";
import { UsersTable } from "@/features/users/components/users-table";
import { User } from "@/features/users/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserRole } from "@/features/users/actions/users";
import { toast } from "sonner";
import { AddUserDialog } from "@/features/users/components/add-user-dialog";
import { DeleteUserDialog } from "@/features/users/components/delete-user-dialog";
import { userRole } from "@/lib/db/schema";

interface UsersClientProps {
  users: User[];
}

export function UsersClient({ users }: UsersClientProps) {
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
      // Refetch the users from the server or update the state directly
      // This is a simplified approach for now
      const response = await fetch("/dashboard/users");
      const data = await response.json();
      if (data.users) {
        setActiveUsers(data.users);
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.info("New user added. Please refresh to see updated user list.");
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRoleChange={handleRoleChange}
          />
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <UsersTable
            users={clientUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRoleChange={handleRoleChange}
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
