import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Training, NewTraining } from "../types/types";
import { createTraining, updateTraining } from "../actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Define status type for better type safety
type TrainingStatus = "pending" | "completed" | "cancelled";

const trainingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  conceptNote: z.string().nullable(),
  activityReport: z.string().nullable(),
  trainingDate: z.string().min(1, "Training date is required"),
  venue: z.string().min(1, "Venue is required"),
  budget: z.string().nullable(),
  organization_id: z.string().min(1, "Organization is required"),
  cluster_id: z.string().min(1, "Cluster is required"),
  project_id: z.string().min(1, "Project is required"),
  status: z.enum(["pending", "completed", "cancelled"]),
});

// Extract type from schema
type TrainingFormValues = z.infer<typeof trainingFormSchema>;

interface TrainingFormProps {
  clusterId: string;
  organizationId: string;
  projectId: string;
  initialData?: Training;
  onSubmit?: (values: TrainingFormValues) => Promise<void>;
}

export function TrainingForm({
  clusterId,
  organizationId,
  projectId,
  initialData,
  onSubmit: externalOnSubmit,
}: TrainingFormProps) {
  const router = useRouter();

  // Fix the form initialization
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? null,
      conceptNote: initialData?.conceptNote ?? null,
      activityReport: initialData?.activityReport ?? null,
      trainingDate: initialData
        ? new Date(initialData.trainingDate).toISOString().split("T")[0]
        : "",
      venue: initialData?.venue ?? "",
      budget: initialData?.budget?.toString() ?? null,
      cluster_id: clusterId,
      organization_id: organizationId,
      project_id: projectId,
      status: (initialData?.status as TrainingStatus) ?? "pending",
    },
  });

  async function onSubmit(values: TrainingFormValues) {
    if (externalOnSubmit) {
      // Use the external submit handler if provided
      await externalOnSubmit(values);
      return;
    }

    // Otherwise use the default implementation
    try {
      const formData: NewTraining = {
        name: values.name,
        description: values.description,
        conceptNote: values.conceptNote,
        activityReport: values.activityReport,
        trainingDate: new Date(values.trainingDate),
        venue: values.venue,
        budget: values.budget ? parseInt(values.budget) : null,
        organization_id: values.organization_id,
        cluster_id: values.cluster_id,
        project_id: values.project_id,
        status: values.status,
      };

      const result = initialData
        ? await updateTraining(initialData.id, formData)
        : await createTraining(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(initialData ? "Training updated" : "Training created");
      router.push("/dashboard/trainings");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter training name" {...field} />
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
                  placeholder="Enter training description"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conceptNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concept Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter concept note"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activityReport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Report</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter activity report"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trainingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <Input placeholder="Enter venue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter budget"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full cursor-pointer">
          {initialData ? "Update Training" : "Create Training"}
        </Button>
      </form>
    </Form>
  );
}
