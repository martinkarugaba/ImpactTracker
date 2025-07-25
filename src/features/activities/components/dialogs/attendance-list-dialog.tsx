"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import {
  ActivityParticipant,
  ATTENDANCE_STATUSES,
  PARTICIPANT_ROLES,
} from "../../types/types";

const participantSchema = z.object({
  participantName: z.string().min(1, "Participant name is required"),
  role: z.string().min(1, "Role is required"),
  attendanceStatus: z.string().min(1, "Attendance status is required"),
  feedback: z.string().optional(),
});

const attendanceListSchema = z.object({
  participants: z.array(participantSchema),
});

type AttendanceListFormData = z.infer<typeof attendanceListSchema>;

interface AttendanceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  participants?: ActivityParticipant[];
  onSubmit: (participants: Partial<ActivityParticipant>[]) => Promise<void>;
}

export function AttendanceListDialog({
  open,
  onOpenChange,
  activityId,
  participants = [],
  onSubmit,
}: AttendanceListDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AttendanceListFormData>({
    resolver: zodResolver(attendanceListSchema),
    defaultValues: {
      participants:
        participants.length > 0
          ? participants.map(p => ({
              participantName: p.participantName || "",
              role: p.role || "participant",
              attendanceStatus: p.attendance_status || "invited",
              feedback: p.feedback || "",
            }))
          : [
              {
                participantName: "",
                role: "participant",
                attendanceStatus: "invited",
                feedback: "",
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const handleSubmit = async (data: AttendanceListFormData) => {
    setIsLoading(true);
    try {
      const participantData = data.participants.map(p => ({
        activity_id: activityId,
        participantName: p.participantName,
        role: p.role,
        attendance_status: p.attendanceStatus,
        feedback: p.feedback || null,
      }));

      await onSubmit(participantData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving attendance list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = () => {
    append({
      participantName: "",
      role: "participant",
      attendanceStatus: "invited",
      feedback: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "attended":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-5 w-5" />
            <DialogTitle>Attendance List</DialogTitle>
          </div>
          <DialogDescription>
            Manage participants and their attendance status for this activity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Participants</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Participant
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-4"
                >
                  <FormField
                    control={form.control}
                    name={`participants.${index}.participantName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Participant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`participants.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARTICIPANT_ROLES.map(role => (
                              <SelectItem key={role} value={role}>
                                {role
                                  .replace("_", " ")
                                  .charAt(0)
                                  .toUpperCase() +
                                  role.replace("_", " ").slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`participants.${index}.attendanceStatus`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ATTENDANCE_STATUSES.map(status => (
                              <SelectItem key={status} value={status}>
                                <Badge
                                  variant="secondary"
                                  className={getStatusColor(status)}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Attendance List
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
