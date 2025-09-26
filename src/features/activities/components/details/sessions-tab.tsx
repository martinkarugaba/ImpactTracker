"use client";

import { useAtom } from "jotai";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  useActivitySessions,
  useGenerateActivitySessions,
  useSessionAttendance,
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

export function SessionsTab({
  activity,
  onManageAttendance,
  onCreateSession,
  onEditSession: _onEditSession,
}: SessionsTabProps) {
  const [_deletingSessionId, _setDeletingSessionId] = useAtom(
    deletingSessionIdAtom
  );
  const [sessionCount, setSessionCount] = useState<number>(5);

  const { data: sessions, isLoading } = useActivitySessions(activity.id);
  const generateSessions = useGenerateActivitySessions();

  const sessionsData = sessions?.data || [];

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
          return <div className="text-center">{session.session_number}</div>;
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
          return (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageAttendance(session.id)}
              >
                <UserCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement session deletion
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Sessions</h3>
          <p className="text-muted-foreground text-sm">
            Manage individual sessions for this multi-day activity
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {(!sessionsData || sessionsData.length === 0) && (
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="sessionCount" className="text-sm font-medium">
                  Number of Sessions
                </Label>
                <Input
                  id="sessionCount"
                  type="number"
                  min="1"
                  max="50"
                  value={sessionCount}
                  onChange={e => setSessionCount(parseInt(e.target.value) || 1)}
                  className="w-24"
                  placeholder="5"
                />
              </div>
              <Button
                onClick={handleGenerateSessions}
                disabled={generateSessions.isPending || sessionCount < 1}
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
      </div>

      {/* Sessions Overview Cards */}
      {sessionsData && sessionsData.length > 0 && (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
          <MetricCard
            title="Total Sessions"
            value={sessionsData.length}
            icon={<Calendar className="h-4 w-4" />}
            footer={{
              title: "Session count",
              description: "Total sessions planned",
            }}
          />
          <MetricCard
            title="Completed"
            value={sessionsData.filter(s => s.status === "completed").length}
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            footer={{
              title: "Finished sessions",
              description: "Successfully completed",
            }}
          />
          <MetricCard
            title="Scheduled"
            value={sessionsData.filter(s => s.status === "scheduled").length}
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            footer={{
              title: "Upcoming sessions",
              description: "Ready to conduct",
            }}
          />
          <MetricCard
            title="Cancelled"
            value={sessionsData.filter(s => s.status === "cancelled").length}
            icon={<XCircle className="h-4 w-4 text-red-600" />}
            footer={{
              title: "Cancelled sessions",
              description: "Not conducted",
            }}
          />
        </div>
      )}

      {/* Sessions Table */}
      {sessionsData && sessionsData.length > 0 ? (
        <DataTable
          columns={getSessionsColumns()}
          data={sessionsData as SessionData[]}
          filterColumn="session_number"
          filterPlaceholder="Search sessions..."
          showColumnToggle={true}
          showPagination={true}
          showRowSelection={true}
          pageSize={10}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
