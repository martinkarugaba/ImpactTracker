"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Activity, ActivityReport, NewActivityReport } from "../../types/types";
import type { FollowUpAction, NewFollowUpAction } from "../../types/types";
import {
  createActivityReport,
  updateActivityReport,
} from "../../actions/activity-reports";
import { v4 as uuidv4 } from "uuid";

const activityReportSchema = z.object({
  // Basic Information
  activityName: z.string().min(1, "Activity name is required"),
  executionDate: z.string().min(1, "Execution date is required"),
  clusterName: z.string().min(1, "Cluster name is required"),
  venue: z.string().min(1, "Venue is required"),
  teamLeader: z.string().min(1, "Team leader is required"),

  // Activity Details
  backgroundPurpose: z.string().min(1, "Background & purpose is required"),
  progressAchievements: z
    .string()
    .min(1, "Progress & achievements is required"),
  challengesRecommendations: z
    .string()
    .min(1, "Challenges & recommendations is required"),
  lessonsLearned: z.string().min(1, "Lessons learned is required"),

  // Legacy fields to maintain compatibility
  outcomes: z.string().optional(),
  challenges: z.string().optional(),
  recommendations: z.string().optional(),
  actualCost: z.number().optional(),
  numberOfParticipants: z
    .number()
    .min(0, "Number of participants cannot be negative")
    .optional(),
});

type ActivityReportFormData = z.infer<typeof activityReportSchema>;

interface ActivityReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  activityReport?: ActivityReport;
  onSubmit: () => Promise<void>;
}

