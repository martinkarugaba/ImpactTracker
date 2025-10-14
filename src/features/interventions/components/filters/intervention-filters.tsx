"use client";

import React from "react";
import { useFilterState } from "./use-filter-state";
import { FilterSelect } from "./filter-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function InterventionFilters({
  onChange,
  initial,
}: {
  initial?: Partial<{
    skillCategory: string;
    source: string;
  }>;
  onChange: (filters: {
    skillCategory?: string;
    source?: string;
    search?: string;
  }) => void;
}) {
  const { filters, setFilter, clearFilters } = useFilterState(initial);

  React.useEffect(() => {
    onChange(
      filters as {
        skillCategory?: string;
        source?: string;
        search?: string;
      }
    );
  }, [filters, onChange]);

  return (
    <div className="flex max-w-7xl items-center gap-2 border-2">
      <div className="relative w-80 border-2">
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <Input
          placeholder="Search participants, activity or skill"
          value={filters.search ?? ""}
          onChange={e => setFilter("search", e.target.value)}
          className="w-full max-w-7xl pl-9"
        />
      </div>

      <FilterSelect
        value={filters.skillCategory ?? ""}
        onChange={v => setFilter("skillCategory", v)}
        options={[
          { value: "business_skill", label: "Business" },
          { value: "vocational_skill", label: "Vocational" },
          { value: "soft_skill", label: "Soft skill" },
        ]}
      />

      <FilterSelect
        value={filters.source ?? ""}
        onChange={v => setFilter("source", v)}
        options={[
          { value: "activity_participants", label: "Activity" },
          { value: "session_attendance", label: "Session" },
        ]}
      />

      <Button variant="ghost" size="sm" onClick={() => clearFilters()}>
        <X className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
