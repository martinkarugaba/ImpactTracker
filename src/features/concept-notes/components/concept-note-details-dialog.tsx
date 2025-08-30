"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type ConceptNoteWithDetails } from "../actions/concept-notes";

interface ConceptNoteDetailsDialogProps {
  conceptNote: ConceptNoteWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVITY_TYPE_CONFIG = {
  training: { label: "Training", color: "bg-blue-500" },
  meeting: { label: "Meeting", color: "bg-green-500" },
  workshop: { label: "Workshop", color: "bg-purple-500" },
  conference: { label: "Conference", color: "bg-orange-500" },
  seminar: { label: "Seminar", color: "bg-pink-500" },
  other: { label: "Other", color: "bg-gray-500" },
} as const;

export function ConceptNoteDetailsDialog({
  conceptNote,
  isOpen,
  onClose,
}: ConceptNoteDetailsDialogProps) {
  if (!conceptNote) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {conceptNote.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Activity Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Activity:
                  </span>
                  <p className="font-medium">{conceptNote.activity.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Type:
                  </span>
                  <div className="mt-1">
                    {getActivityTypeBadge(conceptNote.activity.type)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Activity Period:
                  </span>
                  <p>
                    {formatDate(conceptNote.activity.startDate)} -{" "}
                    {formatDate(conceptNote.activity.endDate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Project:
                  </span>
                  <p className="font-medium">
                    {conceptNote.project.acronym || conceptNote.project.name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Organization:
                  </span>
                  <p className="font-medium">{conceptNote.organization.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Status:
                  </span>
                  <div className="mt-1">
                    <Badge
                      variant={
                        conceptNote.submission_date ? "default" : "secondary"
                      }
                      className={
                        conceptNote.submission_date
                          ? "bg-green-500 text-white"
                          : ""
                      }
                    >
                      {conceptNote.submission_date ? "Submitted" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Concept Note Details */}
          <Card>
            <CardHeader>
              <CardTitle>Concept Note Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conceptNote.charge_code && (
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Charge Code:
                  </span>
                  <p className="bg-muted mt-1 rounded px-2 py-1 font-mono text-sm">
                    {conceptNote.charge_code}
                  </p>
                </div>
              )}

              {conceptNote.activity_lead && (
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Activity Lead:
                  </span>
                  <p className="mt-1">{conceptNote.activity_lead}</p>
                </div>
              )}

              {conceptNote.submission_date && (
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Submission Date:
                  </span>
                  <p className="mt-1">
                    {formatDate(conceptNote.submission_date)}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Main Content:
                </span>
                <div className="prose prose-sm mt-2 max-w-none">
                  <p className="whitespace-pre-wrap">{conceptNote.content}</p>
                </div>
              </div>

              {conceptNote.project_summary && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Project Summary:
                    </span>
                    <div className="prose prose-sm mt-2 max-w-none">
                      <p className="whitespace-pre-wrap">
                        {conceptNote.project_summary}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {conceptNote.methodology && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Methodology:
                    </span>
                    <div className="prose prose-sm mt-2 max-w-none">
                      <p className="whitespace-pre-wrap">
                        {conceptNote.methodology}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {conceptNote.requirements && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Requirements:
                    </span>
                    <div className="prose prose-sm mt-2 max-w-none">
                      <p className="whitespace-pre-wrap">
                        {conceptNote.requirements}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {conceptNote.participant_details && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Participant Details:
                    </span>
                    <div className="prose prose-sm mt-2 max-w-none">
                      <p className="whitespace-pre-wrap">
                        {conceptNote.participant_details}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Budget Information */}
          {(conceptNote.budget_items.length > 0 ||
            conceptNote.budget_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conceptNote.budget_items.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Budget Items:
                    </span>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {conceptNote.budget_items.map((item, index) => (
                        <li key={index} className="text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {conceptNote.budget_notes && (
                  <>
                    {conceptNote.budget_items.length > 0 && <Separator />}
                    <div>
                      <span className="text-muted-foreground text-sm font-medium">
                        Budget Notes:
                      </span>
                      <div className="prose prose-sm mt-2 max-w-none">
                        <p className="whitespace-pre-wrap">
                          {conceptNote.budget_notes}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{formatDate(conceptNote.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p>{formatDate(conceptNote.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
