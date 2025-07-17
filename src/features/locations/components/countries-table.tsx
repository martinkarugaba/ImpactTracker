"use client";

import * as React from "react";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { countries } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { countryColumns } from "@/features/locations/components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCountryDialog } from "@/features/locations/components/dialogs/add-country-dialog";
import { useRouter } from "next/navigation";
import { useCountries } from "@/features/locations/hooks/use-locations-query";
import { mergeWithoutDuplicates } from "../utils/pagination";

type Country = InferSelectModel<typeof countries>;

interface CountriesTableProps {
  initialData: Country[];
}

export function CountriesTable({ initialData }: CountriesTableProps) {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");

  const [accumulatedData, setAccumulatedData] =
    React.useState<Country[]>(initialData);

  const [previousOptions, setPreviousOptions] = React.useState({
    pageSize: 20,
    page: 1,
  });

  const { data: countriesResponse, isLoading } = useCountries({
    page,
    limit: pageSize,
    search,
  });

  const handleRowClick = React.useCallback(
    (countryId: string) => {
      router.push(`/dashboard/locations/${countryId}`);
    },
    [router]
  );

  const tableColumns = React.useMemo(() => countryColumns, []);

  const handlePaginationChange = React.useCallback(
    (newPage: number, newPageSize: number) => {
      const isPageSizeChange = newPageSize !== pageSize;
      const isPageSizeIncrease = newPageSize > pageSize;

      setPreviousOptions({ page, pageSize });

      if (isPageSizeChange) {
        if (isPageSizeIncrease) {
          // Keep the current data when increasing page size
          const currentData = countriesResponse?.success
            ? countriesResponse.data.data
            : [];
          setAccumulatedData(prevData =>
            mergeWithoutDuplicates(prevData, currentData)
          );
          setPage(1);
          setPageSize(newPageSize);
        } else {
          setAccumulatedData([]);
          setPage(1);
          setPageSize(newPageSize);
        }
      } else {
        setPage(newPage);
        if (newPage < page) {
          setAccumulatedData([]);
        }
      }
    },
    [page, pageSize, countriesResponse]
  );

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
      <div className="bg-muted mb-4 rounded-2xl p-4 text-xs">
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
      <ReusableDataTable
        columns={tableColumns}
        data={data}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
        showColumnToggle={true}
        showPagination={true}
        showRowSelection={true}
        pageSize={pageSize}
        onRowClick={row => handleRowClick(row.id)}
        serverSidePagination={true}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        customActions={
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
