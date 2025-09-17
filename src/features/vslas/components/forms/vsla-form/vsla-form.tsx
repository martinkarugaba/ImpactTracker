"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import {
  createVSLASchema,
  type CreateVSLAInput,
} from "../../../schemas/vsla-schema";
import { PRIMARY_BUSINESS_OPTIONS, type PrimaryBusiness } from "../../../types";
import { Organization } from "@/features/organizations/types";
import { Cluster } from "@/features/clusters/components/clusters-table";
import { Project } from "@/features/projects/types";
import { createVSLA, updateVSLA } from "../../../actions/vslas";
import {
  getCountryOptions,
  getDistrictOptions,
  getCountyOptions,
  getSubCountyOptions,
  getSubCountyOptionsByDistrict,
  getParishOptions,
  getVillageOptions,
  getRegionOptions,
  type DropdownOption,
} from "@/features/locations/actions/dropdown-options";
import { toast } from "sonner";

// Helper function to convert DropdownOption to ComboboxOption
const toComboboxOptions = (options: DropdownOption[]): ComboboxOption[] => {
  return options.map(option => ({
    value: option.id,
    label: option.name,
  }));
};

interface VSLAFormProps {
  organizations: Organization[];
  clusters: Cluster[];
  projects: Project[];
  defaultOrganizationId?: string;
  defaultClusterId?: string;
  defaultProjectId?: string;
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialData?: CreateVSLAInput & { id?: string };
}

