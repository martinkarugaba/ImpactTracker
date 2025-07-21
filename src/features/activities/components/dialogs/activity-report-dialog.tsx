"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { Activity } from "../../types/types";

const activityReportSchema = z.object({
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
  onSubmit: (data: Partial<Activity>) => Promise<void>;
}

export function ActivityReportDialog({
  open,
  onOpenChange,
  activity,
  onSubmit,
}: ActivityReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ActivityReportFormData>({
    resolver: zodResolver(activityReportSchema),
    defaultValues: {
      outcomes: activity.outcomes ?? "",
      challenges: activity.challenges ?? "",
      recommendations: activity.recommendations ?? "",
      actualCost: activity.actualCost ?? undefined,
      numberOfParticipants: activity.numberOfParticipants ?? undefined,
    },
  });

  const handleSubmit = async (data: ActivityReportFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        id: activity.id,
        outcomes: data.outcomes || null,
        challenges: data.challenges || null,
        recommendations: data.recommendations || null,
        actualCost: data.actualCost || null,
        numberOfParticipants: data.numberOfParticipants || null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving activity report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Report</DialogTitle>
          <DialogDescription>
            Update the report details for "{activity.title}".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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
                            e.target.value ? Number(e.target.value) : undefined
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
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="outcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcomes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the outcomes of the activity..."
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
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenges</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any challenges faced during the activity..."
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
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide recommendations for future activities..."
                      className="min-h-[120px]"
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
                Save Report
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
