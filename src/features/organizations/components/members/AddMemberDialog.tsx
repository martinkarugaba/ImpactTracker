"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import type { OrganizationMember } from "../../types";
import { Loader2, Plus } from "lucide-react";
import { getAllUsers } from "../../actions/organization-members";

const formSchema = z.object({
  user_id: z.string().min(1, "Please select a user"),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface AddMemberDialogProps {
  organizationId: string;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AddMemberDialog({
  members,
  open,
  onOpenChange,
  onAddMember,
  isLoading = false,
}: AddMemberDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setError(null);
      try {
        const result = await getAllUsers();
        if (result.success && result.data) {
          // Filter out users who are already members
          const existingMemberIds = members.map(member => member.id);
          const availableUsers = result.data.filter(
            user => !existingMemberIds.includes(user.id)
          ) as User[];
          setUsers(availableUsers);
        } else {
          setError(result.error || "Failed to fetch users");
        }
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error(err);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, members]);

  const onSubmit = async (values: FormValues) => {
    await onAddMember(values.user_id);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add a new member to this organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading users...
                        </div>
                      ) : users.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          No available users found
                        </div>
                      ) : (
                        users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || "Unknown User"} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="mt-1 text-sm text-destructive">{error}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingUsers}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
