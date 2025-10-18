"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./schema";

interface CodeInputProps {
  form: UseFormReturn<FormValues>;
  districtName: string;
  countryId: string;
}

export function CodeInput({ form, districtName, countryId }: CodeInputProps) {
  return (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Code</FormLabel>
          <FormControl>
            <Input
              placeholder="Auto-generated from country and name..."
              {...field}
              readOnly={!!(districtName && countryId)}
              className={districtName && countryId ? "bg-muted" : ""}
            />
          </FormControl>
          <FormMessage />
          {districtName && countryId && (
            <p className="text-xs text-muted-foreground">
              Auto-generated from country code and district name
            </p>
          )}
        </FormItem>
      )}
    />
  );
}
