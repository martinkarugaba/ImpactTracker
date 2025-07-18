"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConceptNote } from "../../types/types";
import { format } from "date-fns";
import { CalendarIcon, EditIcon, UserIcon } from "lucide-react";

interface ConceptNoteDetailsDialogProps {
  conceptNote: ConceptNote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function ConceptNoteDetailsDialog({
  conceptNote,
  open,
  onOpenChange,
  onEdit,
}: ConceptNoteDetailsDialogProps) {
  // Format the submission date or use creation date as fallback
  const displayDate = conceptNote.submission_date
    ? format(new Date(conceptNote.submission_date), "PPP")
    : conceptNote.created_at
      ? format(new Date(conceptNote.created_at), "PPP")
      : "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{conceptNote.title}</DialogTitle>
          <DialogDescription>
            <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {displayDate}
              </div>
              {conceptNote.activity_lead && (
                <div className="flex items-center">
                  <UserIcon className="mr-1 h-3 w-3" />
                  {conceptNote.activity_lead}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Overview Section */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold">Overview</h3>
            <div className="text-sm whitespace-pre-wrap">
              {conceptNote.content || "No overview provided."}
            </div>
          </div>

          {/* Budget Items Section */}
          {conceptNote.budget_items && conceptNote.budget_items.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Budget</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Description</th>
                    <th className="py-2 text-right font-medium">Quantity</th>
                    <th className="py-2 text-right font-medium">Unit Cost</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {conceptNote.budget_items.map(
                    (item: string, index: number) => {
                      try {
                        const parsedItem = JSON.parse(item);
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2">{parsedItem.description}</td>
                            <td className="py-2 text-right">
                              {parsedItem.quantity}
                            </td>
                            <td className="py-2 text-right">
                              {parsedItem.unitCost.toFixed(2)}
                            </td>
                            <td className="py-2 text-right">
                              {parsedItem.totalCost.toFixed(2)}
                            </td>
                          </tr>
                        );
                      } catch (_e) {
                        return null;
                      }
                    }
                  )}
                  <tr className="font-medium">
                    <td className="py-2" colSpan={3}>
                      Total
                    </td>
                    <td className="py-2 text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(
                        conceptNote.budget_items.reduce(
                          (sum: number, item: string) => {
                            try {
                              const parsedItem = JSON.parse(item);
                              return sum + (parsedItem.totalCost || 0);
                            } catch (_e) {
                              return sum;
                            }
                          },
                          0
                        )
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Project Summary Section */}
          {conceptNote.project_summary && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Project Summary</h3>
              <div className="text-sm whitespace-pre-wrap">
                {conceptNote.project_summary}
              </div>
            </div>
          )}

          {/* Methodology Section */}
          {conceptNote.methodology && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Methodology</h3>
              <div className="text-sm whitespace-pre-wrap">
                {conceptNote.methodology}
              </div>
            </div>
          )}

          {/* Requirements Section */}
          {conceptNote.requirements && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Requirements</h3>
              <div className="text-sm whitespace-pre-wrap">
                {conceptNote.requirements}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {onEdit && (
            <Button onClick={onEdit} variant="outline">
              <EditIcon className="mr-1 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
