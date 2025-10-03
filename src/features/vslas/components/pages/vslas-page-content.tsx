"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getVSLAs, deleteVSLAs } from "../../actions/vslas";
import { VSLAsTable, VSLAsTableSkeleton } from "../tables";
import { CreateVSLADialog, EditVSLADialog, DeleteVSLADialog } from "../dialogs";
import { VSLAMetricsCards } from "../metrics/vsla-metrics-cards";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VSLA } from "../../types";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";

interface VSLAsPageContentProps {
  initialVSLAs: VSLA[];
  organizations: Organization[];
  clusters: Cluster[];
  projects: Project[];
}

export function VSLAsPageContent({
  initialVSLAs,
  organizations,
  clusters,
  projects,
}: VSLAsPageContentProps) {
  const [vslas, setVSLAs] = useState<VSLA[]>(initialVSLAs || []);
  const [isLoading, setIsLoading] = useState(false);
  const [editingVSLA, setEditingVSLA] = useState<VSLA | null>(null);
  const [deletingVSLA, setDeletingVSLA] = useState<VSLA | null>(null);
  const router = useRouter();

  const handleRowClick = (vsla: VSLA) => {
    // Navigate to VSLA details page
    router.push(`/dashboard/vslas/${vsla.id}`);
  };

  const handleEdit = (vsla: VSLA) => {
    setEditingVSLA(vsla);
  };

  const handleDelete = (vsla: VSLA) => {
    setDeletingVSLA(vsla);
  };

  const handleBulkDelete = async (vslasToDelete: VSLA[]) => {
    if (vslasToDelete.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${vslasToDelete.length} VSLA(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const ids = vslasToDelete.map(v => v.id);
      const result = await deleteVSLAs(ids);

      if (result.success) {
        toast.success(
          result.message ||
            `Successfully deleted ${vslasToDelete.length} VSLA(s)`
        );
        // Refresh the list
        await refreshData();
      } else {
        toast.error(result.error || "Failed to delete VSLAs");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("An error occurred while deleting VSLAs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Implement CSV/Excel export functionality
    const csvContent = [
      [
        "Name",
        "Code",
        "Organization",
        "Cluster",
        "Members",
        "Total Savings",
        "Total Loans",
        "Status",
      ],
      ...vslas.map(vsla => [
        vsla.name,
        vsla.code,
        vsla.organization?.name || "",
        vsla.cluster?.name || "",
        vsla.total_members.toString(),
        vsla.total_savings.toString(),
        vsla.total_loans.toString(),
        vsla.status,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vslas-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("VSLAs exported successfully!");
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const result = await getVSLAs();
      if (result.success && result.data) {
        setVSLAs(result.data);
      }
    } catch (_error) {
      toast.error("Failed to refresh VSLAs data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <VSLAsTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <VSLAMetricsCards vslas={vslas} isLoading={isLoading} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Village Savings and Loans Associations
        </h2>
        <p className="text-muted-foreground">
          Manage and track all VSLAs across your organization ({vslas.length}{" "}
          total)
        </p>
      </div>

      {vslas.length === 0 ? (
        <div className="flex h-96 items-center justify-center rounded-lg border">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No VSLAs found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first VSLA.
            </p>
            <CreateVSLADialog
              organizations={organizations}
              clusters={clusters}
              projects={projects}
              onSuccess={refreshData}
            >
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create VSLA
              </Button>
            </CreateVSLADialog>
          </div>
        </div>
      ) : (
        <VSLAsTable
          data={vslas}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          isLoading={isLoading}
          pageSize={20}
          organizations={organizations}
          clusters={clusters}
          projects={projects}
          onSuccess={refreshData}
        />
      )}

      {/* Edit Dialog */}
      {editingVSLA && (
        <EditVSLADialog
          vsla={editingVSLA}
          isOpen={!!editingVSLA}
          onClose={() => setEditingVSLA(null)}
          organizations={organizations}
          clusters={clusters}
          projects={projects}
          onSuccess={refreshData}
        />
      )}

      {/* Delete Dialog */}
      {deletingVSLA && (
        <DeleteVSLADialog
          vsla={deletingVSLA}
          isOpen={!!deletingVSLA}
          onClose={() => setDeletingVSLA(null)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
