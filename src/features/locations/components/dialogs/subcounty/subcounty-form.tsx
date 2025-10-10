"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { Country, District, FormValues } from "./schema";
import { NameInput } from "./name-input";
import { CountrySelector } from "./country-selector";
import { DistrictSelector } from "./district-selector";
import { CodeInput } from "./code-input";

interface SubCountyFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  countryList: Country[];
  districtList: District[];
  isLoading: boolean;
  subcountyName: string;
  countryCode: string;
  districtCode: string;
  onCountrySelect: (value: string) => void;
  onDistrictSelect: (value: string) => void;
}

export function SubCountyForm({
  form,
  onSubmit,
  countryList,
  districtList,
  isLoading,
  subcountyName,
  countryCode,
  districtCode,
  onCountrySelect,
  onDistrictSelect,
}: SubCountyFormProps) {
  const selectedCountryId = form.watch("countryId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <NameInput form={form} />
        <CountrySelector
          form={form}
          countryList={countryList}
          isLoading={isLoading}
          onSelect={onCountrySelect}
        />
        <DistrictSelector
          form={form}
          districtList={districtList}
          isLoading={isLoading}
          onSelect={onDistrictSelect}
          disabled={!selectedCountryId}
        />
        <CodeInput
          form={form}
          subcountyName={subcountyName}
          countryCode={countryCode}
          districtCode={districtCode}
        />
        <DialogFooter>
          <Button className="mt-2 w-full cursor-pointer" type="submit">
            Add Sub County
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
