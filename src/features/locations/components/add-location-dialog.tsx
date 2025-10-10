"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createCountry,
  createDistrict,
  createSubCounty,
  createParish,
  createVillage,
} from "../actions/administrative-units";
import { getParentOptions } from "../actions/get-parent-options";
import type { LocationType } from "./columns";
import {
  getDistrictById,
  getSubCountyById,
  getParishById,
  findDefaultCountyForDistrict,
} from "../actions/location-details";

const formSchema = z.object({
  type: z.enum(["country", "district", "subcounty", "parish", "village"]),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  parentId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ParentOption {
  id: string;
  name: string;
}

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}

export function AddLocationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddLocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "country",
      name: "",
      code: "",
    },
  });

  const locationType = form.watch("type");

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setParentOptions([]);
    }
  }, [open, form]);

  // Load parent options when location type changes
  useEffect(() => {
    async function loadParentOptions() {
      if (locationType === "country") {
        setParentOptions([]);
        return;
      }

      try {
        const result = await getParentOptions(locationType as LocationType);
        if (result.success && result.data) {
          setParentOptions(result.data);
        }
      } catch (error) {
        console.error("Error loading parent options:", error);
        toast.error("Failed to load parent options");
      }
    }

    loadParentOptions();
  }, [locationType]);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      let result;

      switch (data.type) {
        case "country":
          result = await createCountry({ name: data.name, code: data.code });
          break;
        case "district":
          if (!data.parentId) {
            toast.error("Please select a country");
            return;
          }
          result = await createDistrict({
            name: data.name,
            code: data.code,
            countryId: data.parentId,
          });
          break;
        case "subcounty":
          if (!data.parentId) {
            toast.error("Please select a district");
            return;
          }

          // Get district details
          const districtResult = await getDistrictById(data.parentId);
          if (!districtResult.success || !districtResult.data) {
            toast.error("Failed to get district details");
            return;
          }

          // Get default county for this district
          const countyResult = await findDefaultCountyForDistrict(
            data.parentId
          );
          // Make sure countyResult.data exists and has an id property
          const countyId =
            countyResult.success && countyResult.data
              ? countyResult.data.id
              : "";

          result = await createSubCounty({
            name: data.name,
            code: data.code,
            districtId: data.parentId,
            countryId: districtResult.data.country_id,
            countyId: countyId,
          });
          break;
        case "parish":
          if (!data.parentId) {
            toast.error("Please select a sub-county");
            return;
          }

          // Get the sub-county details
          const subCountyResult = await getSubCountyById(data.parentId);
          if (!subCountyResult.success || !subCountyResult.data) {
            toast.error("Failed to get sub-county details");
            return;
          }

          result = await createParish({
            name: data.name,
            code: data.code,
            subCountyId: data.parentId,
            districtId: subCountyResult.data.district_id,
            countyId: subCountyResult.data.county_id,
            countryId: subCountyResult.data.country_id,
          });
          break;
        case "village":
          if (!data.parentId) {
            toast.error("Please select a parish");
            return;
          }

          // Get the parish details
          const parishResult = await getParishById(data.parentId);
          if (!parishResult.success || !parishResult.data) {
            toast.error("Failed to get parish details");
            return;
          }

          result = await createVillage({
            name: data.name,
            code: data.code,
            parishId: data.parentId,
            subCountyId: parishResult.data.sub_county_id,
            countyId: parishResult.data.county_id,
            districtId: parishResult.data.district_id,
            countryId: parishResult.data.country_id,
          });
          break;
      }

      if (result?.success) {
        toast.success("Location added successfully");
        onOpenChange(false);
        form.reset();
        await onSuccess?.();
      } else {
        toast.error(result?.error || "Failed to add location");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value);
                      // Reset parentId when type changes
                      form.setValue("parentId", undefined);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="subcounty">Sub-County</SelectItem>
                      <SelectItem value="parish">Parish</SelectItem>
                      <SelectItem value="village">Village</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {locationType !== "country" && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {locationType === "district" && "Country"}
                      {locationType === "subcounty" && "District"}
                      {locationType === "parish" && "Sub-County"}
                      {locationType === "village" && "Parish"}
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select parent ${locationType === "district" ? "country" : locationType === "subcounty" ? "district" : locationType === "parish" ? "sub-county" : "parish"}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
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
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Location"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
