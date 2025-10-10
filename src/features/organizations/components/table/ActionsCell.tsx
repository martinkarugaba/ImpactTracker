"use client";

import { Button } from "@/components/ui/button";
import type { Organization } from "@/features/organizations/types";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { useState } from "react";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditOrganizationDialog } from "../edit-organization-dialog";
import { DeleteOrganizationDialog } from "../delete-organization-dialog";
import Link from "next/link";

interface ActionsCellProps {
  organization: Organization;
  clusters: Cluster[];
  onSelectOrganization: (org: Organization | null) => void;
}

export function ActionsCell({
  organization,
  clusters,
  onSelectOrganization,
}: ActionsCellProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/organizations/${organization.id}`}>
              <Users className="mr-2 h-4 w-4" />
              View Members
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditOrganizationDialog
        organization={organization}
        clusters={clusters}
        onSelect={() => {
          setShowEditDialog(false);
          onSelectOrganization(organization);
        }}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteOrganizationDialog
        organization={organization}
        onDelete={() => {
          setShowDeleteDialog(false);
          onSelectOrganization(null);
        }}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
