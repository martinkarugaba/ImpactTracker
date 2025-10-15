"use client";

import { useState } from "react";
import type { ActivityParticipant } from "../../types/types";
import type { Participant } from "@/features/participants/types/types";
import { Users, Calendar, CheckCircle, Clock, Plus } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Activity, DailyAttendance } from "../../types/types";
import {
  useActivitySessions,
  useGenerateActivitySessions,
  useDeleteActivitySession,
  useActivitySessionsAttendance,
} from "../../hooks/use-activities";
import { EditParticipantDialog } from "@/features/participants/components/edit-participant-dialog";
import { ParticipantFeedbackDialog } from "../dialogs/participant-feedback-dialog";
import { TabLoadingSkeleton } from "./tab-loading-skeleton";
import { AttendanceDataTable } from "./attendance-data-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AttendanceTabProps {
  activity: Activity;
  onManageAttendance: (sessionId?: string) => void;
  onCreateSession: () => void;
  onEditSession: (sessionId: string) => void;
  onDuplicateSession?: (sessionId: string) => void;
}

export function AttendanceTab({
  activity,
  onManageAttendance,
  onCreateSession,
  onEditSession: _onEditSession,
  onDuplicateSession: _onDuplicateSession,
}: AttendanceTabProps) {
  // Local state
  const [sessionCount, _setSessionCount] = useState<number>(5);
  const [editingParticipant, setEditingParticipant] =
    useState<ActivityParticipant | null>(null);
  const [feedbackParticipant, setFeedbackParticipant] =
    useState<ActivityParticipant | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | "all">(
    "all"
  );

  // Data fetching hooks
  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useActivitySessions(activity.id);

  const {
    data: attendanceResponse,
    isLoading: _isLoadingAttendance,
    refetch: refetchAttendance,
  } = useActivitySessionsAttendance(activity.id);

  // Mutations
  const generateSessions = useGenerateActivitySessions();
  const deleteSession = useDeleteActivitySession();

  // Extract data from responses
  const sessions = sessionsResponse?.data || [];
  const attendanceBySession = attendanceResponse?.data || {};

  console.log("AttendanceTab - sessions:", sessions);
  console.log("AttendanceTab - attendanceResponse:", attendanceResponse);
  console.log("AttendanceTab - attendanceBySession:", attendanceBySession);
  console.log("AttendanceTab - selectedSessionId:", selectedSessionId);
  console.log(
    "AttendanceTab - selected session attendance:",
    attendanceBySession[selectedSessionId]
  );

  // Calculate total unique participants across all sessions
  const totalParticipants = Object.values(attendanceBySession)
    .flat()
    .reduce((acc, attendance) => {
      if (!acc.has(attendance.participant_id)) {
        acc.set(attendance.participant_id, true);
      }
      return acc;
    }, new Map()).size;

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
  const _handleGenerateSessions = async () => {
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
  const _handleDeleteSession = async (sessionId: string) => {
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
  const _handleUpdateSessionStatus = async (
    _sessionId: string,
    _status: string
  ) => {
    // TODO: Implement session status update
    toast.info("Session status update coming soon");
  };

  // Handle edit participant
  const _handleEditParticipant = (participant: ActivityParticipant) => {
    setEditingParticipant(participant);
  };

  if (isLoadingSessions || _isLoadingAttendance) {
    return (
      <TabLoadingSkeleton
        type="attendance"
        message="Loading sessions and attendance data..."
      />
    );
  }

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
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
          value={totalParticipants}
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
          <Button onClick={() => onManageAttendance()} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Add Participants
          </Button>
        </div>
      </div>

      {/* Session Selector Dropdown */}
      <div className="mb-4 flex flex-row items-center gap-2">
        <Label htmlFor="session-dropdown">Session:</Label>
        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Sessions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            {sessions.map(session => (
              <SelectItem value={session.id} key={session.id}>
                {session.title
                  ? `${session.session_number || "#"} - ${session.title}`
                  : `Session ${session.session_number || "#"}`}
                {session.session_date ? ` (${session.session_date})` : null}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Table Section */}
      {selectedSessionId !== "all"
        ? (() => {
            console.log(
              "Rendering AttendanceDataTable with:",
              attendanceBySession[selectedSessionId] || []
            );
            return (
              <AttendanceDataTable
                sessionAttendance={attendanceBySession[selectedSessionId] || []}
                isLoading={_isLoadingAttendance}
              />
            );
          })()
        : (() => {
            console.log(
              "Rendering AttendanceDataTable with all sessions:",
              Object.values(attendanceBySession).flat()
            );
            return (
              <AttendanceDataTable
                sessionAttendance={
                  Object.values(attendanceBySession).flat() as DailyAttendance[]
                }
                isLoading={_isLoadingAttendance}
              />
            );
          })()}

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
            refetchAttendance();
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
