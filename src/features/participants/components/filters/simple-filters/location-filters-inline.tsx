"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  participantFiltersAtom,
  updateFilterAtom,
} from "../../../atoms/participants-atoms";
import { useFilterOptions } from "../../container/use-filter-options";
import { useLocationNames } from "../../../hooks/use-location-names";
import { useMemo } from "react";

interface LocationFiltersInlineProps {
  clusterId?: string;
  isLoading?: boolean;
}

export function LocationFiltersInline({
  clusterId = "",
  isLoading = false,
}: LocationFiltersInlineProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  // Get location names for districts and subcounties
  const locationNames = useLocationNames([], [], []);

  // Get filter options (unique values from participants)
  const filterOptions = useFilterOptions({
    clusterId,
    locationNames,
  });

  const locationFilters = useMemo(
    () => [
      {
        key: "district",
        label: "District",
        options: filterOptions.districts || [],
      },
      {
        key: "county",
        label: "County",
        options: filterOptions.counties || [],
      },
      {
        key: "subCounty",
        label: "Sub County",
        options: filterOptions.subCounties || [],
      },
      {
        key: "parish",
        label: "Parish",
        options: filterOptions.parishes || [],
      },
      {
        key: "village",
        label: "Village",
        options: filterOptions.villages || [],
      },
    ],
    [filterOptions]
  );

  const handleSelect = (filterKey: string, value: string) => {
    updateFilter({
      key: filterKey as keyof typeof filters,
      value,
    });
    setOpenPopovers(prev => ({ ...prev, [filterKey]: false }));
  };

  const getDisplayValue = (filterKey: string, value: string) => {
    if (!value || value === "all") return null;
    const filter = locationFilters.find(f => f.key === filterKey);
    const option = filter?.options.find(opt => opt.id === value);
    return option?.name || value;
  };

  return (
    <>
      {locationFilters.map(filter => {
        const currentValue =
          (filters as unknown as Record<string, string>)[filter.key] || "all";
        const displayValue = getDisplayValue(filter.key, currentValue);

        return (
          <div key={filter.key} className="min-w-[180px]">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
            <Popover
              open={openPopovers[filter.key]}
              onOpenChange={open =>
                setOpenPopovers(prev => ({ ...prev, [filter.key]: open }))
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopovers[filter.key]}
                  className="w-[180px] justify-between"
                  disabled={isLoading}
                >
                  {displayValue || `Select ${filter.label.toLowerCase()}...`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Search ${filter.label.toLowerCase()}...`}
                  />
                  <CommandList>
                    <CommandEmpty>
                      No {filter.label.toLowerCase()} found.
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleSelect(filter.key, "all")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentValue === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All {filter.label}s
                      </CommandItem>
                      {filter.options.map(option => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() => handleSelect(filter.key, option.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currentValue === option.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );
      })}
    </>
  );
}
