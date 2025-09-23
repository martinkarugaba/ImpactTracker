"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { participantSearchAtom } from "../../../atoms/participants-atoms";

interface SearchFilterProps {
  isLoading?: boolean;
}

export function SearchFilter({ isLoading = false }: SearchFilterProps) {
  const [localSearchValue, setLocalSearchValue] = useState("");
  const [searchValue, setSearchValue] = useAtom(participantSearchAtom);

  // Initialize local search value from Jotai state
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(localSearchValue);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localSearchValue, setSearchValue]);

  return (
    <div className="relative min-w-[250px] flex-1">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Search Participants
      </label>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search participants..."
          value={localSearchValue}
          onChange={e => setLocalSearchValue(e.target.value)}
          className="pl-9"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
