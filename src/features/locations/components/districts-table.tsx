"use client";

import { columns } from "@/features/locations/components/data-table/districts-columns";
import { DataTable } from "@/components/ui/data-table";
import type { countries, districts } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { AddDistrictDialog } from "@/features/locations/components/dialogs/add-district-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDistricts } from "@/features/locations/hooks/use-locations-query";
import React, { useState } from "react";

type Country = InferSelectModel<typeof countries>;

type District = InferSelectModel<typeof districts> & {
  country?: Country;
};

interface DistrictsTableProps {
  initialData: District[];
  countryId?: string;
}

export function DistrictsTable({
  initialData,
  countryId,
}: DistrictsTableProps) {
  const [page, _setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [accumulatedData, setAccumulatedData] =
    useState<District[]>(initialData);

  const { data: districtsResponse, isLoading } = useDistricts({
    page,
    limit: pageSize,
    search,
    countryId,
  });

  // Effect to handle accumulation of data when response changes
  React.useEffect(() => {
    if (districtsResponse?.success) {
      if (pageSize > 20 && page === 1) {
        // When increasing page size, accumulate unique data
        const newData = districtsResponse.data.data;
        setAccumulatedData(prevData => {
          // Merge previous and new data, ensuring no duplicates by ID
          const idSet = new Set(prevData.map(item => item.id));
          const uniqueNewData = newData.filter(item => !idSet.has(item.id));
          return [...prevData, ...uniqueNewData];
        });
      } else {
        // For normal pagination or search, just use the response data directly
        setAccumulatedData(districtsResponse.data.data);
      }
    }
  }, [districtsResponse, page, pageSize]);

  // Use accumulated data if available, otherwise fallback to response data or initial data
  const data =
    accumulatedData.length > 0
      ? accumulatedData
      : districtsResponse?.success
        ? districtsResponse.data.data
        : initialData;

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
        pageSize={pageSize}
        searchValue={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        actionButtons={
          <AddDistrictDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add District</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </AddDistrictDialog>
        }
      />
    </div>
  );
}
