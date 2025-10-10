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
import { Spinner } from "@/components/ui/spinner";

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
                      <Spinner className="mr-2 h-4 w-4" />
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
}

function SessionWithAttendanceCard({
  session,
  participants,
  onEditSession,
  onManageAttendance,
  onDeleteSession,
  onUpdateSessionStatus,
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
    <Card className="border-l-primary w-full overflow-hidden border-l-4">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate font-semibold">
                Session {session.session_number}
                {session.title && ` - ${session.title}`}
              </h4>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusColors[session.status as keyof typeof statusColors] ||
                    statusColors.scheduled
                )}
              >
                {session.status}
              </span>
            </div>
            <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {session.session_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {format(new Date(session.session_date), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {session.start_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {session.start_time}
                    {session.end_time && ` - ${session.end_time}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 flex-shrink-0" />
                {sessionAttendance.length} participants
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttendance(!showAttendance)}
            >
              {showAttendance ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showAttendance ? "Hide" : "Show"} Attendance
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {attendedCount}
            </div>
            <div className="text-muted-foreground text-xs">Attended</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <div className="text-muted-foreground text-xs">Absent</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-yellow-600">
              {lateCount}
            </div>
            <div className="text-muted-foreground text-xs">Late</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{sessionAttendance.length}</div>
            <div className="text-muted-foreground text-xs">Total</div>
          </div>
        </div>

        {/* Expandable Attendance Details */}
        {showAttendance && sessionAttendance.length > 0 && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <h5 className="font-medium">Attendance Details</h5>
            <div className="space-y-2">
              {sessionAttendance.map((participant, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <div className="font-medium">
                      {participant.participant
                        ? `${participant.participant.firstName} ${participant.participant.lastName}`
                        : "Unknown Participant"}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {participant.participant?.contact &&
                        `• ${participant.participant.contact}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        participant.attendance_status === "attended" &&
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                        participant.attendance_status === "absent" &&
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                        participant.attendance_status === "late" &&
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      )}
                    >
                      {participant.attendance_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => onManageAttendance(session.id)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Take Attendance
          </Button>
          <Button onClick={onEditSession} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
