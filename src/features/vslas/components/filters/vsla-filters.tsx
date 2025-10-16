"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Organization } from "@/features/organizations/types";
import type { Cluster } from "@/features/clusters/components/clusters-table";
import type { Project } from "@/features/projects/types";

export interface VSLAFilters {
  organization: string;
  cluster: string;
  project: string;
  district: string;
  subCounty: string;
  status: string;
  meetingFrequency: string;
  saccoMember: string;
  hasConstitution: string;
}

interface VSLAFiltersProps {
  filters: VSLAFilters;
  onFiltersChange: (filters: VSLAFilters) => void;
  organizations: Organization[];
  clusters: Cluster[];
  projects: Project[];
  districts: string[];
  subCounties: string[];
}

export function VSLAFiltersComponent({
  filters,
  onFiltersChange,
  organizations,
  clusters,
  projects,
  districts,
  subCounties,
}: VSLAFiltersProps) {
  const handleFilterChange = (key: keyof VSLAFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      organization: "all",
      cluster: "all",
      project: "all",
      district: "all",
      subCounty: "all",
      status: "all",
      meetingFrequency: "all",
      saccoMember: "all",
      hasConstitution: "all",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== "all"
  );

  const activeFilterCount = Object.values(filters).filter(
    value => value !== "all"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Organization Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Organization</label>
          <Select
            value={filters.organization}
            onValueChange={value => handleFilterChange("organization", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cluster Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cluster</label>
          <Select
            value={filters.cluster}
            onValueChange={value => handleFilterChange("cluster", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clusters</SelectItem>
              {clusters.map(cluster => (
                <SelectItem key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select
            value={filters.project}
            onValueChange={value => handleFilterChange("project", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">District</label>
          <Select
            value={filters.district}
            onValueChange={value => handleFilterChange("district", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub County Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sub County</label>
          <Select
            value={filters.subCounty}
            onValueChange={value => handleFilterChange("subCounty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sub Counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub Counties</SelectItem>
              {subCounties.map(subCounty => (
                <SelectItem key={subCounty} value={subCounty}>
                  {subCounty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status}
            onValueChange={value => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Meeting Frequency Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Meeting Frequency</label>
          <Select
            value={filters.meetingFrequency}
            onValueChange={value =>
              handleFilterChange("meetingFrequency", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Frequencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SACCO Member Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">SACCO Member</label>
          <Select
            value={filters.saccoMember}
            onValueChange={value => handleFilterChange("saccoMember", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Has Constitution Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Has Constitution</label>
          <Select
            value={filters.hasConstitution}
            onValueChange={value =>
              handleFilterChange("hasConstitution", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
