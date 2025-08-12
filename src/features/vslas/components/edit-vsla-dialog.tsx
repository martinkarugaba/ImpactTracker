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
import { Cluster } from "@/features/clusters/components/clusters-table";
import { Organization } from "@/features/organizations/types";
import { Project } from "@/features/projects/types";
import { VSLAForm } from "./vsla-form/vsla-form";
import { VSLA } from "../types";
import { Edit } from "lucide-react";

type EditVSLADialogProps = {
  vsla: VSLA;
  organizations: Organization[];
  clusters: Cluster[];
  projects: Project[];
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void | Promise<void>;
};

export function EditVSLADialog({
  vsla,
  organizations,
  clusters,
  projects,
  children,
  isOpen: controlledOpen,
  onClose,
  onSuccess,
}: EditVSLADialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOpen !== undefined
      ? (value: boolean) => {
          if (!value) onClose?.();
        }
      : setInternalOpen;

  const initialData = {
    id: vsla.id,
    name: vsla.name,
    code: vsla.code,
    description: vsla.description || "",
    organization_id: vsla.organization_id,
    cluster_id: vsla.cluster_id,
    project_id: vsla.project_id,
    country: vsla.country,
    district: vsla.district,
    sub_county: vsla.sub_county,
    parish: vsla.parish,
    village: vsla.village,
    address: vsla.address || "",
    total_members: vsla.total_members,
    total_savings: vsla.total_savings,
    total_loans: vsla.total_loans,
    meeting_frequency: vsla.meeting_frequency,
    meeting_day: vsla.meeting_day || "",
    meeting_time: vsla.meeting_time || "",
    status: vsla.status,
    formed_date: new Date(vsla.formed_date),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center text-xl font-semibold">
            Edit Village Savings and Loans Association
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update VSLA information and settings
          </DialogDescription>
        </DialogHeader>
        <VSLAForm
          organizations={organizations || []}
          clusters={clusters || []}
          projects={projects || []}
          onSuccess={() => {
            setOpen(false);
            onSuccess?.();
          }}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
