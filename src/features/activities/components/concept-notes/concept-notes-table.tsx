"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { conceptNoteColumns } from "./concept-notes-columns";
import { type ConceptNote } from "../../types/types";
import { getConceptNotesByActivity } from "../../actions/concept-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface ConceptNotesTableProps {
  activityId: string;
  onCreateConceptNote?: () => void;
  onEditConceptNote?: (conceptNoteId: string) => void;
  onDeleteConceptNote?: (conceptNoteId: string) => void;
  refreshKey?: number;
}

export function ConceptNotesTable({
  activityId,
  onCreateConceptNote,
  onEditConceptNote,
  onDeleteConceptNote,
  refreshKey = 0,
}: ConceptNotesTableProps) {
  const [conceptNotes, setConceptNotes] = useState<ConceptNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConceptNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getConceptNotesByActivity(activityId);
      if (response.success && response.data) {
        setConceptNotes(response.data);
      } else {
        setError(response.error || "Failed to fetch concept notes");
      }
    } catch (err) {
      setError("An error occurred while fetching concept notes");
      console.error("Error fetching concept notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  // Set up global handlers for edit and delete
  useEffect(() => {
    if (onEditConceptNote) {
      window.onEditConceptNote = onEditConceptNote;
    }
    if (onDeleteConceptNote) {
      window.onDeleteConceptNote = onDeleteConceptNote;
    }

    return () => {
      window.onEditConceptNote = undefined;
      window.onDeleteConceptNote = undefined;
    };
  }, [onEditConceptNote, onDeleteConceptNote]);

  useEffect(() => {
    if (activityId) {
      fetchConceptNotes();
    }
  }, [activityId, fetchConceptNotes, refreshKey]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-5 w-5" />
            <CardTitle>Concept Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">
              Loading concept notes...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-5 w-5" />
            <CardTitle>Concept Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive text-sm">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conceptNotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground h-5 w-5" />
              <CardTitle>Concept Notes</CardTitle>
            </div>
            {onCreateConceptNote && (
              <Button variant="outline" size="sm" onClick={onCreateConceptNote}>
                <Plus className="mr-2 h-4 w-4" />
                Create Concept Note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              No concept notes have been created for this activity yet.
            </p>
            {onCreateConceptNote && (
              <Button variant="outline" onClick={onCreateConceptNote}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Concept Note
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-5 w-5" />
            <CardTitle>Concept Notes ({conceptNotes.length})</CardTitle>
          </div>
          {onCreateConceptNote && (
            <Button variant="outline" size="sm" onClick={onCreateConceptNote}>
              <Plus className="mr-2 h-4 w-4" />
              Add Concept Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={conceptNoteColumns}
          data={conceptNotes}
          filterColumn="title"
          filterPlaceholder="Filter concept notes..."
          showColumnToggle={true}
          showPagination={conceptNotes.length > 5}
          showRowSelection={false}
          pageSize={5}
        />
      </CardContent>
    </Card>
  );
}
