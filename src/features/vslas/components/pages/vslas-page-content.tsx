"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { getVSLAs, deleteVSLAs } from "../../actions/vslas";
import { VSLAsTable, VSLAsTableSkeleton } from "../tables";
import { CreateVSLADialog, EditVSLADialog, DeleteVSLADialog } from "../dialogs";
import { VSLAMetricsCards } from "../metrics/vsla-metrics-cards";
import { TargetsTab } from "./targets-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Table, Target } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("table");
  const [filters, setFilters] = useState({
    organization: "all",
    cluster: "all",
    project: "all",
    district: "all",
    subCounty: "all",
    status: "all",
    meetingFrequency: "all",
    saccoMember: "all",
    hasConstitution: "all",
  });
  const router = useRouter();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  // Get unique districts and subcounties for filters
  const districts = useMemo(
    () => Array.from(new Set(vslas.map(v => v.district).filter(Boolean))),
    [vslas]
  );

  const subCounties = useMemo(
    () => Array.from(new Set(vslas.map(v => v.sub_county).filter(Boolean))),
    [vslas]
  );

  // Filter VSLAs based on active filters
  const filteredVSLAs = useMemo(() => {
    return vslas.filter(vsla => {
      if (
        filters.organization !== "all" &&
        vsla.organization_id !== filters.organization
      )
        return false;
      if (filters.cluster !== "all" && vsla.cluster_id !== filters.cluster)
        return false;
      if (filters.project !== "all" && vsla.project_id !== filters.project)
        return false;
      if (filters.district !== "all" && vsla.district !== filters.district)
        return false;
      if (filters.subCounty !== "all" && vsla.sub_county !== filters.subCounty)
        return false;
      if (filters.status !== "all" && vsla.status !== filters.status)
        return false;
      if (
        filters.meetingFrequency !== "all" &&
        vsla.meeting_frequency !== filters.meetingFrequency
      )
        return false;
      if (
        filters.saccoMember !== "all" &&
        vsla.sacco_member !== filters.saccoMember
      )
        return false;
      if (
        filters.hasConstitution !== "all" &&
        vsla.has_constitution !== filters.hasConstitution
      )
        return false;
      return true;
    });
  }, [vslas, filters]);

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

  const handleExportToExcel = () => {
    // Export to Excel
    const exportData = vslas.map(vsla => ({
      Name: vsla.name,
      Code: vsla.code,
      District: vsla.district || "",
      Subcounty: vsla.sub_county || "",
      Organization: vsla.organization?.name || "",
      Cluster: vsla.cluster?.name || "",
      Members: vsla.total_members,
      "Total Savings": vsla.total_savings,
      "Total Loans": vsla.total_loans,
      Status: vsla.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VSLAs");
    XLSX.writeFile(wb, `vslas-${new Date().toISOString().split("T")[0]}.xlsx`);

    toast.success("VSLAs exported to Excel successfully!");
  };

  const handleExportToCSV = () => {
    // Export to CSV (super_admin only)
    const csvContent = [
      [
        "Name",
        "Code",
        "District",
        "Subcounty",
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
        vsla.district || "",
        vsla.sub_county || "",
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

    toast.success("VSLAs exported to CSV successfully!");
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Village Savings and Loans Associations
        </h2>
        <p className="text-muted-foreground">
          Manage and track all VSLAs across your organization (
          {filteredVSLAs.length}
          {filteredVSLAs.length !== vslas.length && ` of ${vslas.length}`}{" "}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger
              value="table"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
            >
              <Table className="h-4 w-4" />
              VSLAs Table
            </TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger
                  value="metrics"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
                >
                  <BarChart3 className="h-4 w-4" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger
                  value="targets"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500"
                >
                  <Target className="h-4 w-4" />
                  Targets
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <VSLAsTable
              data={filteredVSLAs}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBulkDelete={handleBulkDelete}
              onExportToExcel={handleExportToExcel}
              onExportToCSV={isSuperAdmin ? handleExportToCSV : undefined}
              isLoading={isLoading}
              pageSize={20}
              organizations={organizations}
              clusters={clusters}
              projects={projects}
              onSuccess={refreshData}
              filters={filters}
              onFiltersChange={setFilters}
              districts={districts}
              subCounties={subCounties}
            />
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="metrics" className="mt-6">
              <VSLAMetricsCards vslas={vslas} isLoading={isLoading} />
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="targets" className="mt-6">
              <TargetsTab vslas={vslas} isLoading={isLoading} />
            </TabsContent>
          )}
        </Tabs>
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
