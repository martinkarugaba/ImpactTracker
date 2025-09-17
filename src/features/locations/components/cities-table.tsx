"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/features/locations/components/data-table/cities-columns";
import { AddCityDialog } from "@/features/locations/components/dialogs/add-city-dialog";
import type { City } from "@/features/locations/components/data-table/cities-columns";

interface CitiesTableProps {
  data: City[];
}

export function CitiesTable({ data }: CitiesTableProps) {
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
        actionButtons={<AddCityDialog />}
      />
    </div>
  );
}
