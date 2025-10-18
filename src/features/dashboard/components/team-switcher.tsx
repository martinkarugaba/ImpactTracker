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
import { useAtom } from "jotai";
import { clusterAtom } from "@/features/auth/atoms/cluster-atom";
import type { Organization } from "@/features/organizations/types";

interface OrganizationsData {
  currentOrg: Organization;
  organizations: Organization[];
  isClustered: boolean;
}

export function TeamSwitcher() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [cluster] = useAtom(clusterAtom);

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
        if (!organizationId) {
          return null;
        }

        const currentOrgResult =
          await getCurrentOrganizationWithCluster(organizationId);
        if (!currentOrgResult.success || !currentOrgResult.data) {
          return null;
        }

        const currentOrg = currentOrgResult.data;

        let clusterOrgs: Organization[] = [];
        let userClusterOrgs: Organization[] = [];
        let isClustered = false;

        if (cluster?.id) {
          const orgsResult = await getOrganizationsByCluster(cluster.id);
          if (orgsResult.success && orgsResult.data) {
            clusterOrgs = orgsResult.data;
            isClustered = true;
          }
        }

        const userOrgsResult = await getCurrentUserClusterOrganizations();
        if (
          userOrgsResult.success === true &&
          "data" in userOrgsResult &&
          userOrgsResult.data
        ) {
          userClusterOrgs = userOrgsResult.data;
          isClustered = isClustered || userClusterOrgs.length > 0;
        }

        const combinedOrgs = [...clusterOrgs];

        for (const org of userClusterOrgs) {
          if (!combinedOrgs.find(existingOrg => existingOrg.id === org.id)) {
            combinedOrgs.push(org);
          }
        }

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
      <Button
        variant="ghost"
        className="w-full justify-between bg-gradient-to-r from-muted/50 to-muted/30 px-2 transition-all duration-200 hover:from-primary/10 hover:to-primary/5"
        size="sm"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 animate-pulse text-primary/70" />
          <span className="truncate text-muted-foreground">Loading...</span>
        </div>
        <ChevronDown className="h-4 w-4 animate-pulse text-muted-foreground" />
      </Button>
    );
  }

  if (!organizationsData) {
    return null;
  }

  const { currentOrg, organizations } = organizationsData;

  return (
    <SidebarHeader className="mt-1 border-none border-orange-500 p-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="border border-transparent bg-gradient-to-br from-primary/15 via-primary/8 to-primary/3 transition-all duration-200 hover:border-primary/20 hover:from-primary/20 hover:via-primary/12 hover:to-primary/5 data-[state=open]:bg-gradient-to-br data-[state=open]:from-primary/25 data-[state=open]:via-primary/15 data-[state=open]:to-primary/8"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentOrg.acronym}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
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
              <DropdownMenuLabel className="text-xs text-muted-foreground">
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
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
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