export function ActivityReportDialog({
  open,
  onOpenChange,
  activity,
  activityReport,
  onSubmit,
}: ActivityReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ActivityReportFormData>({
    resolver: zodResolver(activityReportSchema),
    defaultValues: {
      // Basic Information - prefill from activity data or existing report
      activityName: activityReport?.title || activity.title || "",
      executionDate: activityReport?.execution_date
        ? new Date(activityReport.execution_date).toISOString().split("T")[0]
        : activity.startDate
          ? new Date(activity.startDate).toISOString().split("T")[0]
          : "",
      clusterName: activityReport?.cluster_name || activity.clusterName || "",
      venue: activityReport?.venue || activity.venue || "",
      teamLeader: activityReport?.team_leader || "",

      // Activity Details
      backgroundPurpose: activityReport?.background_purpose || "",
      progressAchievements: activityReport?.progress_achievements || "",
      challengesRecommendations:
        activityReport?.challenges_recommendations || "",
      lessonsLearned: activityReport?.lessons_learned || "",

      // Legacy fields - keep for compatibility but not used in new schema
      outcomes: "",
      challenges: "",
      recommendations: "",
      actualCost: activityReport?.actual_cost ?? undefined,
      numberOfParticipants: activityReport?.number_of_participants ?? undefined,
    },
  });

  // Initialize follow-up actions from existing report
  const [followUpActions, setFollowUpActions] = useState<FollowUpAction[]>(
    () => {
      if (activityReport?.follow_up_actions) {
        try {
          return activityReport.follow_up_actions.map(actionStr => {
            const parsed = JSON.parse(actionStr);
            return {
              id: parsed.id || uuidv4(),
              action: parsed.action || "",
              responsiblePerson: parsed.responsiblePerson || "",
              timeline: parsed.timeline || "",
            };
          });
        } catch {
          return [];
        }
      }
      return [];
    }
  );

  const handleAddFollowUpAction = useCallback(() => {
    const newAction: FollowUpAction = {
      id: uuidv4(),
      action: "",
      responsiblePerson: "",
      timeline: "",
    };
    setFollowUpActions(prev => [...prev, newAction]);
  }, [setFollowUpActions]);

  const handleUpdateFollowUpAction = useCallback(
    (id: string, field: keyof NewFollowUpAction, value: string) => {
      setFollowUpActions(prev =>
        prev.map(action =>
          action.id === id ? { ...action, [field]: value } : action
        )
      );
    },
    [setFollowUpActions]
  );

  const handleRemoveFollowUpAction = useCallback(
    (id: string) => {
      setFollowUpActions(prev => prev.filter(action => action.id !== id));
    },
    [setFollowUpActions]
  );

  const handleSubmit = async (data: ActivityReportFormData) => {
    setIsLoading(true);
    try {
      // Prepare the activity report data
      const reportData: NewActivityReport = {
        activity_id: activity.id,
        title: data.activityName,
        execution_date: new Date(data.executionDate),
        cluster_name: data.clusterName,
        venue: data.venue,
        team_leader: data.teamLeader,
        background_purpose: data.backgroundPurpose,
        progress_achievements: data.progressAchievements,
        challenges_recommendations: data.challengesRecommendations,
        lessons_learned: data.lessonsLearned,
        follow_up_actions: followUpActions.map(action =>
          JSON.stringify(action)
        ),
        actual_cost: data.actualCost || null,
        number_of_participants: data.numberOfParticipants || null,
        created_by: "current-user", // TODO: Get actual user ID
      };

      let response;
      if (activityReport) {
        // Update existing report
        response = await updateActivityReport(activityReport.id, reportData);
      } else {
        // Create new report
        response = await createActivityReport(reportData);
      }

      if (response.success) {
        onOpenChange(false);
        await onSubmit(); // Refresh the reports list
      } else {
        console.error("Error saving activity report:", response.error);
      }
    } catch (error) {
      console.error("Error saving activity report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[95vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {activityReport ? "Edit Activity Report" : "Create Activity Report"}
          </DialogTitle>
          <DialogDescription>
            {activityReport
              ? `Update the comprehensive report for "${activity.title}".`
              : `Create a comprehensive report for "${activity.title}".`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="activityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name/Title of Activity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter activity name/title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="executionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Execution Date/Period</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Select execution date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clusterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of the Cluster</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter cluster name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue/Location of Activity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter venue or location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamLeader"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Team Leader</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter team leader name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Activity Details Section */}
            <div className="space-y-6">
              <h3 className="border-b pb-2 text-lg font-semibold">
                Details of the Activity
              </h3>

              <FormField
                control={form.control}
                name="backgroundPurpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background & Purpose of Activity</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Talk about the objective of the activity. What you planned to do, and the strategies you planned to use in delivering the activity."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progressAchievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Progress of the Activity/Achievement Registered
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Talk about strategies used to deliver the activity, Results/outputs realised from activity carried out, Compare achievements with targets set and add the most talking picture showing success of the activity."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challengesRecommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Challenges Encountered & Recommendations
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What outstanding issues were raised or hindered the progress of the activity? What could be the solutions?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lessonsLearned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lessons Learnt/Best Practices</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mention a new experience that you gained as a result of the challenges encountered, and what was done well."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Follow-up Actions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="border-b pb-2 text-lg font-semibold">
                  Follow-up Actions
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFollowUpAction}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Action
                </Button>
              </div>

              {followUpActions.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <p>No follow-up actions added yet.</p>
                  <p className="mt-1 text-sm">
                    Click "Add Action" to create follow-up actions with action,
                    responsible person, and timeline.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followUpActions.map((action, index) => (
                    <Card key={action.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Action {index + 1}
                            </label>
                            <Input
                              placeholder="Describe the action"
                              value={action.action}
                              onChange={e =>
                                handleUpdateFollowUpAction(
                                  action.id,
                                  "action",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Responsible Person
                            </label>
                            <Input
                              placeholder="Who is responsible"
                              value={action.responsiblePerson}
                              onChange={e =>
                                handleUpdateFollowUpAction(
                                  action.id,
                                  "responsiblePerson",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Timeline
                            </label>
                            <Input
                              placeholder="When should it be done"
                              value={action.timeline}
                              onChange={e =>
                                handleUpdateFollowUpAction(
                                  action.id,
                                  "timeline",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFollowUpAction(action.id)}
                          className="text-destructive hover:text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information Section (Legacy fields) */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold">
                Additional Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="actualCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter actual cost"
                          {...field}
                          onChange={e =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number of participants"
                          {...field}
                          onChange={e =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                Save Report
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
