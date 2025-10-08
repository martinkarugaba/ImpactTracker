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
import type { District, FormValues } from "./schema";

interface DistrictSelectorProps {
  form: UseFormReturn<FormValues>;
  districtList: District[];
  isLoading: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function DistrictSelector({
  form,
  districtList,
  isLoading,
  onSelect,
  disabled,
}: DistrictSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="districtId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>District</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={isLoading || disabled}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? districtList.find(district => district.id === field.value)
                        ?.name
                    : "Select district"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search district..." />
                <CommandEmpty>
                  {isLoading ? "Loading districts..." : "No district found."}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {districtList.map(district => (
                    <CommandItem
                      value={district.name}
                      key={district.id}
                      onSelect={() => {
                        field.onChange(district.id);
                        onSelect(district.id);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          district.id === field.value
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
  );
}
