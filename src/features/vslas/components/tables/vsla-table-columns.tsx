"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Copy,
  Phone,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VSLA, VSLAMember } from "../../types";

// Helper function to get member by role
const getMemberByRole = (
  members: VSLAMember[] | undefined,
  role: string
): VSLAMember | undefined => {
  return members?.find(
    member => member.role.toLowerCase() === role.toLowerCase()
  );
};

export const columns: ColumnDef<VSLA>[] = [
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
          className="h-4 w-4 flex-shrink-0"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="h-4 w-4 flex-shrink-0"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const code = row.original.code;
      return (
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          <div className="text-muted-foreground text-sm">{code}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "sub_county",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Sub County
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subCounty = row.getValue("sub_county") as string;
      const district = row.original.district;
      return (
        <div className="space-y-1">
          <div className="font-medium">{subCounty}</div>
          <div className="text-muted-foreground text-sm">{district}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "total_members",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Members
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const members = row.getValue("total_members") as number;
      return (
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="font-medium">{members}</span>
        </div>
      );
    },
  },
  {
    id: "chairperson",
    header: "Chairperson",
    cell: ({ row }) => {
      const chairperson = getMemberByRole(row.original.members, "chairperson");
      if (!chairperson) {
        return (
          <div className="text-muted-foreground text-sm">Not assigned</div>
        );
      }
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <User className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-sm font-medium">
              {chairperson.first_name} {chairperson.last_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-sm">
              {chairperson.phone}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "secretary",
    header: "Secretary",
    cell: ({ row }) => {
      const secretary = getMemberByRole(row.original.members, "secretary");
      if (!secretary) {
        return (
          <div className="text-muted-foreground text-sm">Not assigned</div>
        );
      }
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <User className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-sm font-medium">
              {secretary.first_name} {secretary.last_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-sm">
              {secretary.phone}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "treasurer",
    header: "Treasurer",
    cell: ({ row }) => {
      const treasurer = getMemberByRole(row.original.members, "treasurer");
      if (!treasurer) {
        return (
          <div className="text-muted-foreground text-sm">Not assigned</div>
        );
      }
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <User className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-sm font-medium">
              {treasurer.first_name} {treasurer.last_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-sm">
              {treasurer.phone}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const vsla = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(vsla.id)}
              className="cursor-pointer"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy VSLA ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit VSLA
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              Manage Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete VSLA
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
