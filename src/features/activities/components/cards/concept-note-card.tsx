"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
} from "lucide-react";
import { format } from "date-fns";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ConceptNote } from "../../types/types";

interface ConceptNoteCardProps {
  conceptNote: ConceptNote | null;
  createdAt: string | null;
  onEdit: () => void;
}

export function ConceptNoteCard({
  conceptNote,
  createdAt,
  onEdit,
}: ConceptNoteCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileTextIcon className="mr-2 h-5 w-5" />
            Concept Note
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <EditIcon className="mr-2 h-4 w-4" />
            {conceptNote ? "Edit" : "Add"} Concept Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conceptNote ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b">
                    <td className="w-1/3 py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </td>
                    <td className="py-2">{conceptNote.title}</td>
                  </tr>
                  {conceptNote.charge_code && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Charge Code
                      </td>
                      <td className="py-2">{conceptNote.charge_code}</td>
                    </tr>
                  )}
                  {conceptNote.activity_lead && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Activity Lead
                      </td>
                      <td className="py-2">{conceptNote.activity_lead}</td>
                    </tr>
                  )}
                  {conceptNote.submission_date && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Submission Date
                      </td>
                      <td className="py-2">
                        {format(new Date(conceptNote.submission_date), "PPP")}
                      </td>
                    </tr>
                  )}
                  {conceptNote.project_summary && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Project Summary
                      </td>
                      <td className="py-2">{conceptNote.project_summary}</td>
                    </tr>
                  )}
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                      Content
                    </td>
                    <td className="py-2">
                      <div className="print-section rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                        <MarkdownRenderer content={conceptNote.content} />
                      </div>
                    </td>
                  </tr>
                  {conceptNote.methodology && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Methodology
                      </td>
                      <td className="py-2">{conceptNote.methodology}</td>
                    </tr>
                  )}
                  {conceptNote.requirements && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Requirements
                      </td>
                      <td className="py-2">{conceptNote.requirements}</td>
                    </tr>
                  )}
                  {conceptNote.participant_details && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Participant Details
                      </td>
                      <td className="py-2">
                        {conceptNote.participant_details}
                      </td>
                    </tr>
                  )}
                  {conceptNote.budget_notes && (
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Budget Notes
                      </td>
                      <td className="py-2">{conceptNote.budget_notes}</td>
                    </tr>
                  )}
                  {/* Show budget items if available */}
                  {conceptNote.budget_items &&
                    conceptNote.budget_items.length > 0 && (
                      <tr>
                        <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                          Budget Items
                        </td>
                        <td className="py-2">
                          <div className="rounded border">
                            <table className="w-full">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th className="px-4 py-2 text-left text-sm">
                                    Description
                                  </th>
                                  <th className="px-4 py-2 text-right text-sm">
                                    Quantity
                                  </th>
                                  <th className="px-4 py-2 text-right text-sm">
                                    Unit Cost
                                  </th>
                                  <th className="px-4 py-2 text-right text-sm">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {conceptNote.budget_items.map((item, index) => {
                                  let parsedItem;
                                  try {
                                    parsedItem =
                                      typeof item === "string"
                                        ? JSON.parse(item)
                                        : item;
                                  } catch (_e) {
                                    return null;
                                  }
                                  return (
                                    <tr key={index} className="border-t">
                                      <td className="px-4 py-2">
                                        {parsedItem.description}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        {parsedItem.quantity}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        {parsedItem.unitCost.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        {parsedItem.totalCost.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-muted-foreground flex items-center text-sm">
                <CalendarIcon className="mr-1 h-3 w-3" />
                Added{" "}
                {conceptNote.created_at
                  ? format(new Date(conceptNote.created_at), "PPP")
                  : createdAt
                    ? format(new Date(createdAt), "PPP")
                    : "Unknown"}
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                <DownloadIcon className="mr-1 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <FileTextIcon className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No concept note
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Add a concept note to provide context and planning details for
              this activity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
