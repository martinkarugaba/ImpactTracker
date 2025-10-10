"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { deleteCity } from "../../actions/cities";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export interface City {
  id: string;
  name: string;
  code: string;
  country_id: string | null;
  district_id: string | null;
  county_id: string | null;
  sub_county_id: string | null;
  municipality_id: string | null;
  created_at?: Date;
  updated_at?: Date;
  district_name?: string;
  county_name?: string;
  subcounty_name?: string;
  municipality_name?: string;
}

export const columns: ColumnDef<City>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
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
    accessorKey: "district_name",
    header: "District",
  },
  {
    accessorKey: "county_name",
    header: "County",
  },
  {
    accessorKey: "subcounty_name",
    header: "Sub County",
  },
  {
    accessorKey: "municipality_name",
    header: "Municipality",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const city = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                // Open edit dialog with city data
                const event = new CustomEvent("editCity", {
                  detail: city,
                });
                window.dispatchEvent(event);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  const result = await deleteCity(city.id);
                  if (result.success) {
                    toast.success("City deleted successfully");
                  } else {
                    toast.error("Failed to delete city");
                  }
                } catch (error) {
                  console.error("Error deleting city:", error);
                  toast.error("Failed to delete city");
                }
              }}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
