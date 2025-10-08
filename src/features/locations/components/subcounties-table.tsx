"use client";

import { columns } from "@/features/locations/components/data-table/subcounties-columns";
import { DataTable } from "@/components/ui/data-table";
import type {
  subCounties,
  districts,
  counties,
  countries,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { AddSubCountyDialog } from "@/features/locations/components/dialogs/add-subcounty-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type SubCounty = InferSelectModel<typeof subCounties> & {
  district?: InferSelectModel<typeof districts>;
  county?: InferSelectModel<typeof counties>;
  country?: InferSelectModel<typeof countries>;
};

interface SubCountiesTableProps {
  data: SubCounty[];
}

export function SubCountiesTable({ data }: SubCountiesTableProps) {
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
          <AddSubCountyDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Sub County</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </AddSubCountyDialog>
        }
      />
    </div>
  );
}
