"use client";

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
import type { UseFormReturn } from "react-hook-form";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { FormValues, District, Country } from "./schema";

interface CountyFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  countryList: Country[];
  districtList: District[];
  isLoading: boolean;
  countyName: string;
}

export function CountyForm({
  form,
  onSubmit,
  countryList,
  districtList,
  isLoading,
}: CountyFormProps) {
  const [openCountry, setOpenCountry] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);

  // Watch name and district_id for changes to generate the code
  const name = form.watch("name");
  const districtId = form.watch("district_id");

  // Generate county code when district and county name change
  useEffect(() => {
    if (districtId && name) {
      const district = districtList.find(d => d.id === districtId);
      if (district) {
        // Generate code from district code + first 3 letters of county name (uppercase)
        const namePrefix = name.slice(0, 3).toUpperCase();
        const newCode = `${district.code}-${namePrefix}`;
        form.setValue("code", newCode);
      }
    }
  }, [name, districtId, districtList, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter county name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Country</FormLabel>
              <Popover open={openCountry} onOpenChange={setOpenCountry}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCountry}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? countryList.find(
                            country => country.id === field.value
                          )?.name
                        : "Select a country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {countryList.map(country => (
                        <CommandItem
                          value={country.name}
                          key={country.id}
                          onSelect={() => {
                            field.onChange(country.id);
                            form.setValue("district_id", ""); // Reset district when country changes
                            setOpenCountry(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === country.id
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

        <FormField
          control={form.control}
          name="district_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>District</FormLabel>
              <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDistrict}
                      className="w-full justify-between"
                      disabled={!form.watch("country_id")}
                    >
                      {field.value
                        ? districtList.find(
                            district => district.id === field.value
                          )?.name
                        : "Select a district"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search districts..." />
                    <CommandEmpty>
                      {isLoading
                        ? "Loading districts..."
                        : form.watch("country_id")
                          ? "No districts found for this country."
                          : "Please select a country first."}
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {districtList.map(district => (
                        <CommandItem
                          value={district.name}
                          key={district.id}
                          onSelect={() => {
                            field.onChange(district.id);
                            setOpenDistrict(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === district.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {district.name}
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

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code (Auto-generated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Auto-generated from district and county name"
                  {...field}
                  disabled={true}
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Adding..." : "Add County"}
        </Button>
      </form>
    </Form>
  );
}
