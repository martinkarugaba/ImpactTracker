// components/filters/jotai-participant-filters.tsx
"use client";

import { useState, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  participantFiltersAtom,
  participantSearchAtom,
  hasActiveFiltersAtom,
  updateFilterAtom,
  clearFiltersAtom,
} from "../../atoms/participants-atoms";
import { type Participant } from "../../types/types";

interface JotaiParticipantFiltersProps {
  _projects: Array<{ id: string; name: string; acronym: string }>;
  _organizations: Array<{ id: string; name: string; acronym: string }>;
  _districts?: Array<{ id: string; name: string }>;
  _subCounties?: Array<{ id: string; name: string }>;
  _participants?: Participant[];
}

export function JotaiParticipantFilters({
  _projects,
  _organizations,
  _districts = [],
  _subCounties = [],
  _participants = [],
}: JotaiParticipantFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Jotai state
  const filters = useAtomValue(participantFiltersAtom);
  const [searchValue, setSearchValue] = useAtom(participantSearchAtom);
  const hasActiveFilters = useAtomValue(hasActiveFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);

  // Generate dynamic filter options (same as before but using Jotai state)
  const filterGroups = useMemo(() => {
    // ... same logic for generating filter options
    return {
      quick: [
        {
          key: "sex",
          label: "Gender",
          values: [
            { value: "all", label: "All" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ],
        },
        // ... other quick filters
      ],
      enterprise: [],
      skills: [],
      demographics: [],
      employment: [],
    };
  }, []);

  const handleFilterUpdate = (key: string, value: string) => {
    updateFilter({ key: key as keyof typeof filters, value });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const getActiveFilterBadges = () => {
    const allFilters = [
      ...filterGroups.quick,
      ...filterGroups.enterprise,
      ...filterGroups.skills,
      ...filterGroups.demographics,
      ...filterGroups.employment,
    ];

    return Object.entries(filters)
      .filter(
        ([key, value]) => key !== "search" && value !== "" && value !== "all"
      )
      .map(([key, value], index) => {
        const filterOption = allFilters.find(f => f?.key === key);
        const displayValue = filterOption
          ? filterOption.values.find(v => v.value === value)?.label || value
          : value;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{
              duration: 0.2,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            layout
          >
            <Badge variant="secondary" className="gap-1.5 text-xs">
              {filterOption?.label || key}: {displayValue}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFilterUpdate(key, "all");
                }}
                className="flex h-3 w-3 cursor-pointer items-center justify-center hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </motion.button>
            </Badge>
          </motion.div>
        );
      });
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Filters */}
        {filterGroups.quick.map(filter => (
          <Select
            key={filter.key}
            value={filters[filter.key as keyof typeof filters] || "all"}
            onValueChange={value => handleFilterUpdate(filter.key, value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.values.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* More Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="mr-2 h-4 w-4" />
          More Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filter Badges */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-muted-foreground"
              >
                Active filters:
              </motion.span>
              <AnimatePresence mode="popLayout">
                {getActiveFilterBadges()}
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="ml-auto h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
