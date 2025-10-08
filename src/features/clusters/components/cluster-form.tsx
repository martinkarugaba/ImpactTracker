"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createCluster, updateCluster } from "../actions/clusters";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  about: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  districts: z.string().min(1, "At least one district is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ClusterFormProps {
  initialData?: {
    id: string;
    name: string;
    about: string | null;
    country: string;
    districts: string[];
  };
  onSuccess?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export function ClusterForm({
  initialData,
  onSuccess,
  isLoading = false,
  setIsLoading,
}: ClusterFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      about: initialData?.about || "",
      country: initialData?.country || "",
      districts: initialData?.districts.join(", ") || "",
    },
  });

  async function onSubmit(data: FormValues) {
    if (setIsLoading) setIsLoading(true);

    try {
      const clusterData = {
        ...data,
        districts: data.districts.split(",").map(d => d.trim()),
      };

      if (initialData) {
        const result = await updateCluster({
          id: initialData.id,
          ...clusterData,
        });
        if (!result.success) throw new Error(result.error);
        toast.success("Cluster updated successfully");
      } else {
        const result = await createCluster(clusterData);
        if (!result.success) throw new Error(result.error);
        toast.success("Cluster created successfully");
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter cluster name"
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
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">About</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this cluster"
                      className="min-h-[120px] resize-none rounded-lg border-gray-300 text-base focus:border-black focus:ring-black"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Country
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter country"
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
                name="districts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Districts
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="District 1, District 2, District 3"
                        {...field}
                        disabled={isLoading}
                        className="h-12 rounded-lg border-gray-300 text-base focus:border-black focus:ring-black"
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-500">
                      Separate districts with commas
                    </FormDescription>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-200 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full cursor-pointer rounded-lg bg-black px-6 text-base font-medium text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Cluster"
              ) : (
                "Create Cluster"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
