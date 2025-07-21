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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ConceptNote, NewConceptNote } from "../../types/types";

const conceptNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  charge_code: z.string().optional(),
  activity_lead: z.string().optional(),
  submission_date: z.date().optional(),
  project_summary: z.string().optional(),
  methodology: z.string().optional(),
  requirements: z.string().optional(),
  participant_details: z.string().optional(),
  budget_notes: z.string().optional(),
});

type ConceptNoteFormData = z.infer<typeof conceptNoteSchema>;

interface ConceptNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  conceptNote?: ConceptNote;
  onSubmit: (data: NewConceptNote) => Promise<void>;
}

export function ConceptNoteDialog({
  open,
  onOpenChange,
  activityId,
  conceptNote,
  onSubmit,
}: ConceptNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ConceptNoteFormData>({
    resolver: zodResolver(conceptNoteSchema),
    defaultValues: {
      title: conceptNote?.title ?? "",
      content: conceptNote?.content ?? "",
      charge_code: conceptNote?.charge_code ?? "",
      activity_lead: conceptNote?.activity_lead ?? "",
      submission_date: conceptNote?.submission_date
        ? new Date(conceptNote.submission_date)
        : undefined,
      project_summary: conceptNote?.project_summary ?? "",
      methodology: conceptNote?.methodology ?? "",
      requirements: conceptNote?.requirements ?? "",
      participant_details: conceptNote?.participant_details ?? "",
      budget_notes: conceptNote?.budget_notes ?? "",
    },
  });

  const handleSubmit = async (data: ConceptNoteFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        activity_id: activityId,
        title: data.title,
        content: data.content,
        charge_code: data.charge_code || null,
        activity_lead: data.activity_lead || null,
        submission_date: data.submission_date || null,
        project_summary: data.project_summary || null,
        methodology: data.methodology || null,
        requirements: data.requirements || null,
        participant_details: data.participant_details || null,
        budget_items: conceptNote?.budget_items ?? [],
        budget_notes: data.budget_notes || null,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving concept note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {conceptNote ? "Edit Concept Note" : "Create Concept Note"}
          </DialogTitle>
          <DialogDescription>
            {conceptNote
              ? "Update the concept note details for this activity."
              : "Create a new concept note for this activity."}
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter concept note title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="charge_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charge Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter charge code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity_lead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Lead</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter activity lead name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submission_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                          disabled={date =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the main content of the concept note..."
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
              name="project_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project summary..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="methodology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodology</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the methodology..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the requirements..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="participant_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter participant details..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter budget notes..."
                      className="min-h-[80px]"
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
                {conceptNote ? "Update" : "Create"} Concept Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
