"use client";

import { type ColumnDef, type Table, type Row } from "@tanstack/react-table";
import { type Participant } from "../../types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionCell } from "./action-cell";
import { LocationNameCell, LocationType } from "./location-name-cell";

interface GetColumnsProps {
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
}

export function getColumns({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<Participant>[] {
  return [
    {
      id: "select",
      header: ({ table }: { table: Table<Participant> }) => (
        <div className="flex items-center justify-center px-4">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }: { row: Row<Participant> }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "fullName",
      header: "Name",
      enableHiding: true,
      accessorFn: row => `${row.firstName} ${row.lastName}`, // This enables sorting and filtering
      cell: ({ row }) => (
        <div>
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
    },
    {
      id: "sex",
      header: "Sex",
      enableHiding: true,
      accessorFn: row => row.sex,
      cell: ({ row }) => {
        const sex = row.original.sex;
        if (!sex) return "";

        const firstLetter = sex.charAt(0).toUpperCase();
        return firstLetter === "M" || firstLetter === "F"
          ? firstLetter
          : sex.toLowerCase() === "male"
            ? "M"
            : sex.toLowerCase() === "female"
              ? "F"
              : firstLetter;
      },
    },
    {
      accessorKey: "age",
      header: "Age",
      enableHiding: true,
    },
    {
      id: "district",
      header: "District",
      enableHiding: true,
      accessorFn: row => row.districtName || row.district,
      cell: ({ row }) => {
        // Use the LocationNameCell component to show district name
        const districtValue =
          row.original.districtName || row.original.district || "";

        return (
          <LocationNameCell id={districtValue} type={LocationType.District} />
        );
      },
    },
    {
      id: "subCounty",
      header: "Sub County",
      enableHiding: true,
      accessorFn: row => row.subCountyName || row.subCounty,
      cell: ({ row }) => {
        // Use the LocationNameCell component to show subcounty name
        const subCountyValue =
          row.original.subCountyName || row.original.subCounty || "";

        return (
          <LocationNameCell id={subCountyValue} type={LocationType.SubCounty} />
        );
      },
    },
    {
      id: "country",
      header: "Country",
      enableHiding: true,
      accessorFn: row => row.countyName || row.country || "",
      cell: ({ row }) => {
        // Use the LocationNameCell component to show country name
        const countryValue =
          row.original.countyName || row.original.country || "";

        return (
          <LocationNameCell id={countryValue} type={LocationType.Country} />
        );
      },
    },
    {
      id: "organization",
      header: "Organization",
      enableHiding: true,
      accessorFn: row => row.organizationName || row.organization_id,
      cell: ({ row }) => {
        const name =
          row.original.organizationName || row.original.organization_id;
        // We could add logic here to find the organization by ID and get its acronym
        // For now, showing 3-letter acronym from name
        const acronym = name
          .split(/\s+/)
          .map(word => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 3);
        return (
          <div className="max-w-[200px] truncate" title={name}>
            <span className="font-medium">{acronym}</span>
            {/* <span className="text-muted-foreground ml-2 text-xs">({name})</span> */}
          </div>
        );
      },
    },
    {
      id: "project",
      header: "Project",
      enableHiding: true,
      accessorFn: row => row.projectName || "Unknown",
      cell: ({ row }) => {
        const name = row.original.projectName || "Unknown";
        // We could add logic here to find the project and get its acronym
        // For now, showing 3-letter acronym from name
        const acronym = name
          .split(/\s+/)
          .map(word => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 3);
        return (
          <div className="max-w-[200px] truncate" title={name}>
            <span className="font-medium">{acronym}</span>
            {/* <span className="text-muted-foreground ml-2 text-xs">({name})</span> */}
          </div>
        );
      },
    },
    {
      accessorKey: "designation",
      header: "Designation",
      enableHiding: true,
    },
    {
      accessorKey: "enterprise",
      header: "Enterprise",
      enableHiding: true,
    },
    {
      accessorKey: "contact",
      header: "Contact",
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => (
        <ActionCell
          participant={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
