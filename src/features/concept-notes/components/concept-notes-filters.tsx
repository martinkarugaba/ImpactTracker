"use client";

import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [submissionFromOpen, setSubmissionFromOpen] = useState(false);
  const [submissionToOpen, setSubmissionToOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const handleFilterChange = (
    key: keyof ConceptNotesFilters,
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleDateChange = (
    key: keyof ConceptNotesFilters,
    date: Date | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: date ? format(date, "yyyy-MM-dd") : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value && value !== ""
  );

  // Parse date strings back to Date objects for the calendar
  const parseDate = (dateString: string | undefined): Date | undefined => {
    return dateString ? new Date(dateString) : undefined;
  };

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
      <CardContent>
        {/* Main Filters Row */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="min-w-[200px] flex-1 space-y-2">
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
          <div className="min-w-[150px] space-y-2">
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

          {/* Month Picker */}
          <div className="min-w-[150px] space-y-2">
            <Label>Month Filter</Label>
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.month && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.month
                    ? format(new Date(filters.month + "-01"), "MMMM yyyy")
                    : "Select month"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.month ? new Date(filters.month + "-01") : undefined
                  }
                  onSelect={date => {
                    if (date) {
                      handleFilterChange("month", format(date, "yyyy-MM"));
                    }
                    setMonthPickerOpen(false);
                  }}
                  disabled={date => date > new Date()}
                  captionLayout="dropdown"
                  defaultMonth={
                    filters.month ? new Date(filters.month + "-01") : new Date()
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Date Range Filters Row */}
        <div className="mt-4 flex flex-wrap items-end gap-4">
          {/* Activity Date Range */}
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label>Activity Start Date</Label>
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[150px] justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(parseDate(filters.dateFrom)!, "MMM d, yyyy")
                      : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(filters.dateFrom)}
                    onSelect={date => {
                      handleDateChange("dateFrom", date);
                      setDateFromOpen(false);
                    }}
                    disabled={date => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Activity End Date</Label>
              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[150px] justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(parseDate(filters.dateTo)!, "MMM d, yyyy")
                      : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(filters.dateTo)}
                    onSelect={date => {
                      handleDateChange("dateTo", date);
                      setDateToOpen(false);
                    }}
                    disabled={date => {
                      if (date > new Date()) return true;
                      if (filters.dateFrom) {
                        const fromDate = parseDate(filters.dateFrom);
                        if (fromDate && date < fromDate) return true;
                      }
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Submission Date Range */}
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label>Submission From</Label>
              <Popover
                open={submissionFromOpen}
                onOpenChange={setSubmissionFromOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[150px] justify-start text-left font-normal",
                      !filters.submissionDateFrom && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.submissionDateFrom
                      ? format(
                          parseDate(filters.submissionDateFrom)!,
                          "MMM d, yyyy"
                        )
                      : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(filters.submissionDateFrom)}
                    onSelect={date => {
                      handleDateChange("submissionDateFrom", date);
                      setSubmissionFromOpen(false);
                    }}
                    disabled={date => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Submission To</Label>
              <Popover
                open={submissionToOpen}
                onOpenChange={setSubmissionToOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[150px] justify-start text-left font-normal",
                      !filters.submissionDateTo && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.submissionDateTo
                      ? format(
                          parseDate(filters.submissionDateTo)!,
                          "MMM d, yyyy"
                        )
                      : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(filters.submissionDateTo)}
                    onSelect={date => {
                      handleDateChange("submissionDateTo", date);
                      setSubmissionToOpen(false);
                    }}
                    disabled={date => {
                      if (date > new Date()) return true;
                      if (filters.submissionDateFrom) {
                        const fromDate = parseDate(filters.submissionDateFrom);
                        if (fromDate && date < fromDate) return true;
                      }
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
