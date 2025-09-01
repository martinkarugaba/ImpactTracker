"use client";

import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { type ParticipantSearchFormProps } from "./types";

export function ParticipantSearchForm({
  searchTerm,
  onSearchChange,
  isSearching = false,
}: ParticipantSearchFormProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder="Search participants by name, designation, or organization..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className="pr-10 pl-9"
      />
      {isSearching && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
