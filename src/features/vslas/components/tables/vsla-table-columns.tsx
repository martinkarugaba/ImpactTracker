"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VSLA } from "../../types";
import { formatCurrency } from "@/lib/utils";

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
    size: 40, // Fixed column width
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
    accessorKey: "organization.name",
    header: "Organization",
    cell: ({ row }) => {
      const orgName = row.original.organization?.name || "No Organization";
      const orgAcronym = row.original.organization?.acronym;
      return (
        <div className="space-y-1">
          <div className="font-medium">{orgAcronym || orgName}</div>
          {orgAcronym && (
            <div className="text-muted-foreground text-sm">{orgName}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "cluster.name",
    header: "Cluster",
    cell: ({ row }) => {
      const clusterName = row.original.cluster?.name || "No Cluster";
      return <div className="font-medium">{clusterName}</div>;
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
    accessorKey: "total_savings",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Total Savings
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const savings = row.getValue("total_savings") as number;
      return (
        <div className="text-right font-medium text-green-600">
          {formatCurrency(savings)}
        </div>
      );
    },
  },
  {
    accessorKey: "total_loans",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Total Loans
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const loans = row.getValue("total_loans") as number;
      return (
        <div className="text-right font-medium text-blue-600">
          {formatCurrency(loans)}
        </div>
      );
    },
  },
  {
    accessorKey: "meeting_frequency",
    header: "Meeting Frequency",
    cell: ({ row }) => {
      const frequency = row.getValue("meeting_frequency") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {frequency}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "inactive"
                ? "secondary"
                : "destructive"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "formed_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Formed Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("formed_date") as Date;
      return (
        <div className="text-sm">{new Date(date).toLocaleDateString()}</div>
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
