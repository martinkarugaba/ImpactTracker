import { type ColumnDef } from "@tanstack/react-table";
import { type Intervention } from "../../types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocationCache } from "@/features/locations/hooks/use-location-cache";
import { useEffect, useState } from "react";
import { User, MapPin, Phone, Zap, Trophy, Server } from "lucide-react";

export function getInterventionColumns(): ColumnDef<Intervention>[] {
  // Create a component that uses the location cache
  function SubCountyCell({
    subCounty,
  }: {
    subCounty: string | null | undefined;
  }) {
    const { getSubCountyNamesByCodes } = useLocationCache();
    const [displayName, setDisplayName] = useState<string>(subCounty || "—");

    useEffect(() => {
      if (subCounty && !subCounty.includes(" ")) {
        // It's a code, convert it to name
        getSubCountyNamesByCodes([subCounty]).then(names => {
          setDisplayName(names[subCounty] || subCounty);
        });
      } else {
        setDisplayName(subCounty || "—");
      }
    }, [subCounty, getSubCountyNamesByCodes]);

    return <div className="text-sm">{displayName}</div>;
  }

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
            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex h-10 w-10 items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
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
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        const title = name
          .split(" ")
          .filter(Boolean)
          .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");

        // Get initials for avatar
        const initials = name
          .split(" ")
          .filter(Boolean)
          .map(w => w[0].toUpperCase())
          .slice(0, 2)
          .join("");

        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium">{title}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => {
        const age = row.getValue("age") as number | undefined | null;
        return (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-sm">{age || age === 0 ? age : "—"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "sex",
      header: "Sex",
      cell: ({ row }) => {
        const sex = row.getValue("sex") as string | undefined | null;
        return (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <div className="text-sm capitalize">{sex || "—"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "subcounty",
      header: "Subcounty",
      cell: ({ row }) => {
        const sc = row.getValue("subcounty") as string | undefined | null;
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <SubCountyCell subCounty={sc} />
          </div>
        );
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
          return (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>
          );
        // Ensure phone numbers have a leading zero if missing
        const formatted = val.startsWith("0") ? val : `0${val}`;
        return (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="text-sm">{formatted}</div>
          </div>
        );
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
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div className="flex flex-col text-sm">
                {list.map((a, idx) => (
                  <div key={`${a.activityId}_${idx}`} className="truncate">
                    {a.activityTitle ?? a.activityId}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <div className="text-sm">
              {row.getValue("activityTitle") as string}
            </div>
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
            return <span className="text-xs text-muted-foreground">—</span>;
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
            return (
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-muted-foreground">—</span>
              </div>
            );
          return (
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <div className="flex items-center gap-2">
                {cats.map(c => renderBadge(c as string))}
              </div>
            </div>
          );
        }

        const cat = row.getValue("skillCategory") as string | undefined;
        return (
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            {renderBadge(cat ?? undefined)}
          </div>
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
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <Badge
              variant="outline"
              className={`${m.className} px-2 py-0.5 text-xs`}
            >
              {m.label}
            </Badge>
          </div>
        );
      },
    },
  ];
}
