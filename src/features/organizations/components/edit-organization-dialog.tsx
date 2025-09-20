"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Organization } from "../types";
import { Cluster } from "@/features/clusters/components/clusters-table";
import { OrganizationForm } from "./organization-form/organization-form";

type EditOrganizationDialogProps = {
  organization: Organization;
  clusters: Cluster[];
  onSelect?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditOrganizationDialog({
  organization,
  clusters,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: EditOrganizationDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Edit Organization
          </DialogTitle>
          <DialogDescription>
            Update the organization details below.
          </DialogDescription>
        </DialogHeader>
        <OrganizationForm
          clusters={clusters}
          defaultClusterId={organization.cluster_id || ""}
          organization={organization}
          onSuccess={() => setOpen(false)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
