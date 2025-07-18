"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReusableDataTable } from "@/components/ui/reusable-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, FileIcon, MoreHorizontal, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { ConceptNote } from "../../types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConceptNoteDetailsDialog } from "./concept-note-details-dialog";

// Define the columns for the concept notes table
const conceptNotesColumns: ColumnDef<ConceptNote>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="line-clamp-1 font-medium">{row.original.title}</div>
    ),
  },
  {
    id: "activity_lead",
    accessorKey: "activity_lead",
    header: "Activity Lead",
    cell: ({ row }) => (
      <div className="line-clamp-1">{row.original.activity_lead || "N/A"}</div>
    ),
  },
  {
    id: "submission_date",
    accessorKey: "submission_date",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3" />
        {row.original.submission_date
          ? format(new Date(row.original.submission_date), "PPP")
          : row.original.created_at
            ? format(new Date(row.original.created_at), "PPP")
            : "N/A"}
      </div>
    ),
  },
  {
    id: "content",
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => (
      <div className="text-muted-foreground line-clamp-1 max-w-[300px] text-sm">
        {row.original.content
          ? row.original.content.substring(0, 50) + "..."
          : "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const note = row.original;

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
              onClick={e => {
                e.stopPropagation();
                navigator.clipboard.writeText(note.id);
              }}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface ConceptNotesTableProps {
  conceptNotes: ConceptNote[];
  onEditNote?: (note: ConceptNote) => void;
  onCreateNote?: () => void;
}

export function ConceptNotesTable({
  conceptNotes,
  onEditNote,
  onCreateNote,
}: ConceptNotesTableProps) {
  const [selectedNote, setSelectedNote] = useState<ConceptNote | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Handler for row click to open details
  const handleRowClick = (conceptNote: ConceptNote) => {
    setSelectedNote(conceptNote);
    setIsDetailsDialogOpen(true);
  };

  // Handler for edit button in the dialog
  const handleEditNote = () => {
    if (selectedNote && onEditNote) {
      onEditNote(selectedNote);
    }
    setIsDetailsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Concept Notes</h3>
        {onCreateNote && (
          <Button size="sm" onClick={onCreateNote}>
            <PlusIcon className="mr-1 h-4 w-4" />
            New Concept Note
          </Button>
        )}
      </div>

      {conceptNotes.length === 0 ? (
        <div className="rounded-md border py-8 text-center">
          <FileIcon className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No concept notes
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Add a concept note to provide context and planning details for this
            activity.
          </p>
          {onCreateNote && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onCreateNote}
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              Create Concept Note
            </Button>
          )}
        </div>
      ) : (
        <ReusableDataTable
          columns={conceptNotesColumns}
          data={conceptNotes}
          filterColumn="title"
          filterPlaceholder="Filter by title..."
          showColumnToggle={false}
          showPagination={conceptNotes.length > 10}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      )}

      {/* Dialog for showing concept note details */}
      {selectedNote && (
        <ConceptNoteDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          conceptNote={selectedNote}
          onEdit={handleEditNote}
        />
      )}
    </div>
  );
}
