"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// helper not needed here
import {
  Trash2,
  ChevronDown,
  Phone,
  Users,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import type { DailyAttendance } from "../../types/types";
import {
  bulkDeleteDailyAttendance,
  deleteAttendanceRecord,
} from "../../actions/attendance";
import { useMarkAttendance } from "../../hooks/use-activities";
import { DAILY_ATTENDANCE_STATUSES } from "../../types/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocationCache } from "@/features/locations/hooks/use-location-cache";

// Separate component for Subcounty cell to properly use hooks
function SubcountyCell({ subCounty }: { subCounty?: string }) {
  const { getSubCountyNamesByCodes } = useLocationCache();
  const [displayName, setDisplayName] = useState<string>(subCounty || "-");

  useEffect(() => {
    if (subCounty && !subCounty.includes(" ")) {
      // It's a code, convert it to name
      getSubCountyNamesByCodes([subCounty]).then(names => {
        setDisplayName(names[subCounty] || subCounty);
      });
    } else {
      setDisplayName(subCounty || "-");
    }
  }, [subCounty, getSubCountyNamesByCodes]);

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      <div>
        {displayName !== "-" ? (
          <Badge
            variant="outline"
            className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
          >
            {displayName}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>
    </div>
  );
}

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
  onEditParticipant?: (participant: DailyAttendance["participant"]) => void;
  // Additional action buttons to show alongside bulk actions
  additionalActionButtons?: React.ReactNode;
}

// Helper function to get badge styling for attendance status
const getAttendanceStatusBadge = (status: string) => {
  switch (status) {
    case "attended":
      return {
        variant: "default" as const,
        className:
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800",
      };
    case "absent":
      return {
        variant: "destructive" as const,
        className:
          "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800",
      };
    case "late":
      return {
        variant: "secondary" as const,
        className:
          "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800",
      };
    case "excused":
      return {
        variant: "outline" as const,
        className:
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800",
      };
    case "invited":
    default:
      return {
        variant: "outline" as const,
        className:
          "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800",
      };
  }
};

export function AttendanceDataTable({
  sessionAttendance,
  isLoading = false,
  onParticipantsDeleted,
  onEditParticipant,
  additionalActionButtons,
}: AttendanceDataTableProps) {
  const markAttendanceMutation = useMarkAttendance();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  // Default column visibility - hide less critical columns on mobile
  const defaultColumnVisibility: VisibilityState = {
    "participant.dateOfBirth": false, // Hide date of birth by default
    "participant.enterprise": false, // Hide enterprise by default
    "participant.employmentStatus": false, // Hide employment by default
    "participant.age": isMobile, // Hide age on mobile
    "participant.sex": isMobile, // Hide sex on mobile
  };

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
          <div className="px-2">
            <Checkbox
              checked={
                selectedRows.size === sessionAttendance.length &&
                sessionAttendance.length > 0
              }
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-2">
            <Checkbox
              checked={selectedRows.has(row.original.id)}
              onCheckedChange={checked =>
                handleSelectRow(row.original.id, checked as boolean)
              }
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "participant.firstName",
        header: "Name",
        cell: ({ row }) => {
          const participant = row.original.participant;
          const firstName = participant?.firstName || "";
          const lastName = participant?.lastName || "";
          const initials =
            `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={`${firstName} ${lastName}`} />
                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="font-medium">
                  {participant
                    ? `${firstName} ${lastName}`
                    : "Unknown Participant"}
                </div>
                {participant?.designation && (
                  <div className="text-muted-foreground text-xs">
                    {participant.designation}
                  </div>
                )}
              </div>
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
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="max-w-32 min-w-0 truncate text-sm">
                {formattedContact || (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
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
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm capitalize">
                {sex || <span className="text-muted-foreground">-</span>}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "participant.age",
        header: "Age",
        cell: ({ row }) => {
          const age = row.original.participant?.age;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm">
                {age || <span className="text-muted-foreground">-</span>}
              </span>
            </div>
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
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
            <span className="max-w-40 min-w-0 truncate text-sm">
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
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div>
                {district ? (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  >
                    {district}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "participant.subCounty",
        header: "Subcounty",
        cell: ({ row }) => (
          <SubcountyCell
            subCounty={row.original.participant?.subCounty || undefined}
          />
        ),
      },
      {
        accessorKey: "attendance_status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.attendance_status;
          const badgeStyle = getAttendanceStatusBadge(status);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-28 sm:w-32 items-center justify-between gap-1 px-2"
                  disabled={markAttendanceMutation.isPending}
                >
                  <Badge
                    variant={badgeStyle.variant}
                    className={badgeStyle.className}
                  >
                    {status.replace("_", " ")}
                  </Badge>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-28 sm:w-32">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DAILY_ATTENDANCE_STATUSES.map(s => {
                  const itemBadgeStyle = getAttendanceStatusBadge(s);
                  return (
                    <DropdownMenuItem
                      key={s}
                      onClick={async () => {
                        try {
                          await markAttendanceMutation.mutateAsync({
                            sessionId: row.original.session_id,
                            participantId: row.original.participant_id,
                            attendanceData: {
                              attendance_status:
                                s as (typeof DAILY_ATTENDANCE_STATUSES)[number],
                            },
                          });
                          toast.success("Attendance status updated");
                        } catch (_err) {
                          toast.error("Failed to update status");
                        }
                      }}
                      className={status === s ? "bg-muted" : ""}
                      disabled={markAttendanceMutation.isPending}
                    >
                      <Badge
                        variant={itemBadgeStyle.variant}
                        className={`${itemBadgeStyle.className} mr-2`}
                      >
                        {s.replace("_", " ")}
                      </Badge>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEditParticipant?.(row.original.participant)}
                  disabled={!row.original.participant}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Participant
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteSingle(row.original.id)}
                  className="text-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove from Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      onEditParticipant,
    ]
  );

  // Table actions with bulk operations at start and session filters at end
  const tableActions = (
    <div className="flex w-full items-center justify-between gap-2 max-sm:flex-col max-sm:items-start max-sm:gap-3">
      {/* Bulk operations at start */}
      {selectedRows.size > 0 && (
        <div className="flex min-w-0 flex-shrink-0 items-center gap-2 max-sm:w-full max-sm:justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm max-sm:flex-1 max-sm:justify-center">
            <Checkbox
              checked={true}
              onCheckedChange={() => setSelectedRows(new Set())}
            />
            <span className="truncate font-medium">
              {selectedRows.size} participant(s) selected
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex-shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Remove Selected</span>
            <span className="sm:hidden">Remove</span>
          </Button>
        </div>
      )}
      {/* Session filters at end */}
      <div className="min-w-0 flex-shrink-0 ml-auto">
        {additionalActionButtons}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
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
        showColumnToggle={true}
        actionButtons={tableActions}
        columnVisibility={defaultColumnVisibility}
      />
    </div>
  );
}
