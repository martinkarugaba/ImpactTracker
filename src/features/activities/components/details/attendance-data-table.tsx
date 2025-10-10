"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { Edit } from "lucide-react";
import type { ActivityParticipant } from "../../types/types";

interface AttendanceDataTableProps {
  sessionAttendance: ActivityParticipant[];
  isLoading?: boolean;
  onEditParticipant?: (participant: ActivityParticipant) => void;
}

export function AttendanceDataTable({
  sessionAttendance,
  isLoading = false,
  onEditParticipant,
}: AttendanceDataTableProps) {
  const columns = useMemo<ColumnDef<ActivityParticipant>[]>(
    () => [
      {
        accessorKey: "participant.firstName",
        header: "Name",
        cell: ({ row }) => {
          const participant = row.original.participant;
          return (
            <div className="space-y-1">
              <div className="font-medium">
                {participant
                  ? `${participant.firstName} ${participant.lastName}`
                  : "Unknown Participant"}
              </div>
              {participant?.designation && (
                <div className="text-muted-foreground text-xs">
                  {participant.designation}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "participant.contact",
        header: "Contact",
        cell: ({ row }) => {
          const contact = row.original.participant?.contact;
          // Format phone number with leading zero
          const formattedContact = contact
            ? contact.startsWith("0")
              ? contact
              : `0${contact}`
            : null;
          return (
            <div className="text-sm">
              {formattedContact || (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "participant.sex",
        header: "Sex",
        cell: ({ row }) => {
          const sex = row.original.participant?.sex;
          return (
            <span className="text-sm capitalize">
              {sex || <span className="text-muted-foreground">-</span>}
            </span>
          );
        },
      },
      {
        accessorKey: "participant.age",
        header: "Age",
        cell: ({ row }) => {
          const age = row.original.participant?.age;
          return (
            <span className="text-sm">
              {age || <span className="text-muted-foreground">-</span>}
            </span>
          );
        },
      },
      {
        accessorKey: "participant.district",
        header: "District",
        cell: ({ row }) => {
          const district = row.original.participant?.district;
          return (
            <div>
              {district ? (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                >
                  📍 {district}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "participant.subCounty",
        header: "Subcounty",
        cell: ({ row }) => {
          const subCounty = row.original.participant?.subCounty;
          return (
            <div>
              {subCounty ? (
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
                >
                  {subCounty}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "attendance_status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.attendance_status;
          return (
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                status === "attended" &&
                  "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300",
                status === "absent" &&
                  "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300",
                status === "late" &&
                  "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
              )}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditParticipant?.(row.original)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit participant</span>
            </Button>
          );
        },
      },
    ],
    [onEditParticipant]
  );

  return (
    <DataTable
      columns={columns}
      data={sessionAttendance}
      showToolbar={false}
      showPagination={sessionAttendance.length > 10}
      pageSize={10}
      isLoading={isLoading}
      loadingText="Loading attendance records..."
    />
  );
}
