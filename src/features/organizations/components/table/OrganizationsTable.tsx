"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/types";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { deleteOrganizations } from "@/features/organizations/actions/organizations";
import { CreateOrganizationDialog } from "../create-organization-dialog";
import { TableFilters } from "./TableFilters";
import { getOrganizationTableColumns } from "./table-columns";

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
  const [filteredOrganizations, setFilteredOrganizations] =
    useState<Organization[]>(organizations);

  // const handleDelete = async (id: string) => {
  //   try {
  //     const result = await deleteOrganizations([id]);
  //     if (result.success) {
  //       toast.success('Organization deleted successfully');
  //       router.refresh();
  //     } else {
  //       toast.error(result.error || 'Failed to delete organization');
  //     }
  //   } catch {
  //     toast.error('Failed to delete organization');
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
    } catch {
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
          data={filteredOrganizations}
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
            <TableFilters
              clusters={clusters}
              onClusterChange={clusterId => {
                if (clusterId) {
                  setFilteredOrganizations(
                    organizations.filter(org => org.cluster_id === clusterId)
                  );
                } else {
                  setFilteredOrganizations(organizations);
                }
              }}
            />
          }
          onRowSelectionChange={setSelectedRows}
        />
      </div>
    </div>
  );
}
