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
import type { Cluster } from "@/features/clusters/components/clusters-table";
import { OrganizationForm } from "./organization-form/organization-form";

interface CreateOrganizationDialogProps {
  clusters: Cluster[];
  children?: React.ReactNode;
}

export function CreateOrganizationDialog({
  clusters,
  children,
}: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const selected_cluster_id = searchParams.get("clusterId");

  console.log("Clusters in dialog:", clusters);
  console.log("Selected cluster ID:", selected_cluster_id);

  // Find the selected cluster or use the first one
  const selectedCluster =
    clusters.find(c => c.id === selected_cluster_id) || clusters[0];

  console.log("Selected cluster:", selectedCluster);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="h-10">New Organization</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-x-hidden sm:max-w-[600px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center text-xl font-semibold">
            Create Organization
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground"></DialogDescription>
        </DialogHeader>
        {/* <Separator /> */}
        <OrganizationForm
          clusters={clusters}
          defaultClusterId={selectedCluster?.id}
          onSuccess={() => setOpen(false)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
