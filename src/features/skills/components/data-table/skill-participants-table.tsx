"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ExternalLink, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import type { SkillParticipant } from "../../types/types";
import { cn } from "@/lib/utils";

interface SkillParticipantsTableProps {
  participants: SkillParticipant[];
  isLoading?: boolean;
}

export function SkillParticipantsTable({
  participants,
  isLoading = false,
}: SkillParticipantsTableProps) {
  const columns = useMemo<ColumnDef<SkillParticipant>[]>(
    () => [
      {
        accessorKey: "participantName",
        header: "Name",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </div>
            {row.original.designation && (
              <div className="text-muted-foreground text-xs">
                {row.original.designation}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) =>
          row.original.contact ? (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="text-muted-foreground h-3 w-3" />
              {row.original.contact}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          ),
      },
      {
        accessorKey: "sex",
        header: "Sex",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.sex || "-"}
          </Badge>
        ),
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => {
          const age = row.original.age;
          return age ? (
            <span className="text-sm">{age}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: "district",
        header: "District",
        cell: ({ row }) =>
          row.original.district ? (
            <div className="flex items-center gap-1">
              <MapPin className="text-muted-foreground h-3 w-3" />
              <Badge variant="outline" className="text-xs">
                {row.original.district}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          ),
      },
      {
        accessorKey: "subCounty",
        header: "Subcounty",
        cell: ({ row }) =>
          row.original.subCounty ? (
            <Badge variant="outline" className="text-xs">
              {row.original.subCounty}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          ),
      },
      {
        accessorKey: "employmentStatus",
        header: "Employment",
        cell: ({ row }) => {
          const status = row.original.employmentStatus;
          const statusColors = {
            employed:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            unemployed:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            self_employed:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          };

          return status ? (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                statusColors[status as keyof typeof statusColors]
              )}
            >
              {status.replace("_", " ")}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: "skillStatus",
        header: "Skill Status",
        cell: ({ row }) => {
          const status = row.original.skillStatus;
          const statusColors = {
            participation:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            completion:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            certification:
              "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
          };

          return (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                statusColors[status as keyof typeof statusColors]
              )}
            >
              {status}
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Link href={`/dashboard/participants/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={participants}
      showToolbar={true}
      showPagination={participants.length > 10}
      pageSize={10}
      filterColumn="participantName"
      filterPlaceholder="Search participants..."
      isLoading={isLoading}
      loadingText="Loading participants..."
    />
  );
}
