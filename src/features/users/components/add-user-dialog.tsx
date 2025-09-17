"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "../actions/users";
import { PasswordInput } from "@/components/ui/password-input";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getOrganizations } from "@/features/organizations/actions/organizations";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum([
    "super_admin",
    "cluster_manager",
    "organization_admin",
    "organization_member",
    "user",
  ]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  clusterId: z.string().optional(),
  organizationId: z.string().optional(),
});

interface Cluster {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
  acronym: string;
}

export function AddUserDialog({ onUserAdded }: { onUserAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      password: "",
      clusterId: "",
      organizationId: "",
    },
  });

  const selectedRole = form.watch("role");
  const selectedClusterId = form.watch("clusterId");

  // Load clusters and organizations when dialog opens
  useEffect(() => {
    if (open) {
      loadClustersAndOrganizations();
    }
  }, [open]);

  // Filter organizations based on selected cluster
  useEffect(() => {
    if (selectedClusterId) {
      loadOrganizationsByCluster(selectedClusterId);
    } else {
      loadAllOrganizations();
    }
  }, [selectedClusterId]);

  const loadClustersAndOrganizations = async () => {
    setIsLoadingData(true);
    try {
      const [clustersResult, orgsResult] = await Promise.all([
        getClusters(),
        getOrganizations(),
      ]);

      if (clustersResult.success && clustersResult.data) {
        setClusters(clustersResult.data);
      }

      if (orgsResult.success && orgsResult.data) {
        setOrganizations(orgsResult.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load clusters and organizations");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadAllOrganizations = async () => {
    try {
      const result = await getOrganizations();
      if (result.success && result.data) {
        setOrganizations(result.data);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    }
  };

  const loadOrganizationsByCluster = async (clusterId: string) => {
    try {
      const result = await getOrganizations(clusterId);
      if (result.success && result.data) {
        setOrganizations(result.data);
      }
    } catch (error) {
      console.error("Error loading organizations by cluster:", error);
    }
  };

  // Determine if cluster/organization fields should be shown based on role
  const showClusterField = [
    "cluster_manager",
    "organization_admin",
    "organization_member",
  ].includes(selectedRole);

  const showOrganizationField = [
    "organization_admin",
    "organization_member",
  ].includes(selectedRole);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createUser(values);
      if (result) {
        toast.success("User created successfully");
        form.reset();
        setOpen(false);
        onUserAdded();
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create user"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={value => {
                      field.onChange(value);
                      // Reset cluster and organization when role changes
                      form.setValue("clusterId", "");
                      form.setValue("organizationId", "");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="organization_member">
                        Organization Member
                      </SelectItem>
                      <SelectItem value="organization_admin">
                        Organization Admin
                      </SelectItem>
                      <SelectItem value="cluster_manager">
                        Cluster Manager
                      </SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showClusterField && (
              <FormField
                control={form.control}
                name="clusterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster</FormLabel>
                    <Select
                      onValueChange={value => {
                        field.onChange(value);
                        // Reset organization when cluster changes
                        form.setValue("organizationId", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cluster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">All Clusters</SelectItem>
                        {isLoadingData ? (
                          <SelectItem value="" disabled>
                            Loading clusters...
                          </SelectItem>
                        ) : (
                          clusters.map(cluster => (
                            <SelectItem key={cluster.id} value={cluster.id}>
                              {cluster.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showOrganizationField && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingData ? (
                          <SelectItem value="" disabled>
                            Loading organizations...
                          </SelectItem>
                        ) : organizations.length === 0 ? (
                          <SelectItem value="" disabled>
                            {selectedClusterId
                              ? "No organizations in selected cluster"
                              : "No organizations available"}
                          </SelectItem>
                        ) : (
                          organizations.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.acronym} - {org.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
