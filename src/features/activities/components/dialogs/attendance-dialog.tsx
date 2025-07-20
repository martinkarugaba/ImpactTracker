"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Users, Download } from "lucide-react";
import { Activity, AttendanceRecord } from "../../types/types";

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  onSave: (attendanceList: AttendanceRecord[]) => void;
}

export function AttendanceDialog({
  open,
  onOpenChange,
  activity,
  onSave,
}: AttendanceDialogProps) {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(
    activity.attendanceList || []
  );
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    role: "",
    organization: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const addParticipant = () => {
    if (newParticipant.name && newParticipant.email) {
      const newRecord: AttendanceRecord = {
        id: `temp-${Date.now()}`,
        name: newParticipant.name,
        email: newParticipant.email,
        role: newParticipant.role,
        organization: newParticipant.organization,
        attended: false,
      };
      setAttendanceList([...attendanceList, newRecord]);
      setNewParticipant({ name: "", email: "", role: "", organization: "" });
    }
  };

  const removeParticipant = (id: string) => {
    setAttendanceList(attendanceList.filter(p => p.id !== id));
  };

  const toggleAttendance = (id: string) => {
    setAttendanceList(
      attendanceList.map(p =>
        p.id === id
          ? {
              ...p,
              attended: !p.attended,
              checkInTime: !p.attended ? new Date() : undefined,
            }
          : p
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(attendanceList);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAttendance = () => {
    const csvContent = [
      "Name,Email,Role,Organization,Attended,Check-in Time",
      ...attendanceList.map(
        p =>
          `"${p.name}","${p.email}","${p.role || ""}","${p.organization || ""}","${p.attended ? "Yes" : "No"}","${p.checkInTime ? p.checkInTime.toLocaleString() : ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activity.title}-attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const attendedCount = attendanceList.filter(p => p.attended).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Manage Attendance - {activity.title}
          </DialogTitle>
          <DialogDescription>
            Add participants and track attendance for this activity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {attendanceList.length} Registered
              </Badge>
              <Badge variant="default">{attendedCount} Attended</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAttendance}
              disabled={attendanceList.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Add New Participant */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-medium">Add New Participant</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={newParticipant.name}
                  onChange={e =>
                    setNewParticipant({
                      ...newParticipant,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newParticipant.email}
                  onChange={e =>
                    setNewParticipant({
                      ...newParticipant,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="Role/Title"
                  value={newParticipant.role}
                  onChange={e =>
                    setNewParticipant({
                      ...newParticipant,
                      role: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  placeholder="Organization"
                  value={newParticipant.organization}
                  onChange={e =>
                    setNewParticipant({
                      ...newParticipant,
                      organization: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button
              onClick={addParticipant}
              disabled={!newParticipant.name || !newParticipant.email}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </div>

          {/* Participants List */}
          {attendanceList.length > 0 && (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attended</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceList.map(participant => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <Checkbox
                          checked={participant.attended}
                          onCheckedChange={() =>
                            toggleAttendance(participant.id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {participant.name}
                      </TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.role || "-"}</TableCell>
                      <TableCell>{participant.organization || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
