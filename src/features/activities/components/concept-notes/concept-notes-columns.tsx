"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type ConceptNote } from "../../types/types";
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

export const conceptNoteColumns: ColumnDef<ConceptNote>[] = [
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
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium">{row.original.title}</div>
        {row.original.charge_code && (
          <div className="text-muted-foreground text-sm">
            Code: {row.original.charge_code}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "activity_lead",
    header: "Activity Lead",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.activity_lead || "Not assigned"}
      </div>
    ),
  },
  {
    accessorKey: "submission_date",
    header: "Submission Date",
    cell: ({ row }) => {
      if (!row.original.submission_date) {
        return <Badge variant="outline">No date set</Badge>;
      }
      return (
        <div className="text-sm">
          {format(new Date(row.original.submission_date), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      if (!row.original.created_at) return "-";
      return (
        <div className="text-sm">
          {format(new Date(row.original.created_at), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "content",
    header: "Content Preview",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="text-muted-foreground truncate text-sm">
          {row.original.content.substring(0, 100)}
          {row.original.content.length > 100 && "..."}
        </p>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const conceptNote = row.original;

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
                if (window.onEditConceptNote) {
                  window.onEditConceptNote(conceptNote.id);
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.onDeleteConceptNote &&
                  confirm("Are you sure you want to delete this concept note?")
                ) {
                  window.onDeleteConceptNote(conceptNote.id);
                }
              }}
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
