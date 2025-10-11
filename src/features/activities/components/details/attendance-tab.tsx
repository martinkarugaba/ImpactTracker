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
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Activity } from "../../types/types";
import {
  useActivitySessions,
  useGenerateActivitySessions,
  useDeleteActivitySession,
  useActivitySessionsAttendance,
} from "../../hooks/use-activities";
import { EditParticipantDialog } from "@/features/participants/components/edit-participant-dialog";
import { ParticipantFeedbackDialog } from "../dialogs/participant-feedback-dialog";
import { TabLoadingSkeleton } from "./tab-loading-skeleton";
import { SessionsManagementTab } from "./sessions-management-tab";
import { AttendanceOverviewTab } from "./attendance-overview-tab";

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
  onEditSession,
  onDuplicateSession,
}: AttendanceTabProps) {
  // Local state
  const [sessionCount, setSessionCount] = useState<number>(5);
  const [editingParticipant, setEditingParticipant] =
    useState<ActivityParticipant | null>(null);
  const [feedbackParticipant, setFeedbackParticipant] =
    useState<ActivityParticipant | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<string>("management");

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
        </div>
      </div>

      {/* Sub-tabs for Management and Overview */}
      {sessions.length > 0 ? (
        <Tabs
          value={activeSubTab}
          onValueChange={setActiveSubTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="management">Sessions Management</TabsTrigger>
            <TabsTrigger value="overview">Attendance Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="mt-6">
            <SessionsManagementTab
              sessions={sessions}
              attendanceBySession={attendanceBySession}
              onEditSession={onEditSession}
              onManageAttendance={onManageAttendance}
              onDeleteSession={handleDeleteSession}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onDuplicateSession={onDuplicateSession}
              isLoading={isLoadingSessions}
            />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <AttendanceOverviewTab
              sessions={sessions}
              attendanceBySession={attendanceBySession}
              isLoading={_isLoadingAttendance}
              onAttendanceRefresh={refetchAttendance}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-muted-foreground/50 h-12 w-12" />
            <h4 className="mt-4 text-lg font-semibold">No sessions found</h4>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              This activity doesn&apos;t have any sessions yet. Create sessions
              to track attendance for your activity.
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
