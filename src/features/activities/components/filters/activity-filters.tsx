"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from "../../types/types";
import {
  isFilterOpenAtom,
  activityFiltersAtom,
  searchValueAtom,
  clearFiltersAtom,
  updateActivityFilterAtom,
  activeFiltersCountAtom,
} from "../../atoms/activities-atoms";

interface ActivityFiltersComponentProps {
  organizations: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityFiltersComponent({
  organizations,
  clusters = [],
  projects = [],
}: ActivityFiltersComponentProps) {
  // Jotai atoms
  const [isFilterOpen, setIsFilterOpen] = useAtom(isFilterOpenAtom);
  const filters = useAtomValue(activityFiltersAtom);
  const [searchValue, _setSearchValue] = useAtom(searchValueAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);
  const updateFilter = useSetAtom(updateActivityFilterAtom);
  const activeFiltersCount = useAtomValue(activeFiltersCountAtom);

  const updateFilters = (
    key: keyof typeof filters,
    value: string | Date | undefined
  ) => {
    updateFilter({ key, value });
  };

  return (
    <div className="space-y-4">
      {/* Filters Button with Active Count */}
      <div className="flex items-center space-x-2">
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
          <PopoverContent className="w-80" align="start">
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

              {/* Search Bar - Inside Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchValue || filters.search || ""}
                    onChange={e => {
                      updateFilters("search", e.target.value);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Type</label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={value =>
                    updateFilters("type", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
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
                  value={filters.status || "all"}
                  onValueChange={value =>
                    updateFilters("status", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
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
                  value={filters.organizationId || "all"}
                  onValueChange={value =>
                    updateFilters(
                      "organizationId",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All organizations</SelectItem>
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
                    value={filters.clusterId || "all"}
                    onValueChange={value =>
                      updateFilters(
                        "clusterId",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All clusters</SelectItem>
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
                    value={filters.projectId || "all"}
                    onValueChange={value =>
                      updateFilters(
                        "projectId",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All projects</SelectItem>
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
                          ? format(new Date(filters.startDate), "PPP")
                          : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          filters.startDate
                            ? new Date(filters.startDate)
                            : undefined
                        }
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
                          ? format(new Date(filters.endDate), "PPP")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          filters.endDate
                            ? new Date(filters.endDate)
                            : undefined
                        }
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
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {(searchValue || filters.search) && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            >
              Search: {searchValue || filters.search}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => {
                  updateFilters("search", "");
                }}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
            >
              Type:{" "}
              {filters.type
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("type", undefined)}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
            >
              Status:{" "}
              {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("status", undefined)}
              />
            </Badge>
          )}
          {filters.organizationId && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            >
              Org:{" "}
              {organizations.find(o => o.id === filters.organizationId)?.name}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("organizationId", undefined)}
              />
            </Badge>
          )}
          {filters.clusterId && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              Cluster: {clusters.find(c => c.id === filters.clusterId)?.name}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("clusterId", undefined)}
              />
            </Badge>
          )}
          {filters.projectId && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-900/20 dark:text-pink-400"
            >
              Project: {projects.find(p => p.id === filters.projectId)?.name}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("projectId", undefined)}
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-400"
            >
              From: {format(new Date(filters.startDate), "MMM dd, yyyy")}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("startDate", undefined)}
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
            >
              To: {format(new Date(filters.endDate), "MMM dd, yyyy")}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => updateFilters("endDate", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
