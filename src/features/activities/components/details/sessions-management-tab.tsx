"use client";

import { useMemo, useState, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Copy,
  Trash2,
  UserCheck,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import type { ActivitySession, DailyAttendance } from "../../types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionsManagementTabProps {
  sessions: ActivitySession[];
  attendanceBySession: Record<string, DailyAttendance[]>;
  onEditSession: (sessionId: string) => void;
  onManageAttendance: (sessionId?: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSessionStatus: (sessionId: string, status: string) => void;
  onDuplicateSession?: (sessionId: string) => void;
  isLoading?: boolean;
}

export function SessionsManagementTab({
  sessions,
  attendanceBySession,
  onEditSession,
  onManageAttendance,
  onDeleteSession,
  onUpdateSessionStatus,
  onDuplicateSession,
  isLoading = false,
}: SessionsManagementTabProps) {
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      setDeletingSessionId(sessionId);
      try {
        await onDeleteSession(sessionId);
      } finally {
        setDeletingSessionId(null);
      }
    },
    [onDeleteSession]
  );

  const columns = useMemo<ColumnDef<ActivitySession>[]>(
    () => [
      {
        accessorKey: "session_number",
        header: "#",
        cell: ({ row }) => (
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
            {row.original.session_number}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "title",
        header: "Session Title",
        cell: ({ row }) => (
          <div className="min-w-[200px] space-y-1">
            <div className="font-medium">
              {row.original.title || `Session ${row.original.session_number}`}
            </div>
            {row.original.notes && (
              <div className="text-muted-foreground line-clamp-1 text-xs">
                {row.original.notes}
              </div>
            )}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "session_date",
        header: "Date",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">
              {row.original.session_date
                ? format(new Date(row.original.session_date), "MMM dd, yyyy")
                : "-"}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "start_time",
        header: "Time",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">
              {row.original.start_time
                ? `${row.original.start_time}${row.original.end_time ? ` - ${row.original.end_time}` : ""}`
                : "-"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors = {
            scheduled:
              "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300",
            completed:
              "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-300",
            cancelled:
              "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-300",
            in_progress:
              "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          };

          return (
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                statusColors[status as keyof typeof statusColors] ||
                  statusColors.scheduled
              )}
            >
              {status.replace("_", " ")}
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "attendance",
        header: "Attendance",
        cell: ({ row }) => {
          const attendance = attendanceBySession[row.original.id] || [];
          const attended = attendance.filter(
            a => a.attendance_status === "attended"
          ).length;
          const total = attendance.length;
          const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

          return (
            <div className="flex items-center gap-2">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">
                {attended}/{total}
              </span>
              {total > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    rate >= 75
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                      : rate >= 50
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                  )}
                >
                  {rate}%
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageAttendance(session.id)}
                className="h-8"
              >
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                Take Attendance
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => onEditSession(session.id)}
                    className="text-blue-600 focus:text-blue-700 dark:text-blue-400"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Session
                  </DropdownMenuItem>
                  {onDuplicateSession && (
                    <DropdownMenuItem
                      onClick={() => onDuplicateSession(session.id)}
                      className="text-purple-600 focus:text-purple-700 dark:text-purple-400"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate Session
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSessionStatus(session.id, "completed")
                    }
                    disabled={session.status === "completed"}
                    className="text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deletingSessionId === session.id}
                    className="text-red-600 focus:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      attendanceBySession,
      deletingSessionId,
      onEditSession,
      onManageAttendance,
      onDuplicateSession,
      onUpdateSessionStatus,
      handleDeleteSession,
    ]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Sessions Management</h3>
        <p className="text-muted-foreground text-sm">
          Manage all activity sessions and take attendance in one place
        </p>
      </div>

      <DataTable
        columns={columns}
        data={sessions}
        showToolbar={true}
        showPagination={sessions.length > 10}
        pageSize={10}
        filterColumn="title"
        filterPlaceholder="Search sessions..."
        isLoading={isLoading}
        loadingText="Loading sessions..."
      />

      {sessions.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Calendar className="text-muted-foreground/50 h-12 w-12" />
          <h4 className="mt-4 text-lg font-semibold">No sessions found</h4>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Create sessions to start managing attendance
          </p>
        </div>
      )}
    </div>
  );
}
