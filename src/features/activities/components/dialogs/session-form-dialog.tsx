"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCreateActivitySession,
  useUpdateActivitySession,
  useActivitySession,
} from "../../hooks/use-activities";
import {
  SESSION_STATUSES,
  type SessionStatus,
  type ActivitySessionResponse,
} from "../../types/types";

const sessionFormSchema = z.object({
  session_date: z.date({ required_error: "Session date is required" }),
  session_number: z.number().min(1, "Session number must be at least 1"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  venue: z.string().optional(),
  status: z.enum(SESSION_STATUSES),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  sessionId?: string; // For editing existing session
}

export function SessionFormDialog({
  open,
  onOpenChange,
  activityId,
  sessionId,
}: SessionFormDialogProps) {
  const isEdit = !!sessionId;

  const { data: session } = useActivitySession(sessionId || "");
  const createSession = useCreateActivitySession();
  const updateSession = useUpdateActivitySession();

  const form = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      session_date: new Date(),
      session_number: 1,
      start_time: "",
      end_time: "",
      venue: "",
      status: "scheduled" as SessionStatus,
    },
  }) as ReturnType<typeof useForm<SessionFormValues>>;

  // Reset form when dialog opens/closes or session changes
  useEffect(() => {
    if (open) {
      if (isEdit && session?.data) {
        form.reset({
          session_date: new Date(session.data.session_date),
          session_number: session.data.session_number,
          start_time: session.data.start_time || "",
          end_time: session.data.end_time || "",
          venue: session.data.venue || "",
          status: session.data.status as SessionStatus,
        });
      } else {
        form.reset({
          session_date: new Date(),
          session_number: 1,
          start_time: "",
          end_time: "",
          venue: "",
          status: "scheduled",
        });
      }
    }
  }, [open, isEdit, session, form]);

  const onSubmit = async (data: SessionFormValues) => {
    try {
      const sessionData = {
        activity_id: activityId,
        session_date: format(data.session_date, "yyyy-MM-dd"),
        session_number: data.session_number,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        venue: data.venue || null,
        status: data.status,
        notes: null,
      };

      let result: ActivitySessionResponse;
      if (isEdit && sessionId) {
        result = (await updateSession.mutateAsync({
          id: sessionId,
          data: sessionData,
        })) as ActivitySessionResponse;
      } else {
        result = (await createSession.mutateAsync(
          sessionData
        )) as ActivitySessionResponse;
      }

      if (result.success) {
        toast.success(
          isEdit
            ? "Session updated successfully"
            : "Session created successfully"
        );
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to save session");
      }
    } catch (_error) {
      toast.error("Failed to save session");
    }
  };

  const isSubmitting = createSession.isPending || updateSession.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Session" : "Create New Session"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the session details below."
              : "Add a new session to this activity. Fill in the session details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="session_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Session Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="session_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter session venue..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
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
                      {SESSION_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEdit ? "Update Session" : "Create Session"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
