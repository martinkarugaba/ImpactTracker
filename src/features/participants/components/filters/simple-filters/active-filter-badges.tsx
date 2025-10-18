"use client";

import { motion, AnimatePresence } from "motion/react";
import { useAtomValue, useSetAtom } from "jotai";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  participantFiltersAtom,
  hasActiveFiltersAtom,
  updateFilterAtom,
  clearFiltersAtom,
} from "../../../atoms/participants-atoms";
import { type ParticipantFilters as ParticipantFiltersType } from "../../../types/types";
import { type FilterGroups } from "./types";

interface ActiveFilterBadgesProps {
  filterGroups: FilterGroups;
}

export function ActiveFilterBadges({ filterGroups }: ActiveFilterBadgesProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const hasActiveFilters = useAtomValue(hasActiveFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);

  const handleFilterUpdate = (
    key: keyof ParticipantFiltersType,
    value: string
  ) => {
    updateFilter({ key, value });
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
                  handleFilterUpdate(
                    key as keyof ParticipantFiltersType,
                    "all"
                  );
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
  );
}
