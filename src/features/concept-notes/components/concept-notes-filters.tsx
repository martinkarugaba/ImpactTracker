"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { type ConceptNotesFilters } from "../actions/concept-notes";

interface ConceptNotesFiltersProps {
  filters: ConceptNotesFilters;
  onFiltersChange: (filters: ConceptNotesFilters) => void;
  isLoading: boolean;
}

const ACTIVITY_TYPES = [
  { value: "training", label: "Training" },
  { value: "meeting", label: "Meeting" },
  { value: "workshop", label: "Workshop" },
  { value: "conference", label: "Conference" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
];

export function ConceptNotesFilters({
  filters,
  onFiltersChange,
  isLoading,
}: ConceptNotesFiltersProps) {
  const handleFilterChange = (
    key: keyof ConceptNotesFilters,
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value && value !== ""
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by title..."
            value={filters.search || ""}
            onChange={e => handleFilterChange("search", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Activity Type */}
        <div className="space-y-2">
          <Label>Activity Type</Label>
          <Select
            value={filters.activityType || "all"}
            onValueChange={value =>
              handleFilterChange("activityType", value === "all" ? "" : value)
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ACTIVITY_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Activity Start Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ""}
              onChange={e => handleFilterChange("dateFrom", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">Activity End Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo || ""}
              onChange={e => handleFilterChange("dateTo", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submission Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="submissionDateFrom">Submission From</Label>
            <Input
              id="submissionDateFrom"
              type="date"
              value={filters.submissionDateFrom || ""}
              onChange={e =>
                handleFilterChange("submissionDateFrom", e.target.value)
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submissionDateTo">Submission To</Label>
            <Input
              id="submissionDateTo"
              type="date"
              value={filters.submissionDateTo || ""}
              onChange={e =>
                handleFilterChange("submissionDateTo", e.target.value)
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
