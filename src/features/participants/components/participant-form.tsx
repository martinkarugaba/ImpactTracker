"use client";

import * as React from "react";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import toast from "react-hot-toast";
import { type Project } from "@/features/projects/types";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationId } from "@/features/auth/actions";
import { getCurrentOrganizationWithCluster } from "@/features/organizations/actions/organizations";

const formSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    country: z.string().min(2, "Country is required"),
    district: z.string().min(2, "District is required"),
    subCounty: z.string().min(2, "Sub-county is required"), // We keep this as a single string for the form
    parish: z.string().min(2, "Parish is required"),
    village: z.string().min(2, "Village is required"),
    sex: z.enum(["male", "female", "other"]),
    age: z.string().optional(), // Made optional since it can be calculated from dateOfBirth
    dateOfBirth: z.string().optional(),
    isPWD: z.enum(["yes", "no"]),
    isMother: z.enum(["yes", "no"]),
    isRefugee: z.enum(["yes", "no"]),
    designation: z.string().min(2, "Designation is required"),
    enterprise: z.string().min(2, "Enterprise is required"),
    contact: z.string().min(10, "Contact must be at least 10 characters"),
    project_id: z.string().min(1, "Project is required"),
    cluster_id: z.string().min(1, "Cluster is required"),
    organization_id: z.string().min(1, "Organization is required"),
    noOfTrainings: z.string().min(0),
    isActive: z.enum(["yes", "no"]),
    isPermanentResident: z.enum(["yes", "no"]),
    areParentsAlive: z.enum(["yes", "no"]),
    numberOfChildren: z.string().min(0),
    employmentStatus: z.string(),
    monthlyIncome: z.string(),
    mainChallenge: z.string().optional(),
    skillOfInterest: z.string().optional(),
    expectedImpact: z.string().optional(),
    isWillingToParticipate: z.enum(["yes", "no"]),
  })
  .refine(
    data => {
      // Require at least one of age or dateOfBirth
      const hasAge = data.age && data.age.trim() !== "";
      const hasDateOfBirth = data.dateOfBirth && data.dateOfBirth.trim() !== "";
      return hasAge || hasDateOfBirth;
    },
    {
      message: "Either age or date of birth is required",
      path: ["age"], // This will show the error on the age field
    }
  );

export type ParticipantFormValues = z.infer<typeof formSchema>;

interface ParticipantFormProps {
  initialData?: ParticipantFormValues;
  onSubmit: (data: ParticipantFormValues) => Promise<void>;
  isLoading?: boolean;
  projects: Project[];
  clusterId?: string;
}

