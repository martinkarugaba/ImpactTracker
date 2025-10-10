"use client";

import { columns } from "@/features/locations/components/data-table/villages-columns";
import { DataTable } from "@/components/ui/data-table";
import type {
  villages,
  parishes,
  subCounties,
  counties,
  districts,
  countries,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { AddVillageDialog } from "@/features/locations/components/dialogs/add-village-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Village = InferSelectModel<typeof villages> & {
  parish?: InferSelectModel<typeof parishes>;
  subCounty?: InferSelectModel<typeof subCounties>;
  county?: InferSelectModel<typeof counties>;
  district?: InferSelectModel<typeof districts>;
  country?: InferSelectModel<typeof countries>;
};

interface VillagesTableProps {
  data: Village[];
}

export function VillagesTable({ data }: VillagesTableProps) {
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={10}
        actionButtons={
          <AddVillageDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Village</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </AddVillageDialog>
        }
      />
    </div>
  );
}
