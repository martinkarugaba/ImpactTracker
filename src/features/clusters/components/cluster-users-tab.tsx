"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  addUserToCluster,
  removeUserFromCluster,
  getClusterUsers,
} from "../actions/cluster-users";
import { getAllUsers } from "@/features/organizations/actions/organization-members";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string | null;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClusterUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

const roles = [
  "super_admin",
  "cluster_manager",
  "organization_admin",
  "organization_member",
  "user",
] as const;
type UserRole = (typeof roles)[number];

const formSchema = z.object({
  user_id: z.string().min(1, "Please select a user"),
  role: z.enum(roles),
});

type FormValues = z.infer<typeof formSchema>;

export function ClusterUsersTab({ clusterId }: { clusterId: string }) {
  const [users, setUsers] = useState<ClusterUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
      role: "cluster_manager" as UserRole,
    },
  });

  // Fetch cluster users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getClusterUsers(clusterId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch cluster users");
      }
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching cluster users:", error);
      setError("Failed to load cluster users");
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [clusterId]);

  // Fetch available users for adding to cluster
  const fetchAvailableUsers = useCallback(async () => {
    try {
      const result = await getAllUsers();
      if (result.success && result.data) {
        // Filter out users who are already cluster members
        const existingUserIds = users.map(user => user.id);
        const filtered = result.data.filter(
          user => !existingUserIds.includes(user.id)
        );
        setAvailableUsers(filtered);
      } else {
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
      setAvailableUsers([]);
    }
  }, [users]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch available users when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchAvailableUsers();
    }
  }, [dialogOpen, users, fetchAvailableUsers]);

  // Add a user to the cluster
  const handleAddUser = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const result = await addUserToCluster(data.user_id, clusterId, data.role);

      if (result.success) {
        toast.success("User added to cluster successfully");
        setDialogOpen(false);
        form.reset();
        fetchUsers(); // Refresh user list
      } else {
        toast.error(result.error || "Failed to add user to cluster");
      }
    } catch (error) {
      console.error("Error adding user to cluster:", error);
      toast.error("Failed to add user to cluster");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove a user from the cluster
  const handleRemoveUser = async (userId: string) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));

    try {
      const result = await removeUserFromCluster(userId, clusterId);

      if (result.success) {
        toast.success("User removed from cluster");
        fetchUsers(); // Refresh user list
      } else {
        toast.error(result.error || "Failed to remove user from cluster");
      }
    } catch (error) {
      console.error("Error removing user from cluster:", error);
      toast.error("Failed to remove user from cluster");
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cluster Users</CardTitle>
          <CardDescription>Users with access to this cluster</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Cluster</DialogTitle>
              <DialogDescription>
                Add a user to give them access to this cluster and its
                organizations.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddUser)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUsers.length === 0 ? (
                            <div className="px-2 py-2 text-sm text-muted-foreground">
                              No available users
                            </div>
                          ) : (
                            availableUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name || user.email} ({user.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cluster_manager">
                            Cluster Manager
                          </SelectItem>
                          <SelectItem value="organization_admin">
                            Organization Admin
                          </SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>

                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add User"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No users have been added to this cluster yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.created_at
                      ? formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                        })
                      : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      disabled={loadingStates[user.id]}
                    >
                      {loadingStates[user.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserX className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