export function ParticipantForm({
  initialData,
  onSubmit,
  isLoading,
  projects,
  clusterId: propClusterId,
}: ParticipantFormProps) {
  const { data: organizationId } = useQuery({
    queryKey: ["organizationId"],
    queryFn: getOrganizationId,
  });

  // Add a local Organization type for use in this file
  interface Organization {
    id: string;
    name: string;
    acronym: string;
    cluster_id: string | null;
    project_id: string | null;
    country: string;
    district: string;
    sub_county_id: string;
    operation_sub_counties?: string[];
    parish: string;
    village: string;
    address: string;
    created_at: Date | null;
    updated_at: Date | null;
    cluster: {
      id: string;
      name: string;
    } | null;
    project: {
      id: string;
      name: string;
      acronym: string;
    } | null;
  }

  const { data: organizationData } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      // Fetch only the current organization with its cluster
      const currentOrgResult =
        await getCurrentOrganizationWithCluster(organizationId);
      if (!currentOrgResult.success || !currentOrgResult.data) {
        console.error("Failed to fetch organization:", currentOrgResult.error);
        return null;
      }

      // Convert to our local Organization type
      const orgData = currentOrgResult.data;
      const currentOrg: Organization = {
        id: orgData.id,
        name: orgData.name,
        acronym: orgData.acronym,
        cluster_id: orgData.cluster_id,
        project_id: orgData.project_id,
        country: orgData.country,
        district: orgData.district,
        sub_county_id: orgData.sub_county_id,
        operation_sub_counties: orgData.operation_sub_counties,
        parish: orgData.parish,
        village: orgData.village,
        address: orgData.address,
        created_at: orgData.created_at,
        updated_at: orgData.updated_at,
        cluster: orgData.cluster,
        project: orgData.project,
      };

      return {
        currentOrg,
        currentClusterId: currentOrg.cluster_id || propClusterId,
      };
    },
    enabled: !!organizationId,
  });

  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      country: "",
      district: "",
      subCounty: "",
      parish: "",
      village: "",
      sex: "male",
      age: "",
      isPWD: "no",
      isMother: "no",
      isRefugee: "no",
      noOfTrainings: "0",
      isActive: "yes",
      designation: "",
      enterprise: "",
      contact: "",
      project_id: "",
      organization_id: "",
      // Add defaults for new fields
      isPermanentResident: "no",
      areParentsAlive: "no",
      numberOfChildren: "0",
      employmentStatus: "unemployed",
      monthlyIncome: "0",
      mainChallenge: "",
      skillOfInterest: "",
      expectedImpact: "",
      isWillingToParticipate: "yes",
    },
  });

  // Set organization_id and cluster_id when organization data is available
  useEffect(() => {
    if (organizationData?.currentOrg) {
      form.setValue("organization_id", organizationData.currentOrg.id);
      if (organizationData.currentOrg.cluster_id) {
        form.setValue("cluster_id", organizationData.currentOrg.cluster_id);
      }
    }
  }, [organizationData, form]);

  const handleSubmit = async (data: ParticipantFormValues) => {
    const toastId = toast.loading("Processing...");
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
      toast.success(
        initialData
          ? "Participant updated successfully"
          : "Participant created successfully",
        { id: toastId }
      );
    } catch {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="organization_id"
            render={({ field }) => {
              // Directly set values based on current data instead of useEffect
              if (organizationData?.currentOrg && !field.value) {
                // Use setTimeout to defer the state update
                setTimeout(() => {
                  field.onChange(organizationData.currentOrg.id);
                  if (organizationData.currentOrg.cluster_id) {
                    form.setValue(
                      "cluster_id",
                      organizationData.currentOrg.cluster_id
                    );
                  }
                }, 0);
              }

              return (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input
                      value={organizationData?.currentOrg?.name || "Loading..."}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
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
                        {project.acronym}
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Input placeholder="District" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subCounty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub County</FormLabel>
                <FormControl>
                  <Input placeholder="Sub County" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parish"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parish</FormLabel>
                <FormControl>
                  <Input placeholder="Parish" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="village"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Village</FormLabel>
                <FormControl>
                  <Input placeholder="Village" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPWD"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Person with Disability</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isMother"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isRefugee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refugee</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noOfTrainings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of Trainings</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of trainings"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active Status</FormLabel>
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
                    <SelectItem value="yes">Active</SelectItem>
                    <SelectItem value="no">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="enterprise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enterprise</FormLabel>
                <FormControl>
                  <Input placeholder="Enterprise" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* New fields */}
          <FormField
            control={form.control}
            name="isPermanentResident"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permanent Resident</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="areParentsAlive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Both Parents Alive</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfChildren"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Children</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of children"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status</FormLabel>
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
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self-employed">Self-employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Income (UGX)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Monthly income"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mainChallenge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Challenge</FormLabel>
                <FormControl>
                  <Input placeholder="Main challenge" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skillOfInterest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill of Interest</FormLabel>
                <FormControl>
                  <Input placeholder="Skill of interest" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedImpact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Impact</FormLabel>
                <FormControl>
                  <Input placeholder="Expected impact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isWillingToParticipate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Willing to Participate</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full cursor-pointer text-center"
          disabled={isLoading}
        >
          {isLoading
            ? "Submitting..."
            : initialData
              ? "Update Participant"
              : "Add Participant"}
        </Button>
      </form>
    </Form>
  );
}
