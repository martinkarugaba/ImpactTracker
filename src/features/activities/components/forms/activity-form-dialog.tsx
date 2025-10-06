"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  type Activity,
  ACTIVITY_TYPES,
  ACTIVITY_STATUSES,
  type ActivityType,
  type ActivityStatus,
} from "../../types/types";
import {
  useCreateActivity,
  useUpdateActivity,
  useGenerateActivitySessions,
} from "../../hooks/use-activities";

const activityFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(ACTIVITY_TYPES),
  status: z.enum(ACTIVITY_STATUSES),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  venue: z.string().min(1, "Venue is required"),
  budget: z.number().optional(),
  objectives: z.string().optional(),
  activityLead: z.string().min(1, "Activity lead is required"),
  clusterId: z.string().optional(),
  projectId: z.string().optional(),
  // Expected number of sessions
  sessionCount: z
    .number()
    .min(1, "At least 1 session is required")
    .max(50, "Maximum 50 sessions allowed")
    .optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity;
  clusterId?: string;
  clusterUsers?: Array<{
    id: string;
    name: string;
    email: string;
    organization_id?: string | null;
    organization_name?: string | null;
  }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  clusterId,
  clusterUsers = [],
  clusters = [],
  projects = [],
}: ActivityFormDialogProps) {
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const generateSessions = useGenerateActivitySessions();

  const form = useForm({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "meeting" as ActivityType,
      status: "planned" as ActivityStatus,
      venue: "",
      budget: undefined,
      objectives: "",
      activityLead: "",
      clusterId: "",
      projectId: "",
      sessionCount: undefined,
    },
  }) as ReturnType<typeof useForm<ActivityFormValues>>;

  // Reset form when dialog opens/closes or activity changes
  useEffect(() => {
    if (open) {
      if (activity) {
        form.reset({
          title: activity.title || "",
          description: activity.description || "",
          type: activity.type as ActivityType,
          status: activity.status as ActivityStatus,
          startDate: new Date(activity.startDate),
          endDate: activity.endDate ? new Date(activity.endDate) : undefined,
          venue: activity.venue || "",
          budget: activity.budget || undefined,
          objectives: Array.isArray(activity.objectives)
            ? activity.objectives.join("\n")
            : activity.objectives || "",
          activityLead:
            (activity as Activity & { created_by?: string }).created_by || "",
          clusterId: activity.cluster_id || "",
          projectId: activity.project_id || "",
          sessionCount: activity.expectedSessions || undefined,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          type: "training",
          status: "planned",
          venue: "",
          budget: undefined,
          objectives: "",
          activityLead: "",
          clusterId: clusterId || "",
          projectId: "",
          sessionCount: undefined,
        });
      }
    }
  }, [open, activity, form, clusterId]);

  const onSubmit = async (data: ActivityFormValues) => {
    try {
      let createdActivity;

      // Find the selected activity lead user to get their organization_id
      const selectedUser = clusterUsers.find(
        user => user.id === data.activityLead
      );
      const organizationId = selectedUser?.organization_id || "";

      // Validate that the user has an organization
      if (!organizationId) {
        throw new Error(
          "Selected user does not have an associated organization"
        );
      }

      if (activity) {
        const result = await updateActivity.mutateAsync({
          id: activity.id,
          data: {
            ...data,
            description: data.description || null,
            objectives: data.objectives
              ? data.objectives.split("\n").filter(line => line.trim())
              : [],
            budget: data.budget || null,
            endDate: data.endDate || null,
            cluster_id: data.clusterId || undefined,
            project_id: data.projectId || undefined,
            organization_id: organizationId,
            expectedSessions: data.sessionCount || null,
            created_by: data.activityLead,
          },
        });
        createdActivity = result.data;
      } else {
        const activityData = {
          ...data,
          description: data.description || null,
          objectives: data.objectives
            ? data.objectives.split("\n").filter(line => line.trim())
            : [],
          budget: data.budget || null,
          endDate: data.endDate || null,
          cluster_id: data.clusterId || clusterId || null,
          project_id: data.projectId || null,
          organization_id: organizationId,
          expectedSessions: data.sessionCount || null,
          // Provide default values for missing required fields
          actualCost: null,
          numberOfParticipants: 0,
          outcomes: null,
          challenges: null,
          recommendations: null,
          attachments: [],
          created_by: data.activityLead,
        };

        console.log("Creating activity with data:", activityData);
        const result = await createActivity.mutateAsync(activityData);
        createdActivity = result.data;
      }

      // Generate sessions if session count is specified
      if (
        !activity && // Only for new activities
        createdActivity &&
        data.sessionCount &&
        data.sessionCount > 0
      ) {
        await generateSessions.mutateAsync({
          activityId: createdActivity.id,
          sessionCount: data.sessionCount,
          sessionData: {
            venue: data.venue,
          },
        });
      }

      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the hooks
      console.error("Form submission error:", error);
    }
  };

  const isLoading = createActivity.isPending || updateActivity.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Edit Activity" : "Create New Activity"}
          </DialogTitle>
          <DialogDescription>
            {activity
              ? "Update the activity details below."
              : "Fill in the details to create a new activity."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Activity title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Activity description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type
                              .split("_")
                              .map(
                                word =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
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
                        {ACTIVITY_STATUSES.map(status => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
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
                          disabled={date => date < form.watch("startDate")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="Activity venue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Number of Sessions (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="Enter number of sessions (e.g., 5)"
                      {...field}
                      value={field.value || ""}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    If this activity will have multiple sessions, specify how
                    many you expect
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={field.value || ""}
                      onChange={e =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Budget in UGX (Uganda Shillings)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Lead</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clusterUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                          {user.organization_name && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              - {user.organization_name}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a cluster member to lead this activity. Their
                    organization will be used as the lead partner.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {clusters.length > 0 && (
              <FormField
                control={form.control}
                name="clusterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cluster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clusters.map(cluster => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {projects.length > 0 && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectives (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Activity objectives and goals"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {activity ? "Update Activity" : "Create Activity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
