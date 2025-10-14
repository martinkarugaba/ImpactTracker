"use client";

import { useMemo, useState, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
// helper not needed here
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DailyAttendance } from "../../types/types";
import {
  bulkDeleteDailyAttendance,
  deleteAttendanceRecord,
} from "../../actions/attendance";
import { useMarkAttendance } from "../../hooks/use-activities";
import { DAILY_ATTENDANCE_STATUSES } from "../../types/types";

interface AttendanceDataTableProps {
  sessionAttendance: DailyAttendance[];
  isLoading?: boolean;
  onParticipantsDeleted?: () => void;
  onStatusChange?: (args: {
    attendanceId: string;
    sessionId: string;
    participantId: string;
    status: string;
  }) => Promise<void>;
}

export function AttendanceDataTable({
  sessionAttendance,
  isLoading = false,
  onParticipantsDeleted,
}: AttendanceDataTableProps) {
  const markAttendanceMutation = useMarkAttendance();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(new Set(sessionAttendance.map(p => p.id)));
      } else {
        setSelectedRows(new Set());
      }
    },
    [sessionAttendance]
  );

  // Handle individual row selection
  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }, []);

  // Handle single delete
  const handleDeleteSingle = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true);
        const result = await deleteAttendanceRecord(id);
        if (result.success) {
          toast.success("Participant removed from session");
          onParticipantsDeleted?.();
        } else {
          toast.error(result.error || "Failed to remove participant");
        }
      } catch (_error) {
        toast.error("Failed to remove participant");
      } finally {
        setIsDeleting(false);
      }
    },
    [onParticipantsDeleted]
  );

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      toast.error("No participants selected");
      return;
    }

    try {
      setIsDeleting(true);
      const result = await bulkDeleteDailyAttendance(Array.from(selectedRows));
      if (result.success) {
        toast.success("Participants removed successfully");
        setSelectedRows(new Set());
        onParticipantsDeleted?.();
      } else {
        toast.error(result.error || "Failed to remove participants");
      }
    } catch (_error) {
      toast.error("Failed to remove participants");
    } finally {
      setIsDeleting(false);
    }
  };
  const columns = useMemo<ColumnDef<DailyAttendance>[]>(
    () => [
      {
        id: "select",
        header: ({ table: _table }) => (
          <Checkbox
            checked={
              selectedRows.size === sessionAttendance.length &&
              sessionAttendance.length > 0
            }
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.has(row.original.id)}
            onCheckedChange={checked =>
              handleSelectRow(row.original.id, checked as boolean)
            }
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
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
        accessorKey: "participant.dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => {
          const dob = row.original.participant?.dateOfBirth;
          return (
            <span className="text-sm">
              {dob ? (
                new Date(dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "participant.employmentStatus",
        header: "Employment",
        cell: ({ row }) => {
          const status = row.original.participant?.employmentStatus;
          return (
            <div>
              {status ? (
                <Badge
                  variant="outline"
                  className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  {status.replace("_", " ")}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "participant.enterprise",
        header: "Enterprise",
        cell: ({ row }) => {
          const enterprise = row.original.participant?.enterprise;
          return (
            <span className="text-sm">
              {enterprise || <span className="text-muted-foreground">-</span>}
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
          const current =
            // prefer optimistic override while updating
            updatingId === row.original.id && markAttendanceMutation.variables
              ? markAttendanceMutation.variables.attendanceData
                  .attendance_status
              : status;

          return (
            <div>
              <Select
                value={current}
                onValueChange={async value => {
                  // optimistic UI
                  setUpdatingId(row.original.id);
                  try {
                    await markAttendanceMutation.mutateAsync({
                      sessionId: row.original.session_id,
                      participantId: row.original.participant_id,
                      attendanceData: {
                        attendance_status:
                          value as (typeof DAILY_ATTENDANCE_STATUSES)[number],
                      },
                    });
                    toast.success("Attendance status updated");
                  } catch (_err) {
                    toast.error("Failed to update status");
                  } finally {
                    setUpdatingId(null);
                  }
                }}
                disabled={updatingId !== null && updatingId !== row.original.id}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={current} />
                </SelectTrigger>
                <SelectContent side="top">
                  {DAILY_ATTENDANCE_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSingle(row.original.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove participant</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [
      selectedRows,
      sessionAttendance.length,
      isDeleting,
      handleSelectAll,
      handleSelectRow,
      handleDeleteSingle,
      markAttendanceMutation,
      updatingId,
    ]
  );

  return (
    <div className="space-y-4">
      {/* Fixed height container to prevent CLS */}
      <div className="min-h-[72px]">
        {selectedRows.size > 0 && (
          <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={true}
                onCheckedChange={() => setSelectedRows(new Set())}
              />
              <span className="text-sm font-medium">
                {selectedRows.size} participant(s) selected
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Selected
            </Button>
          </div>
        )}
      </div>
      <DataTable
        columns={columns}
        data={sessionAttendance}
        showToolbar={false}
        showPagination={sessionAttendance.length > 10}
        pageSize={10}
        isLoading={isLoading || isDeleting}
        loadingText={
          isDeleting
            ? "Removing participants..."
            : "Loading attendance records..."
        }
      />
    </div>
  );
}
