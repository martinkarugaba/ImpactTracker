"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setCurrentOrganization } from "@/features/auth/actions/set-organization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getOrganizationId } from "@/features/auth/actions";
import {
  getCurrentOrganizationWithCluster,
  getOrganizationsByCluster,
} from "@/features/organizations/actions/organizations";
import { getCurrentUserClusterOrganizations } from "@/features/clusters/actions/cluster-users";

interface Organization {
  id: string;
  name: string;
  acronym: string;
  cluster_id: string | null;
  project_id: string | null;
  country: string;
  district: string;
  sub_county_id: string; // Updated to match schema
  operation_sub_counties?: string[]; // Areas of operation (multiple)
  parish: string;
  village: string;
  address: string;
  created_at: Date | null;
  updated_at: Date | null;
  cluster?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
    acronym: string;
  } | null;
}

interface OrganizationsData {
  currentOrg: Organization;
  organizations: Organization[];
  isClustered: boolean;
}

export function TeamSwitcher() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { isMobile } = useSidebar();

  const { data: organizationId, isLoading: isLoadingOrgId } = useQuery({
    queryKey: ["organizationId"],
    queryFn: async () => {
      console.log("Fetching organization ID...");
      const result = await getOrganizationId();
      console.log("Got organization ID result:", result);
      return result;
    },
  });

  const { data: organizationsData, isLoading: isLoadingOrgs } =
    useQuery<OrganizationsData | null>({
      queryKey: ["organizations", organizationId],
      queryFn: async (): Promise<OrganizationsData | null> => {
        // console.log(
        //   "Starting organizations query with organization ID:",
        //   organizationId
        // );
        if (!organizationId) {
          // console.log("No organization ID available, returning null");
          return null;
        }

        // console.log("Fetching current organization with cluster...");
        const currentOrgResult =
          await getCurrentOrganizationWithCluster(organizationId);
        // console.log("Current org result:", currentOrgResult);
        if (!currentOrgResult.success || !currentOrgResult.data) {
          // console.log(
          //   "Failed to get current organization:",
          //   currentOrgResult.error
          // );
          return null;
        }

        const currentOrg = currentOrgResult.data;
        // console.log("Current organization:", currentOrg);

        // Fetch organizations from the cluster members table
        let clusterOrgs: Organization[] = [];
        let userClusterOrgs: Organization[] = [];
        let isClustered = false;

        // Get organizations from the current org's cluster if it belongs to one
        if (currentOrg.cluster_id) {
          // console.log(
          //   "Organization belongs to cluster:",
          //   currentOrg.cluster_id
          // );
          const orgsResult = await getOrganizationsByCluster(
            currentOrg.cluster_id
          );
          // console.log("Cluster organizations result:", orgsResult);
          if (orgsResult.success && orgsResult.data) {
            clusterOrgs = orgsResult.data;
            isClustered = true;
          }
        } else {
          // console.log("Organization does not belong to any cluster");
        }

        // Get organizations from clusters the user belongs to
        // console.log("Fetching user cluster organizations...");
        const userOrgsResult = await getCurrentUserClusterOrganizations();
        // console.log("User cluster organizations result:", userOrgsResult);
        if (
          userOrgsResult.success === true &&
          "data" in userOrgsResult &&
          userOrgsResult.data
        ) {
          userClusterOrgs = userOrgsResult.data;
          isClustered = isClustered || userClusterOrgs.length > 0;
        }

        // Combine and deduplicate organizations
        const combinedOrgs = [...clusterOrgs];

        // Add organizations from user's clusters if not already included
        for (const org of userClusterOrgs) {
          if (!combinedOrgs.find(existingOrg => existingOrg.id === org.id)) {
            combinedOrgs.push(org);
          }
        }

        // Always include the current organization
        if (!combinedOrgs.find(org => org.id === currentOrg.id)) {
          combinedOrgs.push(currentOrg);
        }

        const result = {
          currentOrg,
          organizations: combinedOrgs,
          isClustered,
        };

        console.log("Final organizations data:", result);
        return result;
      },
      enabled: !!organizationId,
      refetchOnWindowFocus: true,
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    });

  if (isLoadingOrgId || isLoadingOrgs) {
    return (
      <Button variant="ghost" className="w-full justify-between px-2" size="sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="truncate">Loading...</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  if (!organizationsData) {
    return null;
  }

  const { currentOrg, organizations } = organizationsData;

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentOrg.acronym}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {currentOrg.cluster?.name
                      ? `${currentOrg.cluster.name} | `
                      : ""}
                    {currentOrg.district}, {currentOrg.country}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={async () => {
                    try {
                      const result = await setCurrentOrganization(org.id);
                      if (result.success) {
                        router.refresh();
                        setOpen(false);
                      } else {
                        toast.error(
                          result.error || "Failed to switch organization"
                        );
                      }
                    } catch (error) {
                      toast.error("Failed to switch organization");
                      console.error(error);
                    }
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  {org.acronym}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
