"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Intervention } from "../../types/types";

export function getInterventionColumns(): ColumnDef<Intervention>[] {
  return [
    {
      accessorKey: "participantName",
      header: "Participant",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.getValue("participantName") as string}
          </div>
        );
      },
    },
    {
      accessorKey: "participantContact",
      header: "Contact",
    },
    {
      accessorKey: "activityTitle",
      header: "Activity",
    },
    {
      accessorKey: "skillCategory",
      header: "Skill Category",
      cell: ({ row }) => {
        const cat = row.getValue("skillCategory") as string | undefined;
        if (!cat)
          return <span className="text-muted-foreground text-xs">—</span>;
        const label =
          cat === "business_skill"
            ? "Business"
            : cat === "vocational_skill"
              ? "Vocational"
              : cat === "soft_skill"
                ? "Soft skill"
                : cat;
        const colorClass =
          cat === "business_skill"
            ? "border-amber-200 bg-amber-100 text-amber-800"
            : cat === "vocational_skill"
              ? "border-purple-200 bg-purple-100 text-purple-800"
              : cat === "soft_skill"
                ? "border-teal-200 bg-teal-100 text-teal-800"
                : "border-gray-200 bg-gray-100 text-gray-800";
        return (
          <div className="flex items-center">
            <div
              className={
                "rounded-full border px-2 py-0.5 text-xs " + colorClass
              }
            >
              {label}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "outcomes",
      header: "Outcomes",
      cell: ({ row }) => {
        const outcomes = row.original.outcomes;
        return (
          <div className="text-sm">{outcomes ? outcomes.join(", ") : "-"}</div>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const s = row.getValue("source") as string;
        const map: Record<string, { label: string; className: string }> = {
          activity_participants: {
            label: "Activity",
            className: "bg-blue-100 text-blue-800 border-blue-200",
          },
          session_attendance: {
            label: "Session",
            className: "bg-green-100 text-green-800 border-green-200",
          },
        };
        const m = map[s] ?? {
          label: s ?? "-",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
        return (
          <div className={`rounded-md px-2 py-0.5 text-xs ${m.className}`}>
            {m.label}
          </div>
        );
      },
    },
  ];
}
