"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar } from "lucide-react";
import { type ReportsFilters } from "../actions/reports";

interface ReportFiltersProps {
  filters: ReportsFilters;
  onFiltersChange: (filters: ReportsFilters) => void;
  isLoading?: boolean;
}

const ACTIVITY_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "workshop", label: "Workshop" },
  { value: "training", label: "Training" },
  { value: "field_visit", label: "Field Visit" },
  { value: "conference", label: "Conference" },
  { value: "seminar", label: "Seminar" },
  { value: "consultation", label: "Consultation" },
  { value: "assessment", label: "Assessment" },
  { value: "monitoring", label: "Monitoring" },
  { value: "evaluation", label: "Evaluation" },
  { value: "community_engagement", label: "Community Engagement" },
  { value: "capacity_building", label: "Capacity Building" },
  { value: "advocacy", label: "Advocacy" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

export function ReportFilters({
  filters,
  onFiltersChange,
  isLoading,
}: ReportFiltersProps) {
  const handleFilterChange = (key: keyof ReportsFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search reports..."
                value={filters.search || ""}
                onChange={e => handleFilterChange("search", e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
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

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date From</Label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={e => handleFilterChange("dateFrom", e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">Date To</Label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={e => handleFilterChange("dateTo", e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
