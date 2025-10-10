"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ActivityParticipant } from "../../types/types";

const feedbackFormSchema = z.object({
  relevance: z.enum(
    ["very_relevant", "relevant", "somewhat_relevant", "not_relevant"],
    {
      required_error: "Please rate the relevance of the training",
    }
  ),
  usefulness: z.enum(
    ["very_useful", "useful", "somewhat_useful", "not_useful"],
    {
      required_error: "Please rate the usefulness of the training",
    }
  ),
  comments: z.string().optional(),
  wouldRecommend: z.enum(["yes", "no"], {
    required_error: "Please indicate if you would recommend this training",
  }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface ParticipantFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ActivityParticipant;
  activityTitle?: string;
  onSubmit: (
    participantId: string,
    feedback: FeedbackFormValues
  ) => Promise<void>;
}

const relevanceOptions = [
  {
    value: "very_relevant",
    label: "Very Relevant",
    description: "Extremely applicable to my needs",
  },
  {
    value: "relevant",
    label: "Relevant",
    description: "Applicable to my needs",
  },
  {
    value: "somewhat_relevant",
    label: "Somewhat Relevant",
    description: "Partially applicable",
  },
  {
    value: "not_relevant",
    label: "Not Relevant",
    description: "Not applicable to my needs",
  },
];

const usefulnessOptions = [
  {
    value: "very_useful",
    label: "Very Useful",
    description: "Extremely helpful and practical",
  },
  { value: "useful", label: "Useful", description: "Helpful and practical" },
  {
    value: "somewhat_useful",
    label: "Somewhat Useful",
    description: "Partially helpful",
  },
  {
    value: "not_useful",
    label: "Not Useful",
    description: "Not helpful or practical",
  },
];

export function ParticipantFeedbackDialog({
  open,
  onOpenChange,
  participant,
  activityTitle,
  onSubmit,
}: ParticipantFeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      relevance: undefined,
      usefulness: undefined,
      comments: "",
      wouldRecommend: undefined,
    },
  });

  const handleSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(participant.participant_id, data);
      toast.success("Feedback submitted successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to submit feedback");
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const participantName = participant.participantName || "Unknown Participant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Training Feedback - {participantName}
          </DialogTitle>
          <DialogDescription>
            {activityTitle && (
              <span className="font-medium">Activity: {activityTitle}</span>
            )}
            <br />
            Please provide feedback about the training experience from the
            participant's perspective.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              {/* Relevance Rating */}
              <FormField
                control={form.control}
                name="relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-600" />
                      How relevant was this training to the participant's needs?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relevance rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relevanceOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {option.label}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usefulness Rating */}
              <FormField
                control={form.control}
                name="usefulness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-600" />
                      How useful was this training for the participant?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select usefulness rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usefulnessOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {option.label}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recommendation */}
              <FormField
                control={form.control}
                name="wouldRecommend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Would the participant recommend this training?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recommendation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">
                          <div className="flex flex-col">
                            <span className="font-medium">Yes</span>
                            <span className="text-muted-foreground text-xs">
                              Would recommend to others
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="no">
                          <div className="flex flex-col">
                            <span className="font-medium">No</span>
                            <span className="text-muted-foreground text-xs">
                              Would not recommend
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Comments */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional feedback, suggestions, or comments from the participant..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
