"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { countries } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { countryColumns } from "@/features/locations/components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCountryDialog } from "@/features/locations/components/dialogs/add-country-dialog";
import { useCountries } from "@/features/locations/hooks/use-locations-query";
import { mergeWithoutDuplicates } from "../utils/pagination";

type Country = InferSelectModel<typeof countries>;

interface CountriesTableProps {
  initialData: Country[];
}

export function CountriesTable({ initialData }: CountriesTableProps) {
  const [page, _setPage] = React.useState(1);
  const [pageSize, _setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");

  const [accumulatedData, setAccumulatedData] =
    React.useState<Country[]>(initialData);

  const [previousOptions, _setPreviousOptions] = React.useState({
    pageSize: 20,
    page: 1,
  });

  const { data: countriesResponse, isLoading } = useCountries({
    page,
    limit: pageSize,
    search,
  });

  const tableColumns = React.useMemo(() => countryColumns, []);

  const handleDataAccumulation = React.useCallback(() => {
    if (!countriesResponse?.success) return;

    const newData = countriesResponse.data.data;
    const isPageSizeIncrease = pageSize > previousOptions.pageSize;
    const isNavigatingForward = page >= previousOptions.page;
    const isCurrentPageGreaterThanOne = page > 1;

    setAccumulatedData((prevData: Country[]) => {
      if (
        (isPageSizeIncrease && !search) ||
        (isNavigatingForward && isCurrentPageGreaterThanOne && !search)
      ) {
        return mergeWithoutDuplicates(prevData, newData);
      }
      return newData;
    });
  }, [
    countriesResponse,
    page,
    pageSize,
    previousOptions.page,
    previousOptions.pageSize,
    search,
  ]);

  React.useEffect(() => {
    handleDataAccumulation();
  }, [handleDataAccumulation]);

  const data = React.useMemo(
    () =>
      accumulatedData.length > 0
        ? accumulatedData
        : countriesResponse?.success
          ? countriesResponse.data.data
          : initialData,
    [accumulatedData, countriesResponse, initialData]
  );

  const paginationData = React.useMemo(
    () =>
      countriesResponse?.success
        ? {
            ...countriesResponse.data.pagination,
            ...(accumulatedData.length > 0 && {
              total: Math.max(
                countriesResponse.data.pagination.total,
                accumulatedData.length
              ),
              totalPages: Math.max(
                countriesResponse.data.pagination.totalPages,
                Math.ceil(accumulatedData.length / pageSize)
              ),
            }),
          }
        : undefined,
    [accumulatedData.length, countriesResponse, pageSize]
  );

  const debugUI = React.useMemo(
    () => (
      <div className="mb-4 rounded-2xl bg-muted p-4 text-xs">
        <div>
          Current Page: {page}, Page Size: {pageSize}
        </div>
        <div>
          Items: {data.length}, Accumulated: {accumulatedData.length}
        </div>
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>
          Pagination: {paginationData?.page}/{paginationData?.totalPages}
          (Total: {paginationData?.total})
        </div>
        <div className="mt-1">
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => console.log("Data:", data)}
          >
            Log Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAccumulatedData([])}
          >
            Reset Accumulation
          </Button>
        </div>
      </div>
    ),
    [page, pageSize, data, accumulatedData.length, isLoading, paginationData]
  );

  return (
    <div className="w-full">
      {debugUI}
      <DataTable
        columns={tableColumns}
        data={data}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={pageSize}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        actionButtons={
          <AddCountryDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Country</span>
              <span className="lg:hidden">Add</span>
            </Button>
          </AddCountryDialog>
        }
      />
    </div>
  );
}
