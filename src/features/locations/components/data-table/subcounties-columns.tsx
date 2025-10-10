"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type {
  subCounties,
  districts,
  counties,
  countries,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSubCounty } from "@/features/locations/actions/subcounties";
import { toast } from "sonner";

type SubCounty = InferSelectModel<typeof subCounties> & {
  district?: InferSelectModel<typeof districts>;
  county?: InferSelectModel<typeof counties>;
  country?: InferSelectModel<typeof countries>;
};

export const columns: ColumnDef<SubCounty>[] = [
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
    id: "district",
    header: "District",
    cell: ({ row }) => {
      return row.original.district?.name || "-";
    },
  },
  {
    id: "county",
    header: "County",
    cell: ({ row }) => {
      return row.original.county?.name || "-";
    },
  },
  {
    id: "country",
    header: "Country",
    cell: ({ row }) => {
      return row.original.country?.name || "-";
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      if (!row.original.created_at) return "-";
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => {
      if (!row.original.updated_at) return "-";
      const date = new Date(row.original.updated_at);
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subCounty = row.original;

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
                // TODO: Implement edit functionality
                toast.info("Edit functionality coming soon");
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                try {
                  await deleteSubCounty(subCounty.id);
                  toast.success("Sub County deleted successfully");
                } catch {
                  toast.error("Failed to delete sub county");
                }
              }}
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
