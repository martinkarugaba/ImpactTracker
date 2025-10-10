/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Button } from "@/components/ui/button";
import type { Organization } from "@/features/organizations/types";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { deleteOrganizations } from "@/features/organizations/actions/organizations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getOrganizationTableColumns } from "./organization-table-columns";

interface OrganizationsTableProps {
  organizations: Organization[];
  clusters: Cluster[];
}

export function OrganizationsTable({
  organizations,
  clusters,
}: OrganizationsTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<Organization[]>([]);

  // const handleDelete = async (id: string) => {
  //   try {
  //     const result = await deleteOrganizations([id]);
  //     if (result.success) {
  //       toast.success("Organization deleted successfully");
  //       router.refresh();
  //     } else {
  //       toast.error(result.error || "Failed to delete organization");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to delete organization");
  //   }
  // };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      const result = await deleteOrganizations(selectedRows.map(row => row.id));
      if (result.success) {
        toast.success("Organizations deleted successfully");
        setSelectedRows([]);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete organizations");
      }
    } catch (error) {
      toast.error("Failed to delete organizations");
    }
  };

  const handleOrganizationSelect = (org: Organization | null) => {
    if (org) {
      setSelectedRows(prev => [...prev, org]);
    }
  };

  const columns = getOrganizationTableColumns({
    clusters,
    onSelectOrganization: handleOrganizationSelect,
  });

  return (
    <div className="space-y-4">
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <ReusableDataTable
          columns={columns}
          data={organizations}
          filterColumn="name"
          filterPlaceholder="Filter by name..."
          showColumnToggle={true}
          showPagination={true}
          showRowSelection={true}
          pageSize={10}
          customActions={
            <CreateOrganizationDialog clusters={clusters}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Add Organization</span>
                <span className="lg:hidden">Add</span>
              </Button>
            </CreateOrganizationDialog>
          }
          customFilters={
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="active">Active Organizations</SelectItem>
                <SelectItem value="by-cluster">By Cluster</SelectItem>
              </SelectContent>
            </Select>
          }
          onRowSelectionChange={setSelectedRows}
        />
      </div>
    </div>
  );
}
