"use client";

import * as React from "react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import type { Country, FormValues } from "./schema";
import type { UseFormReturn } from "react-hook-form";

interface CountrySelectorProps {
  form: UseFormReturn<FormValues>;
  countryList: Country[];
  isLoading: boolean;
}

export function CountrySelector({
  form,
  countryList,
  isLoading,
}: CountrySelectorProps) {
  return (
    <FormField
      control={form.control}
      name="countryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Country</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? countryList.find(country => country.id === field.value)
                        ?.name
                    : "Select country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>
                  {isLoading
                    ? "Loading countries..."
                    : countryList.length === 0
                      ? "No countries available. Please try again later."
                      : "No country found."}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {Array.isArray(countryList) && countryList.length > 0
                    ? countryList.map(country => (
                        <CommandItem
                          key={country.id}
                          value={country.name}
                          onSelect={() => {
                            form.setValue("countryId", country.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              country.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country.name} ({country.code})
                        </CommandItem>
                      ))
                    : null}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
