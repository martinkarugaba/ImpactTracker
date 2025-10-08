"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import { NameInput } from "./name-input";
import { CodeInput } from "./code-input";
import { CountrySelector } from "./country-selector";
import type { Country, FormValues } from "./schema";

interface DistrictFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  countryList: Country[];
  isLoading: boolean;
  districtName: string;
  countryId: string;
}

export function DistrictForm({
  form,
  onSubmit,
  countryList,
  isLoading,
  districtName,
  countryId,
}: DistrictFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <NameInput form={form} />
        <CountrySelector
          form={form}
          countryList={countryList}
          isLoading={isLoading}
        />
        <CodeInput
          form={form}
          districtName={districtName}
          countryId={countryId}
        />
        <DialogFooter>
          <Button className="mt-2 w-full cursor-pointer" type="submit">
            Add District
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
