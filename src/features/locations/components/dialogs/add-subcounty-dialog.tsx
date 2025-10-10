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
import { addSubCounty } from "@/features/locations/actions/subcounties";
import { getCountries } from "@/features/locations/actions/countries";
import { getDistricts } from "@/features/locations/actions/districts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubCountyForm } from "./subcounty/subcounty-form";
import type { Country, District } from "./subcounty/schema";
import type { FormValues } from "./subcounty/schema";
import { formSchema } from "./subcounty/schema";

interface AddSubCountyDialogProps {
  children: React.ReactNode;
  countries?: Country[];
}

export function AddSubCountyDialog({
  children,
  countries = [],
}: AddSubCountyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [countryList, setCountryList] = useState<Country[]>(countries);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      countryId: "",
      districtId: "",
    },
  });

  const { watch, setValue } = form;
  const selectedCountryId = watch("countryId");
  const selectedDistrictId = watch("districtId");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const result = await getCountries();
        if (result.success && result.data?.data) {
          setCountryList(result.data.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        toast.error("Failed to load countries");
      }
    };

    if (countries.length === 0) {
      fetchCountries();
    }
  }, [countries]);

  useEffect(() => {
    if (selectedCountryId) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        try {
          const result = await getDistricts({ countryId: selectedCountryId });
          if (result.success && result.data?.data) {
            setDistrictList(result.data.data);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
          toast.error("Failed to load districts");
        } finally {
          setIsLoadingDistricts(false);
        }
      };

      const country = countryList.find(c => c.id === selectedCountryId);
      setSelectedCountry(country || null);
      fetchDistricts();
    } else {
      setDistrictList([]);
      setSelectedCountry(null);
    }
  }, [selectedCountryId, countryList]);

  useEffect(() => {
    if (selectedDistrictId) {
      const district = districtList.find(d => d.id === selectedDistrictId);
      setSelectedDistrict(district || null);
    } else {
      setSelectedDistrict(null);
    }
  }, [selectedDistrictId, districtList]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const result = await addSubCounty(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      form.reset();
      toast.success("Sub-county added successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding sub-county:", error);
      toast.error("Failed to add sub-county");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (countryId: string) => {
    setValue("countryId", countryId);
    setValue("districtId", ""); // Reset district when country changes
  };

  const handleDistrictSelect = (districtId: string) => {
    setValue("districtId", districtId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sub County</DialogTitle>
          <DialogDescription>
            Add a new sub county to the system.
          </DialogDescription>
        </DialogHeader>
        <SubCountyForm
          form={form}
          onSubmit={handleSubmit}
          countryList={countryList}
          districtList={districtList}
          isLoading={isLoading || isLoadingDistricts}
          subcountyName={watch("name")}
          countryCode={selectedCountry?.code || ""}
          districtCode={selectedDistrict?.code || ""}
          onCountrySelect={handleCountrySelect}
          onDistrictSelect={handleDistrictSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
