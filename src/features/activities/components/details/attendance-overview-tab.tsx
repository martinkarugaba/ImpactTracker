import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { DailyAttendance } from "../../types/types";
import type { ColumnDef } from "@tanstack/react-table";

const attendanceColumns: ColumnDef<DailyAttendance, unknown>[] = [
  {
    accessorKey: "participantName",
    header: "Name",
  },
  {
    accessorKey: "participant",
    header: "Contact",
    cell: ({ row }) => row.original.participant?.contact ?? "N/A",
  },
  {
    accessorKey: "attendance_status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.attendance_status}
      </Badge>
    ),
  },
];

export function AttendanceOverviewTab({
  allAttendance,
  isLoading = false,
}: {
  allAttendance: DailyAttendance[];
  isLoading?: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Attendance Overview</h3>
      <DataTable
        columns={attendanceColumns}
        data={allAttendance}
        showToolbar={false}
        showPagination={true}
        pageSize={10}
        filterColumn="participantName"
        filterPlaceholder="Filter by name..."
        isLoading={isLoading}
        loadingText="Loading attendance data..."
      />
    </div>
  );
}
