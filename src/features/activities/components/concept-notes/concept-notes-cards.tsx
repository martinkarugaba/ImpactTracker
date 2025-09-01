"use client";

import { useState, useEffect, useCallback } from "react";
import { type ConceptNote } from "../../types/types";
import { getConceptNotesByActivity } from "../../actions/concept-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Calendar,
  Target,
  Lightbulb,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface ConceptNotesCardsProps {
  activityId: string;
  onCreateConceptNote?: () => void;
  onEditConceptNote?: (conceptNoteId: string) => void;
  onDeleteConceptNote?: (conceptNoteId: string) => void;
  refreshKey?: number;
}

export function ConceptNotesCards({
  activityId,
  onCreateConceptNote,
  onEditConceptNote,
  onDeleteConceptNote,
  refreshKey = 0,
}: ConceptNotesCardsProps) {
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

  useEffect(() => {
    if (activityId) {
      fetchConceptNotes();
    }
  }, [activityId, fetchConceptNotes, refreshKey]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (conceptNotes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No Concept Notes
        </h3>
        <p className="mx-auto mb-6 max-w-sm text-gray-600 dark:text-gray-400">
          Start planning your activity by creating your first concept note.
        </p>
        {onCreateConceptNote && (
          <Button
            onClick={onCreateConceptNote}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Note
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Concept Notes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {conceptNotes.length} planning{" "}
            {conceptNotes.length === 1 ? "document" : "documents"}
          </p>
        </div>
        {onCreateConceptNote && (
          <Button onClick={onCreateConceptNote} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        )}
      </div>

      {/* Notes Grid */}
      <div className="space-y-4">
        {conceptNotes.map(note => (
          <Card
            key={note.id}
            className="group relative overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="line-clamp-2 text-base leading-tight font-semibold">
                    {note.title}
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300"
                    >
                      <Lightbulb className="mr-1 h-3 w-3" />
                      Concept
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Draft
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {onEditConceptNote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEditConceptNote(note.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteConceptNote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                      onClick={() => onDeleteConceptNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Content Preview */}
              <div className="space-y-3">
                {note.content && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Content
                    </h4>
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {note.content}
                    </p>
                  </div>
                )}

                {note.project_summary && (
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <Target className="h-3 w-3 text-green-600" />
                      Project Summary
                    </h4>
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {note.project_summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Details */}
              <div className="space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                {note.participant_details && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Participants: {note.participant_details}
                    </span>
                  </div>
                )}

                {note.submission_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Due:{" "}
                      {format(new Date(note.submission_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  Created{" "}
                  {note.created_at
                    ? format(new Date(note.created_at), "MMM dd")
                    : "Unknown"}
                </div>

                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Planning
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
