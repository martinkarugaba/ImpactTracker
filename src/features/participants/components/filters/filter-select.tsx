"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ id: string; name: string; label?: string }>;
  allLabel?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  allLabel = `All ${placeholder}s`,
  className = "h-9 w-36",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map(option => (
          <SelectItem key={option.id} value={option.id}>
            {option.label || option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