export function VSLAForm({
  organizations,
  clusters,
  projects,
  defaultOrganizationId,
  defaultClusterId,
  defaultProjectId,
  onSuccess,
  isLoading,
  setIsLoading,
  initialData,
}: VSLAFormProps) {
  // Location dropdown state
  const [countryOptions, setCountryOptions] = useState<DropdownOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<DropdownOption[]>([]);
  const [regionOptions, setRegionOptions] = useState<DropdownOption[]>([]);
  const [countyOptions, setCountyOptions] = useState<DropdownOption[]>([]);
  const [subCountyOptions, setSubCountyOptions] = useState<DropdownOption[]>(
    []
  );
  const [parishOptions, setParishOptions] = useState<DropdownOption[]>([]);
  const [villageOptions, setVillageOptions] = useState<DropdownOption[]>([]);

  const form = useForm<CreateVSLAInput>({
    resolver: zodResolver(createVSLASchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      description: "",
      primary_business: "Agriculture",
      primary_business_other: "",
      organization_id: defaultOrganizationId || "",
      cluster_id:
        defaultClusterId || (clusters.length === 1 ? clusters[0].id : ""),
      project_id: defaultProjectId || "",
      country: "",
      region: "",
      district: "",
      county: "",
      sub_county: "",
      parish: "",
      village: "",
      address: "",
      total_members: 0,
      total_savings: 0,
      total_loans: 0,
      meeting_frequency: "",
      meeting_day: "",
      meeting_time: "",
      meeting_location: "",
      formation_date: new Date(),
      closing_date: undefined,
      lc1_chairperson_name: "",
      lc1_chairperson_contact: "",
      has_constitution: "no",
      has_signed_constitution: "no",
      bank_name: "",
      bank_branch: "",
      bank_account_number: "",
      registration_certificate_number: "",
      sacco_member: "no",
      notes: "",
      status: "active",
    },
  });

  // Load initial country options
  useEffect(() => {
    const loadCountries = async () => {
      const result = await getCountryOptions();
      if (result.success) {
        setCountryOptions(result.data);
      }
    };
    loadCountries();
  }, []);

  // Handle country change
  const handleCountryChange = async (countryId: string) => {
    form.setValue("country", countryId);

    // Reset dependent fields
    form.setValue("region", "");
    form.setValue("district", "");
    form.setValue("county", "");
    form.setValue("sub_county", "");
    form.setValue("parish", "");
    form.setValue("village", "");

    // Clear dependent options
    setRegionOptions([]);
    setDistrictOptions([]);
    setCountyOptions([]);
    setSubCountyOptions([]);
    setParishOptions([]);
    setVillageOptions([]);

    // Load regions and districts for selected country
    const [regionResult, districtResult] = await Promise.all([
      getRegionOptions(countryId),
      getDistrictOptions(countryId),
    ]);

    if (regionResult.success) {
      setRegionOptions(regionResult.data);
    }
    if (districtResult.success) {
      setDistrictOptions(districtResult.data);
    }
  };

  // Handle district change
  const handleDistrictChange = async (districtId: string) => {
    form.setValue("district", districtId);

    // Reset dependent fields
    form.setValue("county", "");
    form.setValue("sub_county", "");
    form.setValue("parish", "");
    form.setValue("village", "");

    // Clear dependent options
    setCountyOptions([]);
    setSubCountyOptions([]);
    setParishOptions([]);
    setVillageOptions([]);

    // Load both counties and subcounties for selected district
    const [countyResult, subCountyResult] = await Promise.all([
      getCountyOptions(districtId),
      getSubCountyOptionsByDistrict(districtId),
    ]);

    if (countyResult.success) {
      setCountyOptions(countyResult.data);
    }

    if (subCountyResult.success) {
      setSubCountyOptions(subCountyResult.data);
    }
  };

  // Handle county change
  const handleCountyChange = async (countyId: string) => {
    form.setValue("county", countyId);

    // Reset dependent fields
    form.setValue("sub_county", "");
    form.setValue("parish", "");
    form.setValue("village", "");

    // Clear dependent options
    setSubCountyOptions([]);
    setParishOptions([]);
    setVillageOptions([]);

    // Load sub-counties for selected county (alternative approach)
    const result = await getSubCountyOptions(countyId);
    if (result.success) {
      setSubCountyOptions(result.data);
    }
  };

  // Handle sub-county change
  const handleSubCountyChange = async (subCountyId: string) => {
    form.setValue("sub_county", subCountyId);

    // Reset dependent fields
    form.setValue("parish", "");
    form.setValue("village", "");

    // Clear dependent options
    setParishOptions([]);
    setVillageOptions([]);

    // Load parishes for selected sub-county
    const result = await getParishOptions(subCountyId);
    if (result.success) {
      setParishOptions(result.data);
    }
  };

  // Handle parish change
  const handleParishChange = async (parishId: string) => {
    form.setValue("parish", parishId);

    // Reset dependent fields
    form.setValue("village", "");

    // Clear dependent options
    setVillageOptions([]);

    // Load villages for selected parish
    const result = await getVillageOptions(parishId);
    if (result.success) {
      setVillageOptions(result.data);
    }
  };

  const onSubmit = async (data: CreateVSLAInput) => {
    setIsLoading(true);
    try {
      let result;

      if (initialData?.id) {
        // Update existing VSLA
        result = await updateVSLA(initialData.id, data);
        if (result.success) {
          toast.success("VSLA updated successfully!");
        } else {
          toast.error(result.error || "Failed to update VSLA");
        }
      } else {
        // Create new VSLA
        result = await createVSLA(data);
        if (result.success) {
          toast.success("VSLA created successfully!");
        } else {
          toast.error(result.error || "Failed to create VSLA");
        }
      }

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting VSLA:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <p className="text-muted-foreground text-sm">
              Basic details about the VSLA group
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter VSLA group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VSLA Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unique VSLA code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primary_business"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Business *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary business" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIMARY_BUSINESS_OPTIONS.map(
                        (business: PrimaryBusiness) => (
                          <SelectItem key={business} value={business}>
                            {business}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("primary_business") === "Others" && (
              <FormField
                control={form.control}
                name="primary_business_other"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Other Business *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Specify the business type"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
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
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter VSLA description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Organization/Project References */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Organization & Project</h3>
            <p className="text-muted-foreground text-sm">
              Link this VSLA to organization and project
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(organizations || []).map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.acronym}
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
              name="cluster_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cluster *</FormLabel>
                  {clusters.length === 1 ? (
                    // If only one cluster (user's cluster), show as readonly
                    <FormControl>
                      <Input
                        value={clusters[0].name}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                  ) : (
                    // If multiple clusters, show as select
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
                        {(clusters || []).map(cluster => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project *</FormLabel>
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
                      {(projects || []).map(project => (
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
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Location Information</h3>
            <p className="text-muted-foreground text-sm">
              Administrative location details
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={toComboboxOptions(countryOptions)}
                      value={field.value}
                      onValueChange={handleCountryChange}
                      placeholder="Select country"
                      emptyMessage="No countries found."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Combobox
                      options={toComboboxOptions(regionOptions)}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select region"
                      emptyMessage="No regions found."
                      disabled={regionOptions.length === 0}
                    />
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
                  <FormLabel>District *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={toComboboxOptions(districtOptions)}
                      value={field.value}
                      onValueChange={handleDistrictChange}
                      placeholder="Select district"
                      emptyMessage="No districts found."
                      disabled={districtOptions.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
                  <FormControl>
                    <Combobox
                      options={toComboboxOptions(countyOptions)}
                      value={field.value}
                      onValueChange={handleCountyChange}
                      placeholder={
                        districtOptions.length === 0
                          ? "Select a district first"
                          : countyOptions.length === 0
                            ? "No counties available"
                            : "Select county"
                      }
                      emptyMessage="No counties found."
                      disabled={countyOptions.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sub_county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcounty *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={toComboboxOptions(subCountyOptions)}
                      value={field.value}
                      onValueChange={handleSubCountyChange}
                      placeholder={
                        districtOptions.length === 0
                          ? "Select a district first"
                          : subCountyOptions.length === 0
                            ? "No subcounties available"
                            : "Select subcounty"
                      }
                      emptyMessage="No subcounties found."
                      disabled={subCountyOptions.length === 0}
                    />
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
                    <Combobox
                      options={toComboboxOptions(parishOptions)}
                      value={field.value}
                      onValueChange={handleParishChange}
                      placeholder={
                        subCountyOptions.length === 0
                          ? "Select a sub-county first"
                          : parishOptions.length === 0
                            ? "No parishes available"
                            : "Select parish"
                      }
                      emptyMessage="No parishes found."
                      disabled={parishOptions.length === 0}
                    />
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
                    <Combobox
                      options={toComboboxOptions(villageOptions)}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        parishOptions.length === 0
                          ? "Select a parish first"
                          : villageOptions.length === 0
                            ? "No villages available"
                            : "Select village"
                      }
                      emptyMessage="No villages found."
                      disabled={villageOptions.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter physical address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Important Dates</h3>
            <p className="text-muted-foreground text-sm">
              Formation and closing dates
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="formation_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Formation Date *</FormLabel>
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
                            <span>Pick formation date</span>
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

            <FormField
              control={form.control}
              name="closing_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Closing Date</FormLabel>
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
                            <span>Pick closing date (optional)</span>
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
                        disabled={date => date < new Date("1900-01-01")}
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

        {/* Meeting Information */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Meeting Information</h3>
            <p className="text-muted-foreground text-sm">
              Meeting schedule and location details
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="meeting_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Frequency *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Day</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meeting venue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Local Leadership */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Local Leadership</h3>
            <p className="text-muted-foreground text-sm">
              LC1 Chairperson information
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="lc1_chairperson_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LC1 Chairperson Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter LC1 chairperson name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lc1_chairperson_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LC1 Chairperson Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact information" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Governance */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Governance</h3>
            <p className="text-muted-foreground text-sm">
              Constitution and governance information
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="has_constitution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VSLA has a constitution *</FormLabel>
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
              name="has_signed_constitution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VSLA has a signed constitution *</FormLabel>
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
        </div>

        {/* Banking Information */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Banking Information</h3>
            <p className="text-muted-foreground text-sm">
              Bank account and registration details
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Branch</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank branch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registration_certificate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Certificate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter certificate number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SACCO Information */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">SACCO Information</h3>
            <p className="text-muted-foreground text-sm">
              SACCO membership details
            </p>
          </div>

          <FormField
            control={form.control}
            name="sacco_member"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SACCO Member *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-48">
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

        {/* Financial Summary */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Financial Summary</h3>
            <p className="text-muted-foreground text-sm">
              Current financial status (usually auto-calculated)
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="total_members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Members</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_savings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Savings</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
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
                  <FormLabel>Total Loans</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <p className="text-muted-foreground text-sm">
              Notes and additional comments
            </p>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes or comments"
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 border-t pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData?.id
                ? "Update VSLA"
                : "Create VSLA"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
