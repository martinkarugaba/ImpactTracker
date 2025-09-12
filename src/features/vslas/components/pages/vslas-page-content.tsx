"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getVSLAs } from "../../actions/vslas";
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

  const handleAdd = () => {
    // This will be handled by the CreateVSLADialog component
  };

  const handleImport = () => {
    // Implement CSV/Excel import functionality
    toast.success("Import functionality coming soon!");
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

      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Village Savings and Loans Associations
          </h2>
          <p className="text-muted-foreground">
            Manage and track all VSLAs across your organization ({vslas.length}{" "}
            total)
          </p>
        </div>
        <CreateVSLADialog
          organizations={organizations}
          clusters={clusters}
          projects={projects}
          onSuccess={refreshData}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New VSLA
          </Button>
        </CreateVSLADialog>
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
          onAdd={handleAdd}
          onImport={handleImport}
          onExport={handleExport}
          isLoading={isLoading}
          pageSize={20}
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
