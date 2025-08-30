"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, FileText } from "lucide-react";
import { type ConceptNoteWithDetails } from "../actions/concept-notes";

interface ConceptNotesTableProps {
  conceptNotes: ConceptNoteWithDetails[];
  isLoading: boolean;
  onViewConceptNote: (conceptNote: ConceptNoteWithDetails) => void;
  onEditConceptNote: (conceptNote: ConceptNoteWithDetails) => void;
}

const ACTIVITY_TYPE_CONFIG = {
  training: { label: "Training", color: "bg-blue-500" },
  meeting: { label: "Meeting", color: "bg-green-500" },
  workshop: { label: "Workshop", color: "bg-purple-500" },
  conference: { label: "Conference", color: "bg-orange-500" },
  seminar: { label: "Seminar", color: "bg-pink-500" },
  other: { label: "Other", color: "bg-gray-500" },
} as const;

export function ConceptNotesTable({
  conceptNotes,
  isLoading,
  onViewConceptNote,
  onEditConceptNote,
}: ConceptNotesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-16 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (conceptNotes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No concept notes found</h3>
        <p className="text-muted-foreground">
          No concept notes match your current filters.
        </p>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityTypeBadge = (type: string) => {
    const config =
      ACTIVITY_TYPE_CONFIG[type as keyof typeof ACTIVITY_TYPE_CONFIG] ||
      ACTIVITY_TYPE_CONFIG.other;
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conceptNotes.map(conceptNote => (
            <TableRow key={conceptNote.id}>
              <TableCell>
                <div className="font-medium">{conceptNote.title}</div>
                <div className="text-muted-foreground max-w-[200px] truncate text-sm">
                  {conceptNote.content.substring(0, 60)}...
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{conceptNote.activity.title}</div>
                <div className="text-muted-foreground text-sm">
                  {formatDate(conceptNote.activity.startDate)} -{" "}
                  {formatDate(conceptNote.activity.endDate)}
                </div>
              </TableCell>
              <TableCell>
                {getActivityTypeBadge(conceptNote.activity.type)}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {conceptNote.project.acronym || conceptNote.project.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {conceptNote.organization.name}
                </div>
              </TableCell>
              <TableCell>{formatDate(conceptNote.submission_date)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    conceptNote.submission_date ? "default" : "secondary"
                  }
                  className={
                    conceptNote.submission_date ? "bg-green-500 text-white" : ""
                  }
                >
                  {conceptNote.submission_date ? "Submitted" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onViewConceptNote(conceptNote)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEditConceptNote(conceptNote)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
