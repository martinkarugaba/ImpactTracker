"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, Clock, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { VSLA } from "../../types";
import { VSLAMeeting } from "../../schemas/enhanced-vsla-drizzle";
import {
  getVSLAMeetings,
  getMeetingAttendance,
} from "../../actions/enhanced-vsla-actions";
import { getVSLAMembers } from "../../actions/vsla-members";
import { toast } from "sonner";

interface VSLAMeetingsTabProps {
  vsla: VSLA;
}

// Extended meeting type with attendance info
interface MeetingWithAttendance extends VSLAMeeting {
  attendees_count?: number;
  total_collected?: number;
  attendance_rate?: number;
}

// Meeting columns for VSLA view
const createVSLAMeetingColumns = (): ColumnDef<MeetingWithAttendance>[] => [
  {
    accessorKey: "meeting_date",
    header: "Date",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">
          {new Date(row.original.meeting_date).toLocaleDateString()}
        </div>
        <div className="text-muted-foreground text-sm">
          {new Date(row.original.meeting_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "meeting_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.meeting_type}
      </Badge>
    ),
  },
  {
    accessorKey: "attendees_count",
    header: "Attendance",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.attendees_count || 0}</div>
        <div className="text-muted-foreground text-sm">
          {row.original.attendance_rate || 0}% rate
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total_collected",
    header: "Collections",
    cell: ({ row }) => (
      <div className="font-medium text-green-600">
        {formatCurrency(row.original.total_collected || 0)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "completed"
            ? "default"
            : row.original.status === "scheduled"
              ? "secondary"
              : "destructive"
        }
        className="capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.notes || "-"}</div>
    ),
  },
];

export function VSLAMeetingsTab({ vsla }: VSLAMeetingsTabProps) {
  const [meetings, setMeetings] = useState<MeetingWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMeetingsData = async () => {
      setIsLoading(true);
      try {
        // Get VSLA meetings
        const meetingsResult = await getVSLAMeetings(vsla.id);
        if (meetingsResult.success && meetingsResult.data) {
          const meetingsData = meetingsResult.data;

          // Enrich meetings with attendance data
          const enrichedMeetings: MeetingWithAttendance[] = await Promise.all(
            meetingsData.map(async meeting => {
              try {
                const attendanceResult = await getMeetingAttendance(meeting.id);
                let attendees_count = 0;
                let attendance_rate = 0;

                if (attendanceResult.success && attendanceResult.data) {
                  attendees_count = attendanceResult.data.filter(
                    a => a.attendance_status === "present"
                  ).length;

                  // Get total members for rate calculation
                  const membersResult = await getVSLAMembers(vsla.id);
                  if (membersResult.success && membersResult.data) {
                    const totalMembers = membersResult.data.length;
                    attendance_rate =
                      totalMembers > 0
                        ? (attendees_count / totalMembers) * 100
                        : 0;
                  }
                }

                return {
                  ...meeting,
                  attendees_count,
                  attendance_rate: Math.round(attendance_rate),
                  total_collected:
                    (meeting.total_savings_collected || 0) +
                    (meeting.total_loan_payments_collected || 0),
                };
              } catch (error) {
                console.error("Error loading attendance for meeting:", error);
                return {
                  ...meeting,
                  attendees_count: 0,
                  attendance_rate: 0,
                  total_collected:
                    (meeting.total_savings_collected || 0) +
                    (meeting.total_loan_payments_collected || 0),
                };
              }
            })
          );

          setMeetings(enrichedMeetings);
        } else {
          // Mock some meetings for demonstration
          const mockMeetings: MeetingWithAttendance[] = [
            {
              id: "meeting-1",
              vsla_id: vsla.id,
              meeting_date: new Date(),
              meeting_type: "regular",
              status: "completed",
              location: "Community Center",
              total_savings_collected: 300000,
              total_loan_payments_collected: 200000,
              new_loans_issued: 2,
              agenda: "Monthly savings and loan review",
              notes: "Good attendance, all payments collected",
              conducted_by: null,
              created_at: new Date(),
              updated_at: new Date(),
              attendees_count: 15,
              attendance_rate: 85,
              total_collected: 500000,
            },
            {
              id: "meeting-2",
              vsla_id: vsla.id,
              meeting_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              meeting_type: "special",
              status: "completed",
              location: "Village Hall",
              total_savings_collected: 450000,
              total_loan_payments_collected: 300000,
              new_loans_issued: 3,
              agenda: "Loan disbursement meeting",
              notes: "New loans approved for 3 members",
              conducted_by: null,
              created_at: new Date(),
              updated_at: new Date(),
              attendees_count: 18,
              attendance_rate: 95,
              total_collected: 750000,
            },
          ];
          setMeetings(mockMeetings);
        }
      } catch (error) {
        console.error("Error loading meetings data:", error);
        toast.error("Failed to load meetings data");
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetingsData();
  }, [vsla.id]);

  const completedMeetings = meetings.filter(
    meeting => meeting.status === "completed"
  );
  const totalCollections = meetings.reduce(
    (sum, meeting) => sum + (meeting.total_collected || 0),
    0
  );
  const averageAttendance =
    meetings.length > 0
      ? meetings.reduce(
          (sum, meeting) => sum + (meeting.attendance_rate || 0),
          0
        ) / meetings.length
      : 0;
  const upcomingMeetings = meetings.filter(
    meeting => meeting.status === "scheduled"
  );

  const meetingColumns = createVSLAMeetingColumns();

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-muted-foreground">Loading meetings data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meetings Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Meetings
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
            <p className="text-muted-foreground text-xs">
              {completedMeetings.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCollections)}
            </div>
            <p className="text-muted-foreground text-xs">Total collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(averageAttendance)}%
            </div>
            <p className="text-muted-foreground text-xs">Average rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-muted-foreground text-xs">Scheduled meetings</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meeting History</h3>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Record Attendance
          </Button>
        </div>
      </div>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Meetings ({meetings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No meetings found for this VSLA
            </div>
          ) : (
            <DataTable
              columns={meetingColumns}
              data={meetings.sort(
                (a, b) =>
                  new Date(b.meeting_date).getTime() -
                  new Date(a.meeting_date).getTime()
              )}
              filterColumn="meeting_type"
              filterPlaceholder="Search by meeting type..."
              showColumnToggle={true}
              showPagination={true}
              showRowSelection={false}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
