"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Cluster } from "@/features/clusters/components/clusters-table";
import { Organization } from "@/features/organizations/types";
import { Project } from "@/features/projects/types";
import { VSLAForm } from "../forms";

type CreateVSLADialogProps = {
  organizations: Organization[];
  clusters: Cluster[];
  projects: Project[];
  children?: React.ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateVSLADialog({
  organizations,
  clusters,
  projects,
  children,
  onSuccess,
}: CreateVSLADialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const selected_organization_id = searchParams.get("organizationId");
  const selected_cluster_id = searchParams.get("clusterId");
  const selected_project_id = searchParams.get("projectId");

  // Find the selected organization, cluster, or project or use the first one
  const selectedOrganization =
    (organizations || []).find(o => o.id === selected_organization_id) ||
    (organizations || [])[0];
  const selectedCluster =
    (clusters || []).find(c => c.id === selected_cluster_id) ||
    (clusters || [])[0];
  const selectedProject =
    (projects || []).find(p => p.id === selected_project_id) ||
    (projects || [])[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="h-10">New VSLA</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center text-xl font-semibold">
            Create Village Savings and Loans Association
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Create a new VSLA to track savings and loan activities
          </DialogDescription>
        </DialogHeader>
        <VSLAForm
          organizations={organizations || []}
          clusters={clusters || []}
          projects={projects || []}
          defaultOrganizationId={selectedOrganization?.id}
          defaultClusterId={selectedCluster?.id}
          defaultProjectId={selectedProject?.id}
          onSuccess={() => {
            setOpen(false);
            onSuccess?.();
          }}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
