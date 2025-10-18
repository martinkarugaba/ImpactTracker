"use client";

import { useAtom } from "jotai";
import { useState, useMemo, useEffect } from "react";
import { deletingSessionIdAtom } from "../../atoms/activities-atoms";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  Trash2,
  Edit,
  MoreHorizontal,
  Check,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useActivitySessions,
  useGenerateActivitySessions,
  useSessionAttendance,
  useUpdateActivitySession,
  useDeleteActivitySession,
} from "../../hooks/use-activities";
import type { Activity, SessionStatus } from "../../types/types";

interface SessionsTabProps {
  activity: Activity;
  onManageAttendance: (sessionId: string) => void;
  onCreateSession: () => void;
  onEditSession: (sessionId: string) => void;
}

interface SessionData {
  id: string;
  session_number: number;
  title: string | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  notes: string | null;
  status: SessionStatus;
  created_at: string | null;
  updated_at: string | null;
}

// Attendance display component to avoid React Hook usage in columns
function AttendanceCell({ sessionId }: { sessionId: string }) {
  const { data: attendance, isLoading } = useSessionAttendance(sessionId);

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!attendance?.data || attendance.data.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-400" />
        <span className="text-sm">0 attended</span>
      </div>
    );
  }

  // Count all participants registered for the session (any status)
  const attendedCount = attendance.data.length;

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <span className="font-medium text-purple-700 dark:text-purple-300">
        {attendedCount}
      </span>
      <span className="text-muted-foreground text-sm">attended</span>
    </div>
  );
}

