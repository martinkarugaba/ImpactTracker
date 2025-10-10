"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createProject, updateProject } from "../actions/projects";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "../types";
import { DatePicker } from "@/components/ui/date-picker";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  acronym: z.string().min(1, "Acronym is required"),
  description: z.string().nullable(),
  status: z.enum(["active", "completed", "on-hold"]),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  initialData?: Project;
  onSuccess?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export function ProjectForm({
  initialData,
  onSuccess,
  isLoading = false,
  setIsLoading,
}: ProjectFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      acronym: initialData?.acronym || "",
      description: initialData?.description || null,
      status: initialData?.status || "active",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : null,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : null,
    },
  });

  async function onSubmit(values: FormValues) {
    if (setIsLoading) setIsLoading(true);

    try {
      if (initialData) {
        const result = await updateProject(initialData.id, values);
        if (!result.success) throw new Error(result.error);
        toast.success("Project updated successfully");
      } else {
        const result = await createProject(values);
        if (!result.success) throw new Error(result.error);
        toast.success("Project created successfully");
      }

      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    {...field}
                    disabled={isLoading}
                    className="h-12 rounded-lg border-gray-300 text-base focus:border-black focus:ring-black"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acronym"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Acronym</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project acronym"
                    {...field}
                    disabled={isLoading}
                    className="h-12 rounded-lg border-gray-300 text-base focus:border-black focus:ring-black"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Description
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project description (optional)"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value || null)}
                    disabled={isLoading}
                    className="h-12 rounded-lg border-gray-300 text-base focus:border-black focus:ring-black"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-lg border-gray-300 text-base focus:border-black focus:ring-black">
                      <SelectValue placeholder="Select project status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base font-medium">
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={date => {
                        field.onChange(date);
                        form.setValue("startDate", date);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base font-medium">
                    End Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={date => {
                        field.onChange(date);
                        form.setValue("endDate", date);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-200 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 flex-1 rounded-lg bg-black text-base font-medium text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
