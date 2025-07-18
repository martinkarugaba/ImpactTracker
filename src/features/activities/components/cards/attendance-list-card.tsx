"use client";

import { AttendanceRecord } from "../../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsersIcon, DownloadIcon, EditIcon } from "lucide-react";
import { getInitials } from "../../utils/text-utils";

interface AttendanceListCardProps {
  attendanceList: AttendanceRecord[] | null;
  onManageAttendance: () => void;
}

export function AttendanceListCard({
  attendanceList,
  onManageAttendance,
}: AttendanceListCardProps) {
  const handleExport = () => {
    // TODO: Implement export functionality
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UsersIcon className="mr-2 h-5 w-5" />
            Attendance List
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={onManageAttendance}>
              <EditIcon className="mr-2 h-4 w-4" />
              Manage Attendance
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {attendanceList && attendanceList.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {attendanceList.length} participants registered
              </span>
              <span className="text-muted-foreground">
                {attendanceList.filter(p => p.attended).length} attended
              </span>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {attendanceList.slice(0, 5).map((participant, index) => (
                <div
                  key={index}
                  className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="text-xs font-medium">
                        {getInitials(participant.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {participant.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={participant.attended ? "default" : "secondary"}
                  >
                    {participant.attended ? "Attended" : "Registered"}
                  </Badge>
                </div>
              ))}
              {attendanceList.length > 5 && (
                <div className="py-2 text-center">
                  <Button variant="ghost" size="sm">
                    View all participants
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <UsersIcon className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No attendance records
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Start by adding participants and tracking attendance for this
              activity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
