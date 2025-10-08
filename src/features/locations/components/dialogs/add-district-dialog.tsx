"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDistrict } from "@/features/locations/actions/districts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllCountries } from "@/features/locations/actions/countries";

import type { AddDistrictDialogProps, Country, FormValues } from "./district";
import { formSchema, generateDistrictCode, DistrictForm } from "./district";

export function AddDistrictDialog({
  children,
  countries = [],
}: AddDistrictDialogProps) {
  const router = useRouter();
  const [countryList, setCountryList] = useState<Country[]>(countries);
  const [isLoading, setIsLoading] = useState(countries.length === 0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (countries.length === 0) {
      // Fetch countries if they weren't provided
      const fetchCountries = async () => {
        try {
          const result = await getAllCountries();

          if (
            result &&
            result.success &&
            result.data &&
            Array.isArray(result.data.data)
          ) {
            setCountryList(result.data.data);
          } else {
            console.error("Invalid response from getAllCountries:", result);
            // Use empty array as fallback
            setCountryList([]);
            toast.error("Failed to load countries. Please try again later.");
          }
        } catch (error) {
          console.error("Error fetching countries:", error);
          setCountryList([]);
          toast.error("Error loading countries. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchCountries();
    }
  }, [countries]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      countryId: "",
    },
  });

  // Watch for changes in name and countryId to auto-generate code
  const districtName = form.watch("name");
  const countryId = form.watch("countryId");

  useEffect(() => {
    if (districtName && countryId) {
      const selectedCountry = countryList.find(
        country => country.id === countryId
      );
      if (selectedCountry?.code) {
        const generatedCode = generateDistrictCode(
          selectedCountry.code,
          districtName
        );
        form.setValue("code", generatedCode);
      }
    }
  }, [districtName, countryId, countryList, form]);

  async function onSubmit(values: FormValues) {
    try {
      const result = await addDistrict(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      form.reset();
      toast.success("District added successfully");
      setOpen(false); // Close dialog after successful submission
      router.refresh();
    } catch (error) {
      console.error("Error adding district:", error);
      toast.error("Failed to add district");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add District</DialogTitle>
          <DialogDescription>
            Add a new district to the system.
          </DialogDescription>
        </DialogHeader>
        <DistrictForm
          form={form}
          onSubmit={onSubmit}
          countryList={countryList}
          isLoading={isLoading}
          districtName={districtName}
          countryId={countryId}
        />
      </DialogContent>
    </Dialog>
  );
}
