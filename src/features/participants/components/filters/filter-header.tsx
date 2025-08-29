"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function FilterHeader({
  hasActiveFilters,
  onClearFilters,
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 px-2 lg:px-3"
        >
          Clear all
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
