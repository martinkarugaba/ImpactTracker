"use client";

import { useState, useEffect, useMemo } from "react";
import type { ActivityParticipant } from "../../types/types";
import type { Participant } from "@/features/participants/types/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Activity, DailyAttendance } from "../../types/types";
import {
  useActivitySessions,
  useGenerateActivitySessions,
  useDeleteActivitySession,
  useActivitySessionsAttendance,
  useActivityParticipants,
} from "../../hooks/use-activities";
import { initializeAllActivityParticipantsInSession } from "../../actions/participants";
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
  onEditSession: (sessionId: string) => void;
  onDuplicateSession?: (sessionId: string) => void;
}

export function AttendanceTab({
  activity,
  onEditSession: _onEditSession,
  onDuplicateSession: _onDuplicateSession,
}: AttendanceTabProps) {
  console.log("AttendanceTab rendered with activity:", activity?.id);

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
    error: _sessionsError,
    refetch: refetchSessions,
  } = useActivitySessions(activity.id);

  const {
    data: attendanceResponse,
    isLoading: _isLoadingAttendance,
    error: _attendanceError,
    refetch: refetchAttendance,
  } = useActivitySessionsAttendance(activity.id);

  const { data: participantsResponse, isLoading: _isLoadingParticipants } =
    useActivityParticipants(activity.id);

  console.log("AttendanceTab - isLoadingSessions:", isLoadingSessions);
  console.log("AttendanceTab - sessionsResponse:", sessionsResponse);
  console.log("AttendanceTab - _sessionsError:", _sessionsError);

  // Mutations
  const generateSessions = useGenerateActivitySessions();
  const deleteSession = useDeleteActivitySession();

  // Extract data from responses
  const sessions = sessionsResponse?.data || [];
  const attendanceBySession = useMemo(
    () => attendanceResponse?.data || {},
    [attendanceResponse]
  );
  const participants = useMemo(
    () => participantsResponse?.data || [],
    [participantsResponse]
  );

  // Track which sessions we've already initialized to avoid repeated calls
  const [initializedSessions, setInitializedSessions] = useState<Set<string>>(
    new Set()
  );

  console.log("AttendanceTab - sessions:", sessions);
  console.log("AttendanceTab - attendanceResponse:", attendanceResponse);
  console.log("AttendanceTab - attendanceBySession:", attendanceBySession);
  console.log("AttendanceTab - selectedSessionId:", selectedSessionId);
  console.log(
    "AttendanceTab - selected session attendance:",
    attendanceBySession[selectedSessionId]
  );

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

  // Session selector for table actions
  const sessionSelector = (
    <div className="flex min-w-0 items-center gap-2">
      <Label
        htmlFor="session-dropdown"
        className="hidden text-sm font-medium whitespace-nowrap sm:block"
      >
        Session:
      </Label>
      <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
        <SelectTrigger className="w-32 min-w-0 sm:w-40 md:w-48 lg:w-56">
          <SelectValue placeholder="All Sessions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sessions</SelectItem>
          {sessions.map(session => (
            <SelectItem value={session.id} key={session.id}>
              {session.title
                ? `${session.session_number || "#"} - ${session.title}`
                : `Session ${session.session_number || "#"}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Handle edit participant
  const _handleEditParticipant = (
    participant: DailyAttendance["participant"]
  ) => {
    if (participant) {
      setEditingParticipant({
        participant: participant,
      } as ActivityParticipant);
    }
  };

  // Initialize attendance for the selected session if needed
  useEffect(() => {
    let mounted = true;

    const tryInitialize = async () => {
      if (
        !selectedSessionId ||
        selectedSessionId === "all" ||
        attendanceBySession[selectedSessionId]?.length > 0 ||
        initializedSessions.has(selectedSessionId)
      ) {
        return;
      }

      if (participants.length === 0) return;

      try {
        toast.loading("Initializing attendance for session...");
        const result = await initializeAllActivityParticipantsInSession(
          activity.id,
          selectedSessionId
        );
        if (!mounted) return;
        if (result?.success) {
          toast.success(result.message || "Attendance initialized");
          setInitializedSessions(prev => new Set(prev).add(selectedSessionId));
          refetchAttendance();
        } else {
          toast.error(result?.error || "Failed to initialize attendance");
        }
      } catch (err) {
        console.error("Error initializing attendance for session:", err);
        toast.error("Failed to initialize attendance");
      }
    };

    tryInitialize();

    return () => {
      mounted = false;
    };
  }, [
    selectedSessionId,
    attendanceBySession,
    participants,
    initializedSessions,
    activity.id,
    refetchAttendance,
  ]);

  if (isLoadingSessions) {
    return (
      <TabLoadingSkeleton
        type="attendance"
        message="Loading sessions and attendance data..."
      />
    );
  }

  // Handle errors
  if (_sessionsError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-red-600">
          <h3 className="text-lg font-semibold">Error Loading Sessions</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {_sessionsError.message || "Failed to load activity sessions"}
          </p>
        </div>
        <Button onClick={() => refetchSessions()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[68.2rem] space-y-6 overflow-hidden">
      {/* Attendance Table Section */}
      {selectedSessionId !== "all"
        ? (() => {
            const records = attendanceBySession[selectedSessionId] || [];
            console.log("Rendering AttendanceDataTable with:", records);

            return (
              <AttendanceDataTable
                sessionAttendance={records}
                isLoading={_isLoadingAttendance}
                additionalActionButtons={sessionSelector}
                onEditParticipant={_handleEditParticipant}
              />
            );
          })()
        : (() => {
            const allRecords = Object.values(
              attendanceBySession
            ).flat() as DailyAttendance[];
            console.log(
              "Rendering AttendanceDataTable with all sessions:",
              allRecords
            );

            // If there are no attendance records at all but we have activity
            // participants, show a participants-based fallback so the user sees
            // the expected rows (they can initialize per-session if needed).
            if (allRecords.length === 0 && participants.length > 0) {
              const fallback = participants.map(p => ({
                id: `pseudo-${p.participant_id || p.id}`,
                // use the nested participant object (if available) to match DailyAttendance.participant
                participant: p.participant || undefined,
                participantName:
                  p.participantName ||
                  (p.participant
                    ? `${p.participant.firstName} ${p.participant.lastName}`
                    : undefined),
                participantEmail:
                  p.participantEmail || p.participant?.contact || "",
                participant_id: p.participant_id || p.participant?.id || "",
                session_id: "",
                attendance_status: "invited",
                created_at: null,
                updated_at: null,
                notes: null,
                check_in_time: null,
                check_out_time: null,
                recorded_by: null,
              }));

              return (
                <AttendanceDataTable
                  sessionAttendance={fallback as unknown as DailyAttendance[]}
                  isLoading={_isLoadingAttendance}
                  additionalActionButtons={sessionSelector}
                  onEditParticipant={_handleEditParticipant}
                />
              );
            }

            return (
              <AttendanceDataTable
                sessionAttendance={allRecords}
                isLoading={_isLoadingAttendance}
                additionalActionButtons={sessionSelector}
                onEditParticipant={_handleEditParticipant}
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
