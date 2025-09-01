"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, UserPlus, Loader2, Edit } from "lucide-react";
import { Activity } from "../../types/types";
import { useActivityParticipants } from "../../hooks/use-activities";
import { DataTable } from "@/components/ui/data-table";
import { createParticipantsTableColumns } from "./participants-table-columns";
import { MetricCard } from "@/components/ui/metric-card";

interface ParticipantsTabProps {
  activity: Activity;
  onManageAttendance: () => void;
}

export function ParticipantsTab({
  activity,
  onManageAttendance,
}: ParticipantsTabProps) {
  // Fetch activity participants
  const {
    data: participantsResponse,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useActivityParticipants(activity.id);

  const participants = participantsResponse?.success
    ? participantsResponse.data || []
    : [];

  // Attendance stats
  const stats = {
    total: participants.length,
    attended: participants.filter(p => p.attendance_status === "attended")
      .length,
    absent: participants.filter(p => p.attendance_status === "absent").length,
    pending: participants.filter(p => p.attendance_status === "pending").length,
  };

  const attendanceRate =
    stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;

  // Create columns without edit functionality for now (since we only have partial participant data)
  const columns = createParticipantsTableColumns();

  return (
    <div className="space-y-6">
      {/* Simple Attendance Stats */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
        <MetricCard
          title="Total Participants"
          value={stats.total}
          description="All registered participants for this activity"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Attended"
          value={stats.attended}
          description="Participants who attended the activity"
          icon={<Users className="h-4 w-4" />}
          footer={{
            title: "Present",
            description: "Confirmed attendance",
          }}
        />
        <MetricCard
          title="Absent"
          value={stats.absent}
          description="Participants who were absent"
          icon={<Users className="h-4 w-4" />}
          footer={{
            title: "Not Present",
            description: "Confirmed absence",
          }}
        />
        <MetricCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          description="Percentage of participants who attended"
          icon={<Users className="h-4 w-4" />}
          footer={{
            title: "Success Rate",
            description: "Overall participation",
          }}
        />
      </div>

      {/* Participant Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participant Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={onManageAttendance}>
              <Edit className="mr-2 h-4 w-4" />
              Add/Edit Participants
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Import from List
            </Button>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Individual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants & Attendance
            </div>
            <div className="text-muted-foreground text-sm font-normal">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingParticipants ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground ml-2 text-sm">
                Loading participants...
              </span>
            </div>
          ) : participantsError ? (
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
                <Button onClick={onManageAttendance}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Participants
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={participants}
              filterColumn="participantName"
              filterPlaceholder="Search participants..."
              showColumnToggle={true}
              showPagination={participants.length > 10}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
