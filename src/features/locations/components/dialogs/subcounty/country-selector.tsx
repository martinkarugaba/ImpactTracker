"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Country, FormValues } from "./schema";

interface CountrySelectorProps {
  form: UseFormReturn<FormValues>;
  countryList: Country[];
  isLoading: boolean;
  onSelect: (value: string) => void;
}

export function CountrySelector({
  form,
  countryList,
  isLoading,
  onSelect,
}: CountrySelectorProps) {
  return (
    <FormField
      control={form.control}
      name="countryId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Country</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={isLoading}
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
            <PopoverContent className="h-[200px] w-[300px] overflow-auto p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>
                  {isLoading ? "Loading countries..." : "No country found."}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {countryList.map(country => (
                    <CommandItem
                      value={country.name}
                      key={country.id}
                      onSelect={() => {
                        field.onChange(country.id);
                        onSelect(country.id);
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
                      {country.name}
                    </CommandItem>
                  ))}
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
