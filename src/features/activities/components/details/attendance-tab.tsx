"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { deletingSessionIdAtom } from "../../atoms/activities-atoms";
import {
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  Plus,
  Play,
  XCircle,
  UserCheck,
  Trash2,
  Edit,
  UserPlus,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Activity, SessionStatus } from "../../types/types";
import {
  useActivityParticipants,
  useActivitySessions,
  useGenerateActivitySessions,
  useSessionAttendance,
  useUpdateActivitySession,
} from "../../hooks/use-activities";
import { createParticipantsTableColumns } from "./participants-table-columns";

interface AttendanceTabProps {
  activity: Activity;
  onManageAttendance: (sessionId?: string) => void;
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
  const { data: attendance } = useSessionAttendance(sessionId);

  if (!attendance?.data || attendance.data.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center">
        <Users className="mr-1 h-4 w-4" />
        <span>0 attended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Users className="mr-1 h-4 w-4" />
      <span className="font-medium">{attendance.data.length}</span>
      <span className="text-muted-foreground ml-1">attended</span>
    </div>
  );
}

export function AttendanceTab({
  activity,
  onManageAttendance,
  onCreateSession,
  onEditSession,
}: AttendanceTabProps) {
  const [_deletingSessionId, _setDeletingSessionId] = useAtom(
    deletingSessionIdAtom
  );
  const [sessionCount, setSessionCount] = useState<number>(5);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("all");

  // Hook for updating session status
  const updateSession = useUpdateActivitySession();

  // Fetch activity participants and sessions
  const {
    data: participantsResponse,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useActivityParticipants(activity.id);

  const { data: sessionsResponse, isLoading: isLoadingSessions } =
    useActivitySessions(activity.id);

  // Fetch session-specific attendance when a session is selected
  const {
    data: sessionAttendanceResponse,
    isLoading: isLoadingSessionAttendance,
  } = useSessionAttendance(
    selectedSessionId !== "all" ? selectedSessionId : ""
  );

  const generateSessions = useGenerateActivitySessions();

  const allParticipants = participantsResponse?.success
    ? participantsResponse.data || []
    : [];

  const sessions = sessionsResponse?.data || [];

  // Determine which participants to show based on selected session
  const participants =
    selectedSessionId === "all"
      ? allParticipants
      : sessionAttendanceResponse?.success && sessionAttendanceResponse.data
        ? sessionAttendanceResponse.data
            .map(attendance => {
              const baseParticipant = allParticipants.find(
                p => p.participant_id === attendance.participant_id
              );

              // If we have a base participant, use it with session-specific data
              if (baseParticipant) {
                return {
                  ...baseParticipant,
                  // Override attendance status with session-specific data
                  attendance_status: attendance.attendance_status,
                  // Add session-specific metadata
                  session_attendance: attendance,
                };
              }

              // If no base participant found, create a minimal participant record from attendance data
              // This handles participants added directly to sessions
              return {
                id: `session-${attendance.id}`, // Unique ID for session-specific participant
                activity_id: activity.id,
                participant_id: attendance.participant_id,
                participantName:
                  attendance.participant?.firstName &&
                  attendance.participant?.lastName
                    ? `${attendance.participant.firstName} ${attendance.participant.lastName}`
                    : "Unknown Participant",
                participantEmail: attendance.participant?.contact || "",
                role: "participant",
                attendance_status: attendance.attendance_status,
                feedback: null,
                created_at: attendance.created_at,
                updated_at: attendance.updated_at,
                // Add session-specific metadata
                session_attendance: attendance,
                // Add participant details if available
                participant: attendance.participant,
              };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null) // Type-safe filter
        : allParticipants;

  // Basic attendance stats
  const stats = {
    total: participants.length,
    attended: participants.filter(p => p.attendance_status === "attended")
      .length,
    absent: participants.filter(p => p.attendance_status === "absent").length,
    pending: participants.filter(p => p.attendance_status === "pending").length,
  };

  const attendanceRate =
    stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;

  // Create columns for sessions table
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
          return <div className="text-center">{session.session_number}</div>;
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
                <span className="font-medium">{session.title}</span>
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
            <div>
              {session.session_date
                ? format(new Date(session.session_date), "MMM dd, yyyy")
                : "Not scheduled"}
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
            scheduled: { label: "Scheduled", variant: "secondary" as const },
            completed: { label: "Completed", variant: "default" as const },
            cancelled: { label: "Cancelled", variant: "destructive" as const },
            postponed: { label: "Postponed", variant: "outline" as const },
          };
          const config = statusConfig[status] || statusConfig.scheduled;

          return <Badge variant={config.variant}>{config.label}</Badge>;
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
              await updateSession.mutateAsync({
                id: session.id,
                data: { status: "completed" },
              });
              toast.success("Session marked as completed");
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
                  onClick={() => {
                    // TODO: Implement session deletion
                  }}
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

  // Create columns for participants table
  const participantColumns = createParticipantsTableColumns();

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

  if (isLoadingParticipants || isLoadingSessions) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sessions and Attendance Management Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="w-fit">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Sessions Management</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Attendance Tracking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-6">
          {/* Sessions Overview Metrics */}
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card mb-6 grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2">
            <MetricCard
              title="Sessions Planned"
              value={sessions.length}
              description="Total activity sessions scheduled"
              icon={<Calendar className="h-4 w-4" />}
              footer={{
                title: "Multi-Day Activity",
                description: `${sessions.filter(s => s.status === "scheduled").length} upcoming`,
              }}
            />
            <MetricCard
              title="Sessions Completed"
              value={sessions.filter(s => s.status === "completed").length}
              description="Sessions that have been conducted"
              icon={<CheckCircle className="h-4 w-4" />}
              footer={{
                title: "Progress",
                description: `${Math.round((sessions.filter(s => s.status === "completed").length / Math.max(sessions.length, 1)) * 100)}% complete`,
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sessions Management
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  {(!sessions || sessions.length === 0) && (
                    <div className="flex items-end gap-2">
                      <div className="space-y-1">
                        <Label
                          htmlFor="sessionCount"
                          className="text-sm font-medium"
                        >
                          Number of Sessions
                        </Label>
                        <Input
                          id="sessionCount"
                          type="number"
                          min="1"
                          max="50"
                          value={sessionCount}
                          onChange={e =>
                            setSessionCount(parseInt(e.target.value) || 1)
                          }
                          className="w-24"
                          placeholder="5"
                        />
                      </div>
                      <Button
                        onClick={handleGenerateSessions}
                        disabled={
                          generateSessions.isPending || sessionCount < 1
                        }
                        variant="outline"
                      >
                        {generateSessions.isPending ? (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Generate {sessionCount} Sessions
                      </Button>
                    </div>
                  )}
                  <Button onClick={onCreateSession}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Session
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-6">
                  {/* Session Metrics */}
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
                      value={
                        sessions.filter(s => s.status === "completed").length
                      }
                      icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                      footer={{
                        title: "Finished sessions",
                        description: "Successfully completed",
                      }}
                    />
                    <MetricCard
                      title="Scheduled"
                      value={
                        sessions.filter(s => s.status === "scheduled").length
                      }
                      icon={<Clock className="h-4 w-4 text-blue-600" />}
                      footer={{
                        title: "Upcoming sessions",
                        description: "Ready to conduct",
                      }}
                    />
                    <MetricCard
                      title="Cancelled"
                      value={
                        sessions.filter(s => s.status === "cancelled").length
                      }
                      icon={<XCircle className="h-4 w-4 text-red-600" />}
                      footer={{
                        title: "Cancelled sessions",
                        description: "Not conducted",
                      }}
                    />
                  </div>

                  {/* Sessions Table */}
                  <DataTable
                    columns={getSessionsColumns()}
                    data={sessions as SessionData[]}
                    filterColumn="session_number"
                    filterPlaceholder="Search sessions..."
                    showColumnToggle={true}
                    showPagination={true}
                    showRowSelection={true}
                    pageSize={10}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="text-muted-foreground/50 h-12 w-12" />
                  <h4 className="mt-4 text-lg font-semibold">
                    No sessions found
                  </h4>
                  <p className="text-muted-foreground mt-2 text-center text-sm">
                    This activity doesn&apos;t have any sessions yet. Create
                    sessions to track daily attendance for your multi-day
                    activity.
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
                        onChange={e =>
                          setSessionCount(parseInt(e.target.value) || 1)
                        }
                        className="w-20"
                        placeholder="5"
                      />
                      <Button
                        onClick={handleGenerateSessions}
                        disabled={
                          generateSessions.isPending || sessionCount < 1
                        }
                        variant="outline"
                      >
                        {generateSessions.isPending ? (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          {/* Attendance Overview Metrics */}
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card mb-6 grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2">
            <MetricCard
              title="Total Participants"
              value={stats.total}
              description="All registered participants for this activity"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Overall Attendance Rate"
              value={`${attendanceRate}%`}
              description="Average attendance across all sessions"
              icon={<TrendingUp className="h-4 w-4" />}
              footer={{
                title: "Participation",
                description: `${stats.attended}/${stats.total} participants`,
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Attendance Tracking
                </div>
                <div className="flex items-center gap-3">
                  {/* Session Filter */}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="session-filter"
                      className="text-sm font-medium"
                    >
                      Filter by Session:
                    </Label>
                    <Select
                      value={selectedSessionId}
                      onValueChange={setSelectedSessionId}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select session..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        {sessions.map(session => (
                          <SelectItem key={session.id} value={session.id}>
                            Session {session.session_number} -{" "}
                            {session.session_date
                              ? format(new Date(session.session_date), "MMM dd")
                              : "Not scheduled"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Participant Management Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        onManageAttendance(
                          selectedSessionId !== "all"
                            ? selectedSessionId
                            : undefined
                        )
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {selectedSessionId !== "all"
                        ? "Add to Session"
                        : "Manage Participants"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participantsError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Failed to load participants. Please try again.
                  </p>
                </div>
              ) : participants.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                  <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No participants yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add participants to this activity to track their attendance.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() =>
                        onManageAttendance(
                          selectedSessionId !== "all"
                            ? selectedSessionId
                            : undefined
                        )
                      }
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {selectedSessionId !== "all"
                        ? "Add to Session"
                        : "Add Participants"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Attendance Summary for Selected Session */}
                  {selectedSessionId !== "all" && (
                    <div className="bg-muted/20 rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">
                        Session{" "}
                        {
                          sessions.find(s => s.id === selectedSessionId)
                            ?.session_number
                        }{" "}
                        Attendance Summary
                        {isLoadingSessionAttendance && (
                          <LoadingSpinner className="ml-2 inline-block h-4 w-4" />
                        )}
                      </h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-medium text-green-600">
                            {isLoadingSessionAttendance
                              ? "..."
                              : sessionAttendanceResponse?.data?.filter(
                                  a => a.attendance_status === "attended"
                                ).length || 0}
                          </div>
                          <div className="text-muted-foreground">Attended</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-red-600">
                            {isLoadingSessionAttendance
                              ? "..."
                              : sessionAttendanceResponse?.data?.filter(
                                  a => a.attendance_status === "absent"
                                ).length || 0}
                          </div>
                          <div className="text-muted-foreground">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-yellow-600">
                            {isLoadingSessionAttendance
                              ? "..."
                              : sessionAttendanceResponse?.data?.filter(
                                  a => a.attendance_status === "late"
                                ).length || 0}
                          </div>
                          <div className="text-muted-foreground">Late</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-blue-600">
                            {isLoadingSessionAttendance
                              ? "..."
                              : sessionAttendanceResponse?.data?.length || 0}
                          </div>
                          <div className="text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Participants/Attendance Table */}
                  <DataTable
                    columns={participantColumns}
                    data={participants}
                    filterColumn="participantName"
                    filterPlaceholder="Search participants..."
                    showColumnToggle={true}
                    showPagination={participants.length > 10}
                    pageSize={10}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
