"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { updateVSLAMember, VSLAMember } from "../../actions/vsla-members";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const enhancedVSLAMemberSchema = z.object({
  // Participant/Personal Information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),

  // VSLA-Specific Information
  role: z.string().min(1, "Role is required"),
  joined_date: z.date({
    required_error: "Joined date is required",
  }),
  total_savings: z.number().min(0, "Total savings must be 0 or greater"),
  total_loans: z.number().min(0, "Total loans must be 0 or greater"),
  status: z.string().min(1, "Status is required"),
});

type EnhancedVSLAMemberFormValues = z.infer<typeof enhancedVSLAMemberSchema>;

interface EnhancedVSLAMemberFormProps {
  member: VSLAMember;
  onSuccess?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export function EnhancedVSLAMemberForm({
  member,
  onSuccess,
  isLoading = false,
  setIsLoading,
}: EnhancedVSLAMemberFormProps) {
  const form = useForm<EnhancedVSLAMemberFormValues>({
    resolver: zodResolver(enhancedVSLAMemberSchema),
    defaultValues: {
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone,
      email: member.email || "",
      role: member.role,
      joined_date: new Date(member.joined_date),
      total_savings: member.total_savings,
      total_loans: member.total_loans,
      status: member.status,
    },
  });

  const onSubmit = async (data: EnhancedVSLAMemberFormValues) => {
    try {
      setIsLoading?.(true);

      const result = await updateVSLAMember(member.id, data);

      if (result.success) {
        toast.success("VSLA member updated successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update VSLA member");
      }
    } catch (error) {
      console.error("Error updating VSLA member:", error);
      toast.error("Failed to update VSLA member");
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* VSLA Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">VSLA Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="role"
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
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="chairperson">Chairperson</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="joined_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Joined Date</FormLabel>
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
        </div>

        <Separator />

        {/* Financial Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Financial Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="total_savings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Savings (UGX)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_loans"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Loans (UGX)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
