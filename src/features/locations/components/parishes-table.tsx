"use client";

import { columns } from "@/features/locations/components/data-table/parishes-columns";
import { DataTable } from "@/components/ui/data-table";
import type {
  parishes,
  countries,
  counties,
  districts,
  subCounties,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { AddParishDialog } from "@/features/locations/components/dialogs/add-parish-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Parish = InferSelectModel<typeof parishes> & {
  subCounty?: InferSelectModel<typeof subCounties>;
  district?: InferSelectModel<typeof districts>;
  county?: InferSelectModel<typeof counties>;
  country?: InferSelectModel<typeof countries>;
};

interface ParishesTableProps {
  data: Parish[];
}

export function ParishesTable({ data }: ParishesTableProps) {
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
          <AddParishDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Parish</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </AddParishDialog>
        }
      />
    </div>
  );
}
