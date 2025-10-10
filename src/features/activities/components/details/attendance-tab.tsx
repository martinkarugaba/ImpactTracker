"use client";

import { useState } from "react";
import type { ActivityParticipant } from "../../types/types";
import type { Participant } from "@/features/participants/types/types";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Play,
  UserCheck,
  Edit,
  UserPlus,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Activity, ActivitySession } from "../../types/types";
import {
  useActivityParticipants,
  useActivitySessions,
  useGenerateActivitySessions,
  useDeleteActivitySession,
} from "../../hooks/use-activities";
import { EditParticipantDialog } from "@/features/participants/components/edit-participant-dialog";
import { ParticipantFeedbackDialog } from "../dialogs/participant-feedback-dialog";
import { TabLoadingSkeleton } from "./tab-loading-skeleton";
import { AttendanceDataTable } from "./attendance-data-table";

interface AttendanceTabProps {
  activity: Activity;
  onManageAttendance: (sessionId?: string) => void;
  onCreateSession: () => void;
  onEditSession: (sessionId: string) => void;
}

export function AttendanceTab({
  activity,
  onManageAttendance,
  onCreateSession,
  onEditSession,
}: AttendanceTabProps) {
  // Local state
  const [sessionCount, setSessionCount] = useState<number>(5);
  const [editingParticipant, setEditingParticipant] =
    useState<ActivityParticipant | null>(null);
  const [feedbackParticipant, setFeedbackParticipant] =
    useState<ActivityParticipant | null>(null);

  // Data fetching hooks
  const {
    data: participantsResponse,
    isLoading: isLoadingParticipants,
    refetch: refetchParticipants,
  } = useActivityParticipants(activity.id);

  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useActivitySessions(activity.id);

  // Mutations
  const generateSessions = useGenerateActivitySessions();
  const deleteSession = useDeleteActivitySession();

  // Extract data from responses
  const participants = participantsResponse?.data || [];
  const sessions = sessionsResponse?.data || [];

  // Handle feedback submission
  const handleFeedbackSubmit = async (
    _participantId: string,
    feedbackData: {
      relevance: string;
      usefulness: string;
      comments?: string;
      wouldRecommend: string;
    }
  ) => {
    try {
      console.log("Submitting feedback:", feedbackData);
      toast.success("Feedback submitted successfully");
      setFeedbackParticipant(null);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  // Handle session generation
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
        refetchSessions();
      } else {
        toast.error(result.error || "Failed to generate sessions");
      }
    } catch (_error) {
      toast.error("Failed to generate sessions");
    }
  };

  // Handle session deletion
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const result = await deleteSession.mutateAsync({ sessionId });
      if (result.success) {
        toast.success("Session deleted successfully");
        refetchSessions();
      } else {
        toast.error(result.error || "Failed to delete session");
      }
    } catch (_error) {
      toast.error("Failed to delete session");
    }
  };

  // Handle session status update
  const handleUpdateSessionStatus = async (
    _sessionId: string,
    _status: string
  ) => {
    // TODO: Implement session status update
    toast.info("Session status update coming soon");
  };

  if (isLoadingParticipants || isLoadingSessions) {
    return (
      <TabLoadingSkeleton
        type="attendance"
        message="Loading sessions and attendance data..."
      />
    );
  }

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Combined Sessions and Attendance Management */}
      <div className="space-y-6">
        {/* Sessions Overview Metrics */}
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid w-full gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
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
            title="Total Participants"
            value={participants.length}
            icon={<Users className="h-4 w-4 text-purple-600" />}
            footer={{
              title: "Registered participants",
              description: "All activity participants",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Sessions & Attendance Management
            </h3>
            <p className="text-muted-foreground text-sm">
              Manage sessions and track participant attendance
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateSession} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Session
            </Button>
            <Button onClick={() => onManageAttendance()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Participants
            </Button>
          </div>
        </div>

        {/* Sessions List with Attendance Data */}
        {sessions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map(session => (
                  <SessionWithAttendanceCard
                    key={session.id}
                    session={session}
                    participants={participants}
                    onEditSession={() => onEditSession(session.id)}
                    onManageAttendance={onManageAttendance}
                    onDeleteSession={handleDeleteSession}
                    onUpdateSessionStatus={handleUpdateSessionStatus}
                    onEditParticipant={setEditingParticipant}
                    onParticipantsDeleted={refetchParticipants}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="text-muted-foreground/50 h-12 w-12" />
              <h4 className="mt-4 text-lg font-semibold">No sessions found</h4>
              <p className="text-muted-foreground mt-2 text-center text-sm">
                This activity doesn&apos;t have any sessions yet. Create
                sessions to track attendance for your activity.
              </p>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sessionCount" className="text-sm font-medium">
                    Sessions:
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

      {/* Edit Participant Dialog */}
      {editingParticipant?.participant && (
        <EditParticipantDialog
          participant={editingParticipant.participant as Participant}
          open={!!editingParticipant}
          onOpenChange={open => {
            if (!open) setEditingParticipant(null);
          }}
          onSuccess={() => {
            setEditingParticipant(null);
            refetchParticipants();
            toast.success("Participant updated successfully");
          }}
        />
      )}

      {/* Feedback Dialog */}
      {feedbackParticipant && (
        <ParticipantFeedbackDialog
          open={!!feedbackParticipant}
          onOpenChange={open => {
            if (!open) setFeedbackParticipant(null);
          }}
          participant={feedbackParticipant}
          activityTitle={activity.title}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}

// Combined Session and Attendance Card Component
interface SessionWithAttendanceCardProps {
  session: ActivitySession;
  participants: ActivityParticipant[];
  onEditSession: () => void;
  onManageAttendance: (sessionId?: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSessionStatus: (sessionId: string, status: string) => void;
  onEditParticipant: (participant: ActivityParticipant) => void;
  onParticipantsDeleted: () => void;
}

function SessionWithAttendanceCard({
  session,
  participants,
  onEditSession,
  onManageAttendance,
  onDeleteSession,
  onUpdateSessionStatus,
  onEditParticipant,
  onParticipantsDeleted,
}: SessionWithAttendanceCardProps) {
  const [showAttendance, setShowAttendance] = useState(false);

  // Get attendance data for this session
  const sessionAttendance = participants.filter(
    p => p.activity_id === session.activity_id
  );

  const attendedCount = sessionAttendance.filter(
    p => p.attendance_status === "attended"
  ).length;

  const absentCount = sessionAttendance.filter(
    p => p.attendance_status === "absent"
  ).length;

  const lateCount = sessionAttendance.filter(
    p => p.attendance_status === "late"
  ).length;

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    in_progress:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };

  return (
    <Card className="group border-l-primary w-full overflow-hidden border-l-4 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="from-primary/5 bg-gradient-to-r to-transparent pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Session Title and Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {session.session_number}
                </div>
                <h4 className="truncate text-lg font-semibold">
                  {session.title || `Session ${session.session_number}`}
                </h4>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm",
                  statusColors[session.status as keyof typeof statusColors] ||
                    statusColors.scheduled
                )}
              >
                {session.status === "completed" && (
                  <CheckCircle className="h-3 w-3" />
                )}
                {session.status === "in_progress" && (
                  <Clock className="h-3 w-3" />
                )}
                {session.status === "scheduled" && (
                  <Calendar className="h-3 w-3" />
                )}
                {session.status.replace("_", " ")}
              </span>
            </div>

            {/* Session Info */}
            <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {session.session_date && (
                <div className="bg-background flex items-center gap-1.5 rounded-md px-2 py-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="truncate font-medium">
                    {format(new Date(session.session_date), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {session.start_time && (
                <div className="bg-background flex items-center gap-1.5 rounded-md px-2 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="truncate font-medium">
                    {session.start_time}
                    {session.end_time && ` - ${session.end_time}`}
                  </span>
                </div>
              )}
              <div className="bg-background flex items-center gap-1.5 rounded-md px-2 py-1">
                <Users className="h-3.5 w-3.5" />
                <span className="font-medium">{sessionAttendance.length}</span>
                <span>participants</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onManageAttendance(session.id)}
              variant="default"
              size="sm"
              className="w-[140px] shadow-sm transition-all hover:shadow"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Take Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAttendance(!showAttendance)}
              className="shadow-sm transition-all hover:shadow"
            >
              {showAttendance ? (
                <ChevronUp className="mr-1 h-4 w-4" />
              ) : (
                <ChevronDown className="mr-1 h-4 w-4" />
              )}
              {showAttendance ? "Hide" : "Show"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEditSession}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Session
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onManageAttendance(session.id)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Attendance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onUpdateSessionStatus(session.id, "completed")}
                  disabled={session.status === "completed"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteSession(session.id)}
                  className="text-red-600"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Delete Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Quick Attendance Summary */}
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/50 p-3 text-center shadow-sm dark:from-green-950 dark:to-green-900/50">
            <div className="mb-1 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {attendedCount}
              </div>
            </div>
            <div className="text-xs font-medium text-green-700 dark:text-green-300">
              Attended
            </div>
          </div>

          <div className="rounded-lg border bg-gradient-to-br from-red-50 to-red-100/50 p-3 text-center shadow-sm dark:from-red-950 dark:to-red-900/50">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {absentCount}
              </div>
            </div>
            <div className="text-xs font-medium text-red-700 dark:text-red-300">
              Absent
            </div>
          </div>

          <div className="rounded-lg border bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-3 text-center shadow-sm dark:from-yellow-950 dark:to-yellow-900/50">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {lateCount}
              </div>
            </div>
            <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
              Late
            </div>
          </div>

          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 text-center shadow-sm dark:from-blue-950 dark:to-blue-900/50">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sessionAttendance.length}
              </div>
            </div>
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Total
            </div>
          </div>
        </div>

        {/* Expandable Attendance Details */}
        {showAttendance && sessionAttendance.length > 0 && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 mt-6 border-t pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h5 className="font-semibold">Attendance Details</h5>
            </div>
            <AttendanceDataTable
              sessionAttendance={sessionAttendance}
              onEditParticipant={onEditParticipant}
              onParticipantsDeleted={onParticipantsDeleted}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
