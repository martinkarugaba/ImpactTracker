"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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

export const createColumns = (
  onView?: (vsla: VSLA) => void,
  onEdit?: (vsla: VSLA) => void,
  onDelete?: (vsla: VSLA) => void,
  onManageMembers?: (vsla: VSLA) => void
): ColumnDef<VSLA>[] => [
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
      const subCounty = row.original.sub_county;
      const vslaId = row.original.id;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href={`/dashboard/vslas/${vslaId}`}
              className="font-medium text-gray-900 hover:underline dark:text-gray-100"
              onClick={e => e.stopPropagation()}
            >
              {name}
            </Link>
            {subCounty && (
              <Badge
                variant="outline"
                className="w-fit border-blue-200 bg-blue-100 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {subCounty}
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "code",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         className="h-auto p-0 font-medium hover:bg-transparent"
  //       >
  //         Code
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const code = row.getValue("code") as string;
  //     return (
  //       <div className="text-muted-foreground font-mono text-sm">{code}</div>
  //     );
  //   },
  // },
  {
    accessorKey: "district",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          District
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const district = row.getValue("district") as string;
      return (
        <Badge
          variant="outline"
          className="border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
        >
          {district}
        </Badge>
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
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        >
          {subCounty}
        </Badge>
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {members}
          </span>
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
          <div className="text-sm text-gray-400 italic dark:text-gray-500">
            Not assigned
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {chairperson.first_name} {chairperson.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2 pl-8">
            <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="text-sm text-gray-400 italic dark:text-gray-500">
            Not assigned
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
              <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {secretary.first_name} {secretary.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2 pl-8">
            <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="text-sm text-gray-400 italic dark:text-gray-500">
            Not assigned
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {treasurer.first_name} {treasurer.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2 pl-8">
            <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onView?.(vsla);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onEdit?.(vsla);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit VSLA
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onManageMembers?.(vsla);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={e => {
                e.stopPropagation();
                onDelete?.(vsla);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete VSLA
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