export function SessionsTab({
  activity,
  onManageAttendance,
  onCreateSession,
  onEditSession,
}: SessionsTabProps) {
  const [_deletingSessionId, _setDeletingSessionId] = useAtom(
    deletingSessionIdAtom
  );
  const [sessionCount, setSessionCount] = useState<number>(5);

  const {
    data: sessionsResponse,
    isLoading,
    error,
  } = useActivitySessions(activity.id);

  // Memoize sessions data
  const sessions = useMemo(() => {
    return sessionsResponse?.data || [];
  }, [sessionsResponse]);

  // Log sessions when the tab is accessed
  useEffect(() => {
    console.log("Sessions for activity:", activity.id, sessions);
  }, [activity.id, sessions]);

  // Hook for generating new sessions
  const generateSessions = useGenerateActivitySessions();
  // Hook for updating session status
  const updateSession = useUpdateActivitySession();
  const deleteSession = useDeleteActivitySession();

  console.log("SessionsTab - sessionsResponse:", sessionsResponse);

  if (isLoading) {
    console.log("Loading sessions for activity:", activity.id);
    return <div>Loading sessions...</div>;
  }

  if (error) {
    console.error("Error loading sessions for activity:", activity.id, error);
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load sessions.
          </p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    console.log("No sessions available for activity:", activity.id);
    return <div>No sessions available.</div>;
  }

  console.log("Rendering sessions table for activity:", activity.id, sessions);

  const handleDeleteSession = async (sessionId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this session? This action cannot be undone and will also delete all attendance records for this session."
      )
    ) {
      try {
        const result = await deleteSession.mutateAsync({ sessionId });
        if (result.success) {
          toast.success("Session deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete session");
        }
      } catch (error) {
        console.error("Error deleting session:", error);
        toast.error("Failed to delete session");
      }
    }
  };

  // Create columns for DataTable
  const getSessionsColumns = (): ColumnDef<SessionData>[] => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "session_number",
        header: "Session #",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="flex items-center justify-center">
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              >
                #{session.session_number}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="max-w-xs">
              {session.title ? (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {session.title}
                </span>
              ) : (
                <span className="text-muted-foreground italic">
                  Session {session.session_number}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "session_date",
        header: "Session Date",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">
                {session.session_date
                  ? format(new Date(session.session_date), "MMM dd, yyyy")
                  : "Not scheduled"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "venue",
        header: "Venue",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="max-w-xs">
              {session.venue ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">{session.venue}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground text-sm italic">
                    No venue set
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const session = row.original;
          const status = session.status || "scheduled";
          const statusConfig = {
            scheduled: {
              label: "Scheduled",
              className:
                "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
            },
            completed: {
              label: "Completed",
              className:
                "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
            },
            cancelled: {
              label: "Cancelled",
              className:
                "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
            },
            postponed: {
              label: "Postponed",
              className:
                "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
            },
          };
          const config = statusConfig[status] || statusConfig.scheduled;

          return (
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "attendance",
        header: "Attendance",
        cell: ({ row }) => {
          const session = row.original;
          return <AttendanceCell sessionId={session.id} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const session = row.original;

          const handleMarkComplete = async () => {
            try {
              // First mark all participants in this session as attended
              const { bulkMarkAttendance, getSessionAttendance } = await import(
                "../../actions/attendance"
              );

              // Get current attendance for this session
              const attendanceResult = await getSessionAttendance(session.id);

              if (
                attendanceResult.success &&
                attendanceResult.data &&
                attendanceResult.data.length > 0
              ) {
                const attendanceUpdates = attendanceResult.data.map(record => ({
                  participant_id: record.participant_id,
                  attendance_status: "attended" as const,
                  recorded_by: "system",
                }));

                await bulkMarkAttendance(session.id, attendanceUpdates);
              }

              // Then mark the session as completed
              await updateSession.mutateAsync({
                id: session.id,
                data: { status: "completed" },
              });
              toast.success(
                "Session marked as completed and all participants marked as attended"
              );
            } catch (_error) {
              toast.error("Failed to update session status");
            }
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditSession(session.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Session
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onManageAttendance(session.id)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Manage Attendance
                </DropdownMenuItem>
                {session.status !== "completed" && (
                  <DropdownMenuItem onClick={handleMarkComplete}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteSession(session.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
      },
    ];
  };

  const handleGenerateSessions = async () => {
    if (sessionCount < 1 || sessionCount > 50) {
      toast.error("Please enter a valid number of sessions (1-50)");
      return;
    }

    try {
      const result = await generateSessions.mutateAsync({
        activityId: activity.id,
        sessionCount,
        sessionData: {
          venue: activity.venue || "",
        },
      });

      if (result.success) {
        toast.success(`${sessionCount} sessions generated successfully`);
      } else {
        toast.error(result.error || "Failed to generate sessions");
      }
    } catch (_error) {
      toast.error("Failed to generate sessions");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sessions Overview Cards */}
      {sessions && sessions.length > 0 && (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
          <MetricCard
            title="Total Sessions"
            value={sessions.length}
            icon={<Calendar className="h-4 w-4" />}
            footer={{
              title: "Session count",
              description: "Total sessions planned",
            }}
          />
          <MetricCard
            title="Completed"
            value={sessions.filter(s => s.status === "completed").length}
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            footer={{
              title: "Finished sessions",
              description: "Successfully completed",
            }}
          />
          <MetricCard
            title="Scheduled"
            value={sessions.filter(s => s.status === "scheduled").length}
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            footer={{
              title: "Upcoming sessions",
              description: "Ready to conduct",
            }}
          />
          <MetricCard
            title="Cancelled"
            value={sessions.filter(s => s.status === "cancelled").length}
            icon={<XCircle className="h-4 w-4 text-red-600" />}
            footer={{
              title: "Cancelled sessions",
              description: "Not conducted",
            }}
          />
        </div>
      )}

      {/* Sessions Table */}
      {sessions && sessions.length > 0 ? (
        <DataTable
          columns={getSessionsColumns()}
          data={sessions as SessionData[]}
          filterColumn="session_number"
          filterPlaceholder="Search sessions..."
          showColumnToggle={true}
          showPagination={true}
          showRowSelection={true}
          pageSize={10}
          actionButtons={
            <Button onClick={onCreateSession} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Session
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-muted-foreground/50 h-12 w-12" />
            <h4 className="mt-4 text-lg font-semibold">No sessions found</h4>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              This activity doesn&apos;t have any sessions yet. Create sessions
              to track daily attendance for your multi-day activity.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="sessionCountEmpty"
                  className="text-sm font-medium"
                >
                  Sessions:
                </Label>
                <Input
                  id="sessionCountEmpty"
                  type="number"
                  min="1"
                  max="50"
                  value={sessionCount}
                  onChange={e => setSessionCount(parseInt(e.target.value) || 1)}
                  className="w-20"
                  placeholder="5"
                />
                <Button
                  onClick={handleGenerateSessions}
                  disabled={generateSessions.isPending || sessionCount < 1}
                  variant="outline"
                >
                  {generateSessions.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
              <Button onClick={onCreateSession}>
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
