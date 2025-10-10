"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

// Available location types
export type LocationType =
  | "country"
  | "district"
  | "subcounty"
  | "parish"
  | "village";

// Location data with proper typing
export interface LocationData {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  parentName?: string;
  created_at: Date;
  updated_at: Date;
}

interface LocationActionsProps {
  location: LocationData;
  onEdit?: (location: LocationData) => void;
  onDelete?: (location: LocationData) => void;
}

function LocationActions({ location, onEdit, onDelete }: LocationActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            if (onEdit) {
              onEdit(location);
            } else {
              toast.info("Edit functionality coming soon");
            }
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            if (onDelete) {
              onDelete(location);
            } else {
              toast.info("Delete functionality coming soon");
            }
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<LocationData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as LocationType;
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
  },
  {
    accessorKey: "parentName",
    header: "Parent",
  },
  {
    id: "actions",
    cell: ({ row }) => <LocationActions location={row.original} />,
  },
];
