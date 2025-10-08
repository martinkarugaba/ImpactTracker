"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./schema";
import { generateSubcountyCode } from "./utils";
import { useEffect } from "react";

interface CodeInputProps {
  form: UseFormReturn<FormValues>;
  subcountyName: string;
  countryCode: string;
  districtCode: string;
}

export function CodeInput({
  form,
  subcountyName,
  countryCode,
  districtCode,
}: CodeInputProps) {
  useEffect(() => {
    const code = generateSubcountyCode(
      countryCode,
      districtCode,
      subcountyName
    );
    form.setValue("code", code);
  }, [form, countryCode, districtCode, subcountyName]);

  return (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Code</FormLabel>
          <FormControl>
            <Input disabled placeholder="Auto-generated code..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
