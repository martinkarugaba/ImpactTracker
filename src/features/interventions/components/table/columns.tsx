"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Intervention } from "../../types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export function getInterventionColumns(): ColumnDef<Intervention>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex h-10 w-10 items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex h-10 w-10 items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "participantName",
      header: "Participant",
      cell: ({ row }) => {
        const name = (row.getValue("participantName") as string) || "";
        if (!name) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        const title = name
          .split(" ")
          .filter(Boolean)
          .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");

        return <div className="text-sm font-medium">{title}</div>;
      },
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => {
        const age = row.getValue("age") as number | undefined | null;
        return <div className="text-sm">{age || age === 0 ? age : "—"}</div>;
      },
    },
    {
      accessorKey: "subcounty",
      header: "Subcounty",
      cell: ({ row }) => {
        const sc = row.getValue("subcounty") as string | undefined | null;
        return <div className="text-sm">{sc ? sc : "—"}</div>;
      },
    },
    {
      accessorKey: "participantContact",
      header: "Contact",
      cell: ({ row }) => {
        const val = row.getValue("participantContact") as
          | string
          | null
          | undefined;
        if (!val)
          return <span className="text-muted-foreground text-sm">—</span>;
        // Ensure phone numbers have a leading zero if missing
        const formatted = val.startsWith("0") ? val : `0${val}`;
        return <div className="text-sm">{formatted}</div>;
      },
    },
    {
      accessorKey: "activityTitle",
      header: "Activity",
      cell: ({ row }) => {
        const original = row.original;
        // If aggregated, show list of activity titles
        const list = original.activities;
        if (list && list.length > 0) {
          return (
            <div className="flex flex-col text-sm">
              {list.map((a, idx) => (
                <div key={`${a.activityId}_${idx}`} className="truncate">
                  {a.activityTitle ?? a.activityId}
                </div>
              ))}
            </div>
          );
        }

        return (
          <div className="text-sm">
            {row.getValue("activityTitle") as string}
          </div>
        );
      },
    },
    {
      accessorKey: "skillCategory",
      header: "Skill Category",
      cell: ({ row }) => {
        const original = row.original;
        const list = original.activities;
        const renderBadge = (cat?: string | null) => {
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
              ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
              : cat === "vocational_skill"
                ? "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                : cat === "soft_skill"
                  ? "border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-400"
                  : "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-400";

          return (
            <Badge
              variant="outline"
              className={`${colorClass} px-2 py-0.5 text-xs`}
              key={cat}
            >
              {label}
            </Badge>
          );
        };

        if (list && list.length > 0) {
          // unique categories
          const cats = Array.from(
            new Set(list.map(a => a.skillCategory).filter(Boolean))
          );
          if (cats.length === 0)
            return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <div className="flex items-center gap-2">
              {cats.map(c => renderBadge(c as string))}
            </div>
          );
        }

        const cat = row.getValue("skillCategory") as string | undefined;
        return renderBadge(cat ?? undefined);
      },
    },
    {
      accessorKey: "outcomes",
      header: "Outcomes",
      cell: ({ row }) => {
        const original = row.original;
        if (original.activities && original.activities.length > 0) {
          const all = original.activities
            .flatMap(a => a.outcomes ?? [])
            .filter(Boolean) as string[];
          const uniq = Array.from(new Set(all));
          return (
            <div className="text-sm">{uniq.length ? uniq.join(", ") : "-"}</div>
          );
        }
        const outcomes = original.outcomes;
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
            className:
              "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
          },
          session_attendance: {
            label: "Session",
            className:
              "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
          },
        };
        const m = map[s] ?? {
          label: s ?? "-",
          className:
            "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
        };

        return (
          <Badge
            variant="outline"
            className={`${m.className} px-2 py-0.5 text-xs`}
          >
            {m.label}
          </Badge>
        );
      },
    },
  ];
}
