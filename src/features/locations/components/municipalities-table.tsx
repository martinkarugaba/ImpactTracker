"use client";

import { municipalities } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { deleteMunicipality } from "@/features/locations/actions/municipalities";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMunicipalityTableColumns } from "./municipalities-table-columns";
import type { InferSelectModel } from "drizzle-orm";

type Municipality = InferSelectModel<typeof municipalities> & {
  country: { name: string };
  district: { name: string };
  county: { name: string };
  subCounty: { name: string };
};

interface MunicipalitiesTableProps {
  municipalities: Municipality[];
}

export function MunicipalitiesTable({
  municipalities,
}: MunicipalitiesTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<Municipality[]>([]);

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      await Promise.all(selectedRows.map(row => deleteMunicipality(row.id)));
      toast.success("Municipalities deleted successfully");
      setSelectedRows([]);
      router.refresh();
    } catch {
      toast.error("Failed to delete municipalities");
    }
  };

  const columns = getMunicipalityTableColumns({});

  return (
    <div className="space-y-4">
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="h-8 px-2 lg:px-3"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-2">Delete Selected</span>
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={municipalities}
        showRowSelection={true}
        onRowSelectionChange={setSelectedRows}
        filterColumn="name"
        filterPlaceholder="Filter municipalities..."
        actionButtons={
          <Button className="h-8 px-2 lg:px-3">
            <Plus className="h-4 w-4" />
            <span className="ml-2 lg:hidden">Add</span>
            <span className="ml-2 hidden lg:inline">Add Municipality</span>
          </Button>
        }
      />
    </div>
  );
}
