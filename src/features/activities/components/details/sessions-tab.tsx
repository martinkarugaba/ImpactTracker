"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Edit,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  useActivitySessions,
  useUpdateActivitySession,
  useGenerateActivitySessions,
} from "../../hooks/use-activities";
import type { Activity, SessionStatus } from "../../types/types";
import { cn } from "@/lib/utils";

interface SessionsTabProps {
  activity: Activity;
  onManageAttendance: (sessionId: string) => void;
  onCreateSession: () => void;
  onEditSession: (sessionId: string) => void;
}

export function SessionsTab({
  activity,
  onManageAttendance,
  onCreateSession,
  onEditSession,
}: SessionsTabProps) {
  const [_deletingSessionId, _setDeletingSessionId] = useState<string | null>(
    null
  );

  const { data: sessions, isLoading } = useActivitySessions(activity.id);
  const updateSession = useUpdateActivitySession();
  const generateSessions = useGenerateActivitySessions();

  const sessionsData = sessions?.data || [];

  const handleStatusChange = async (
    sessionId: string,
    status: SessionStatus
  ) => {
    try {
      const result = await updateSession.mutateAsync({
        id: sessionId,
        data: { status },
      });

      if (result.success) {
        toast.success(`Session ${status} successfully`);
      } else {
        toast.error(result.error || "Failed to update session status");
      }
    } catch (_error) {
      toast.error("Failed to update session status");
    }
  };

  const handleGenerateSessions = async () => {
    if (!activity.startDate || !activity.endDate) {
      toast.error(
        "Activity must have start and end dates to generate sessions"
      );
      return;
    }

    try {
      const result = await generateSessions.mutateAsync({
        activityId: activity.id,
        startDate: new Date(activity.startDate),
        endDate: new Date(activity.endDate),
        sessionData: {
          start_time: "09:00",
          end_time: "17:00",
          venue: activity.venue || "",
        },
      });

      if (result.success) {
        toast.success("Sessions generated successfully");
      } else {
        toast.error(result.error || "Failed to generate sessions");
      }
    } catch (_error) {
      toast.error("Failed to generate sessions");
    }
  };

  const getStatusBadge = (status: SessionStatus) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      completed: "bg-green-100 text-green-800 hover:bg-green-200",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
      postponed: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    };

    const icons = {
      scheduled: Clock,
      completed: CheckCircle,
      cancelled: XCircle,
      postponed: Calendar,
    };

    const Icon = icons[status];

    return (
      <Badge variant="secondary" className={cn("gap-1", variants[status])}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusActions = (session: { id: string; status: SessionStatus }) => {
    const actions = [];

    if (session.status === "scheduled") {
      actions.push(
        <TooltipProvider key="complete">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(session.id, "completed")}
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mark as completed</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (session.status === "scheduled") {
      actions.push(
        <TooltipProvider key="cancel">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(session.id, "cancelled")}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel session</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (session.status === "completed") {
      actions.push(
        <TooltipProvider key="attendance">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onManageAttendance(session.id)}
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <UserCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Manage attendance</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return actions;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Sessions</h3>
          <p className="text-muted-foreground text-sm">
            Manage individual sessions for this multi-day activity
          </p>
        </div>
        <div className="flex gap-2">
          {(!sessionsData || sessionsData.length === 0) && activity.endDate && (
            <Button
              onClick={handleGenerateSessions}
              disabled={generateSessions.isPending}
              variant="outline"
            >
              {generateSessions.isPending ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Generate Sessions
            </Button>
          )}
          <Button onClick={onCreateSession}>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      {/* Sessions Overview Cards */}
      {sessionsData && sessionsData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionsData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {sessionsData.filter(s => s.status === "completed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {sessionsData.filter(s => s.status === "scheduled").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {sessionsData.filter(s => s.status === "cancelled").length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions Table */}
      {sessionsData && sessionsData.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsData.map(session => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    Session {session.session_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      {format(new Date(session.session_date), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.start_time && session.end_time ? (
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        {session.start_time} - {session.end_time}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.venue ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        {session.venue}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(session.status as SessionStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getStatusActions({
                        ...session,
                        status: session.status as SessionStatus,
                      })}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditSession(session.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit session</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-muted-foreground/50 h-12 w-12" />
            <h4 className="mt-4 text-lg font-semibold">No sessions found</h4>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              This activity doesn&apos;t have any sessions yet. Create sessions
              to track daily attendance for your multi-day activity.
            </p>
            <div className="mt-6 flex gap-2">
              {activity.endDate && (
                <Button
                  onClick={handleGenerateSessions}
                  disabled={generateSessions.isPending}
                  variant="outline"
                >
                  {generateSessions.isPending ? (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Generate Sessions
                </Button>
              )}
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
