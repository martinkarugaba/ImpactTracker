"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value?: string | "";
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <Select value={value ?? ""} onValueChange={v => onChange(String(v))}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All</SelectItem>
        {options.map(o => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
