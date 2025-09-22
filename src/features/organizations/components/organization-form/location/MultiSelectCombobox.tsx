// MultiSelectCombobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  customOptionLabel?: (input: string) => string;
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  emptyText = "No options found.",
  disabled = false,
  allowCustom = false,
  customOptionLabel = (input: string) => `Add "${input}"`,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Filter options based on input
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input exactly matches an existing option
  const exactMatch = options.some(
    option => option.label.toLowerCase() === inputValue.toLowerCase()
  );

  // Show custom option if:
  // 1. Custom options are allowed
  // 2. There's input text
  // 3. No exact match found
  // 4. Input is not already selected
  const showCustomOption =
    allowCustom &&
    inputValue.trim() &&
    !exactMatch &&
    !selected.includes(inputValue.trim());

  const handleSelect = (value: string) => {
    if (disabled) return;

    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleAddCustom = (value: string) => {
    if (disabled) return;

    const trimmedValue = value.trim();
    if (trimmedValue && !selected.includes(trimmedValue)) {
      onChange([...selected, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemove = (value: string) => {
    if (disabled) return;
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="truncate">
              {selected.length > 0
                ? `${selected.length} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={inputValue}
              onValueChange={setInputValue}
            />
            {filteredOptions.length === 0 && !showCustomOption && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {showCustomOption && (
                <CommandItem
                  value={inputValue}
                  onSelect={() => handleAddCustom(inputValue)}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {customOptionLabel(inputValue)}
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map(value => {
            const option = options.find(option => option.value === value);
            const isCustom = !option;
            return (
              <Badge
                key={value}
                variant={isCustom ? "outline" : "secondary"}
                className="rounded-md px-2 py-1"
                title={isCustom ? "Custom subcounty" : undefined}
              >
                {option?.label || value}
                {isCustom && (
                  <span className="ml-1 text-xs opacity-70">(custom)</span>
                )}
                <X
                  className={cn(
                    "ml-1 h-3 w-3",
                    disabled ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                  onClick={() => !disabled && handleRemove(value)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
