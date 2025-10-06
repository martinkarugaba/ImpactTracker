"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { type ParticipantFilters } from "../../types/types";

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filters: ParticipantFilters;
  filterOptions?: {
    projects: Array<{ id: string; name: string; acronym: string }>;
    organizations: Array<{ id: string; name: string }>;
    districts: Array<{ id: string; name: string }>;
    subCounties: Array<{ id: string; name: string }>;
    counties: Array<{ id: string; name: string }>;
    parishes: Array<{ id: string; name: string }>;
    villages: Array<{ id: string; name: string }>;
    enterprises: Array<{ id: string; name: string }>;
  };
  onRemoveFilter: (key: keyof ParticipantFilters) => void;
}

export function FilterHeader({
  hasActiveFilters,
  onClearFilters,
  filters,
  filterOptions,
  onRemoveFilter,
}: FilterHeaderProps) {
  // Function to get display name for filter values
  const getFilterDisplayName = (
    key: keyof ParticipantFilters,
    value: string
  ): string => {
    if (!value || value === "all") return "";

    switch (key) {
      case "project":
        return (
          filterOptions?.projects.find(p => p.id === value)?.acronym || value
        );
      case "organization":
        return (
          filterOptions?.organizations.find(o => o.id === value)?.name || value
        );
      case "district":
        return (
          filterOptions?.districts.find(d => d.id === value)?.name || value
        );
      case "subCounty":
        return (
          filterOptions?.subCounties.find(s => s.id === value)?.name || value
        );
      case "county":
        return filterOptions?.counties.find(c => c.id === value)?.name || value;
      case "parish":
        return filterOptions?.parishes.find(p => p.id === value)?.name || value;
      case "village":
        return filterOptions?.villages.find(v => v.id === value)?.name || value;
      case "enterprise":
        return (
          filterOptions?.enterprises.find(e => e.id === value)?.name || value
        );
      case "sex":
        return value === "M" ? "Male" : value === "F" ? "Female" : value;
      case "isPWD":
        return value === "yes" ? "PWD" : value === "no" ? "Not PWD" : value;
      case "ageGroup":
        return value.replace("_", "-") + " years";
      default:
        return value;
    }
  };

  // Get active filters for badges
  const activeFilters = Object.entries(filters)
    .filter(
      ([key, value]) => key !== "search" && value !== "" && value !== "all"
    )
    .map(([key, value]) => ({
      key: key as keyof ParticipantFilters,
      value,
      displayName: getFilterDisplayName(key as keyof ParticipantFilters, value),
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));

  // Don't render if no active filters
  if (!hasActiveFilters) return null;

  return (
    <div className="bg-muted/30 overflow-hidden rounded-lg">
      <div className="flex items-center justify-between p-3">
        {/* Active Filter Badges Container */}
        <div className="flex-1 overflow-hidden">
          <div className="flex min-h-[2rem] flex-wrap items-center gap-2">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm font-medium"
            >
              Active filters:
            </motion.span>
            <AnimatePresence mode="popLayout">
              {activeFilters.map((filter, index) => (
                <motion.div
                  key={filter.key}
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
                  <Badge
                    variant="outline"
                    className="bg-background border-border hover:bg-muted/50 flex items-center gap-1.5 px-2.5 py-1 text-xs transition-all duration-200"
                  >
                    <span className="font-medium">{filter.displayName}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveFilter(filter.key);
                      }}
                      className="hover:bg-destructive/20 hover:text-destructive flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
                    >
                      <X className="h-2.5 w-2.5" />
                      <span className="sr-only">
                        Remove {filter.label} filter
                      </span>
                    </motion.button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Clear All Button */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="ml-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground h-8 px-3 text-sm transition-colors"
            >
              Clear all
              <X className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
