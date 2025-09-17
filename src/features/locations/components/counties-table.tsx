"use client";

import { DataTable } from "@/components/ui/data-table";
import { counties, districts } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCountyDialog } from "./dialogs/add-county-dialog";
import { columns } from "./data-table/counties-columns";

type District = InferSelectModel<typeof districts>;

type County = InferSelectModel<typeof counties> & {
  district?: District;
};

interface CountiesTableProps {
  data: County[];
}

export function CountiesTable({ data }: CountiesTableProps) {
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
        pageSize={20}
        actionButtons={
          <AddCountyDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add County</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </AddCountyDialog>
        }
      />
    </div>
  );
}
