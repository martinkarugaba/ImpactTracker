"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Edit, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSessionAttendance,
  useMarkAttendance,
} from "@/features/activities/hooks/use-activities";
import type { dailyAttendance } from "@/lib/db/schema";

interface DailyAttendanceDialogProps {
  sessionId: string;
  sessionDate: string;
  sessionNumber: number;
  children: React.ReactNode;
}

interface TempRecord {
  attendance_status?: "invited" | "attended" | "absent" | "late" | "excused";
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}

export function DailyAttendanceDialog({
  sessionId,
  sessionDate,
  sessionNumber,
  children,
}: DailyAttendanceDialogProps) {
  const { user } = useUser();
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [tempRecords, setTempRecords] = useState<Record<string, TempRecord>>(
    {}
  );

  const { data: attendanceResponse, isLoading } =
    useSessionAttendance(sessionId);
  const markAttendance = useMarkAttendance();

  const attendanceRecords = attendanceResponse?.data || [];

  const handleStatusChange = (participantId: string, status: string) => {
    setTempRecords(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        attendance_status: status as
          | "invited"
          | "attended"
          | "absent"
          | "late"
          | "excused",
      },
    }));
  };

  const handleTimeChange = (
    participantId: string,
    field: "check_in_time" | "check_out_time",
    value: string
  ) => {
    setTempRecords(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value,
      },
    }));
  };

  const handleNotesChange = (participantId: string, notes: string) => {
    setTempRecords(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        notes,
      },
    }));
  };

  const handleEditRecord = (
    participantId: string,
    record: typeof dailyAttendance.$inferSelect
  ) => {
    setEditingRecord(participantId);
    setTempRecords(prev => ({
      ...prev,
      [participantId]: {
        attendance_status: record.attendance_status as
          | "invited"
          | "attended"
          | "absent"
          | "late"
          | "excused",
        check_in_time: record.check_in_time?.toTimeString().slice(0, 5) || "",
        check_out_time: record.check_out_time?.toTimeString().slice(0, 5) || "",
        notes: record.notes || "",
      },
    }));
  };

  const handleCancelEdit = (participantId: string) => {
    setEditingRecord(null);
    const newRecords = { ...tempRecords };
    delete newRecords[participantId];
    setTempRecords(newRecords);
  };

  const handleSaveRecord = async (participantId: string) => {
    const tempRecord = tempRecords[participantId];
    if (!tempRecord) return;

    // Find the current attendance record for this participant
    const currentRecord = attendanceRecords.find(
      r => r.participant_id === participantId
    );
    if (!currentRecord) return;

    try {
      const attendanceData = {
        attendance_status: (tempRecord.attendance_status ||
          currentRecord.attendance_status) as
          | "invited"
          | "attended"
          | "absent"
          | "late"
          | "excused",
        check_in_time: tempRecord.check_in_time
          ? new Date(`1970-01-01T${tempRecord.check_in_time}:00`)
          : undefined,
        check_out_time: tempRecord.check_out_time
          ? new Date(`1970-01-01T${tempRecord.check_out_time}:00`)
          : undefined,
        notes: tempRecord.notes,
        recorded_by: user?.emailAddresses[0]?.emailAddress ?? "system",
      };

      await markAttendance.mutateAsync({
        sessionId,
        participantId,
        attendanceData,
      });

      setEditingRecord(null);
      const newRecords = { ...tempRecords };
      delete newRecords[participantId];
      setTempRecords(newRecords);
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      attended: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      excused: "bg-blue-100 text-blue-800",
      invited: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        variant="outline"
        className={cn(variants[status as keyof typeof variants])}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "-";
    return date.toTimeString().slice(0, 5);
  };

  if (isLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Daily Attendance - Session {sessionNumber} ({sessionDate})
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Daily Attendance - Session {sessionNumber} ({sessionDate})
          </DialogTitle>
        </DialogHeader>

        {attendanceRecords && attendanceRecords.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceRecords.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Attended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      attendanceRecords.filter(
                        record => record.attendance_status === "attended"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Absent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {
                      attendanceRecords.filter(
                        record => record.attendance_status === "absent"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Late
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      attendanceRecords.filter(
                        record => record.attendance_status === "late"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    Excused
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      attendanceRecords.filter(
                        record => record.attendance_status === "excused"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map(record => {
                  const isEditing = editingRecord === record.participant_id;
                  const tempRecord = tempRecords[record.participant_id] || {};

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.participant?.firstName}{" "}
                        {record.participant?.lastName}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={
                              tempRecord.attendance_status ||
                              record.attendance_status
                            }
                            onValueChange={value =>
                              handleStatusChange(record.participant_id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="attended">Attended</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          getStatusBadge(record.attendance_status)
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="time"
                            value={
                              tempRecord.check_in_time ||
                              (record.check_in_time
                                ? formatTime(record.check_in_time)
                                : "")
                            }
                            onChange={e =>
                              handleTimeChange(
                                record.participant_id,
                                "check_in_time",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        ) : (
                          <span>{formatTime(record.check_in_time)}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="time"
                            value={
                              tempRecord.check_out_time ||
                              (record.check_out_time
                                ? formatTime(record.check_out_time)
                                : "")
                            }
                            onChange={e =>
                              handleTimeChange(
                                record.participant_id,
                                "check_out_time",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        ) : (
                          <span>{formatTime(record.check_out_time)}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={tempRecord.notes || record.notes || ""}
                            onChange={e =>
                              handleNotesChange(
                                record.participant_id,
                                e.target.value
                              )
                            }
                            placeholder="Add notes..."
                            className="w-48"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {record.notes || "-"}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveRecord(record.participant_id)
                                }
                                disabled={markAttendance.isPending}
                              >
                                {markAttendance.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCancelEdit(record.participant_id)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEditRecord(record.participant_id, record)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            No attendance records found for this session.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
