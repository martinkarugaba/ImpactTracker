"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type ActivityReport } from "../../types/types";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const activityReportsColumns: ColumnDef<ActivityReport>[] = [
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
    accessorKey: "title",
    header: "Report Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="max-w-[200px]">
          <div className="truncate font-medium">{title}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "team_leader",
    header: "Team Leader",
    cell: ({ row }) => {
      const teamLeader = row.getValue("team_leader") as string;
      return <div className="font-medium">{teamLeader}</div>;
    },
  },
  {
    accessorKey: "execution_date",
    header: "Execution Date",
    cell: ({ row }) => {
      const executionDate = row.getValue("execution_date") as Date;
      if (!executionDate) {
        return <Badge variant="outline">No date set</Badge>;
      }
      return (
        <div className="font-medium">
          {format(new Date(executionDate), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "cluster_name",
    header: "Cluster",
    cell: ({ row }) => {
      const clusterName = row.getValue("cluster_name") as string;
      return <Badge variant="outline">{clusterName}</Badge>;
    },
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => {
      const venue = row.getValue("venue") as string;
      return (
        <div className="max-w-[150px]">
          <div className="truncate">{venue}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as Date;
      return (
        <div className="text-muted-foreground text-sm">
          {format(new Date(createdAt), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const activityReport = row.original;

      const handleEdit = () => {
        if (window.onEditActivityReport) {
          window.onEditActivityReport(activityReport.id);
        }
      };

      const handleDelete = () => {
        if (window.onDeleteActivityReport) {
          window.onDeleteActivityReport(activityReport.id);
        }
      };

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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
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

// Extend the Window interface to include our global handlers
declare global {
  interface Window {
    onEditActivityReport?: (activityReportId: string) => void;
    onDeleteActivityReport?: (activityReportId: string) => void;
  }
}
