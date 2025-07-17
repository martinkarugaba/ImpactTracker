"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  type ActivityFilters,
  ACTIVITY_TYPES,
  ACTIVITY_STATUSES,
} from "../../types/types";

interface ActivityFiltersComponentProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  organizations: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityFiltersComponent({
  filters,
  onFiltersChange,
  organizations,
  clusters = [],
  projects = [],
}: ActivityFiltersComponentProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilters = (
    key: keyof ActivityFilters,
    value: ActivityFilters[keyof ActivityFilters]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      type: undefined,
      status: undefined,
      organizationId: undefined,
      clusterId: undefined,
      projectId: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.organizationId) count++;
    if (filters.clusterId) count++;
    if (filters.projectId) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={filters.search || ""}
            onChange={e => updateFilters("search", e.target.value)}
            className="pl-8"
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground h-auto p-0"
                >
                  Clear all
                </Button>
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Type</label>
                <Select
                  value={filters.type || ""}
                  onValueChange={value =>
                    updateFilters("type", value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {ACTIVITY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type
                          .split("_")
                          .map(
                            word => word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || ""}
                  onValueChange={value =>
                    updateFilters("status", value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {ACTIVITY_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>
                <Select
                  value={filters.organizationId || ""}
                  onValueChange={value =>
                    updateFilters("organizationId", value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cluster */}
              {clusters.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cluster</label>
                  <Select
                    value={filters.clusterId || ""}
                    onValueChange={value =>
                      updateFilters("clusterId", value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All clusters</SelectItem>
                      {clusters.map(cluster => (
                        <SelectItem key={cluster.id} value={cluster.id}>
                          {cluster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Project */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    value={filters.projectId || ""}
                    onValueChange={value =>
                      updateFilters("projectId", value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate
                          ? format(filters.startDate, "PPP")
                          : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={date => updateFilters("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate
                          ? format(filters.endDate, "PPP")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={date => updateFilters("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("search", "")}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type:{" "}
              {filters.type
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("type", undefined)}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status:{" "}
              {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("status", undefined)}
              />
            </Badge>
          )}
          {filters.organizationId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Org:{" "}
              {organizations.find(o => o.id === filters.organizationId)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("organizationId", undefined)}
              />
            </Badge>
          )}
          {filters.clusterId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Cluster: {clusters.find(c => c.id === filters.clusterId)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("clusterId", undefined)}
              />
            </Badge>
          )}
          {filters.projectId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Project: {projects.find(p => p.id === filters.projectId)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("projectId", undefined)}
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              From: {format(filters.startDate, "MMM dd, yyyy")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("startDate", undefined)}
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {format(filters.endDate, "MMM dd, yyyy")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters("endDate", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
