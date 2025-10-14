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
    },
  ];
}
