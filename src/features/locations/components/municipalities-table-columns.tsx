"use client";

import type { municipalities } from "@/lib/db/schema";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import type { InferSelectModel } from "drizzle-orm";

type Municipality = InferSelectModel<typeof municipalities> & {
  country: { name: string };
  district: { name: string };
  county: { name: string };
  subCounty: { name: string };
};

interface GetMunicipalityTableColumnsProps {
  onSelectMunicipality?: (municipality: Municipality | null) => void;
}

export function getMunicipalityTableColumns({}: GetMunicipalityTableColumnsProps): ColumnDef<Municipality>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      id: "country",
      header: "Country",
      accessorFn: row => row.country?.name ?? "N/A",
    },
    {
      id: "district",
      header: "District",
      accessorFn: row => row.district?.name ?? "N/A",
    },
    {
      id: "county",
      header: "County",
      accessorFn: row => row.county?.name ?? "N/A",
    },
    {
      id: "subCounty",
      header: "Sub County",
      accessorFn: row => row.subCounty?.name ?? "N/A",
    },
  ];
}
