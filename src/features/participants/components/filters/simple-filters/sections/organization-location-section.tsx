"use client";

import { useAtomValue, useSetAtom } from "jotai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  participantFiltersAtom,
  updateFilterAtom,
} from "../../../../atoms/participants-atoms";

interface OrganizationLocationSectionProps {
  projects: Array<{ id: string; name: string; acronym: string }>;
  organizations: Array<{ id: string; name: string; acronym: string }>;
  districts: Array<{ id: string; name: string }>;
  subCounties: Array<{ id: string; name: string }>;
  counties?: Array<{ id: string; name: string }>;
  parishes?: Array<{ id: string; name: string }>;
  villages?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function OrganizationLocationSection({
  projects,
  organizations,
  districts = [],
  subCounties = [],
  counties = [],
  parishes = [],
  villages = [],
  isLoading = false,
}: OrganizationLocationSectionProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);

  return (
    <div className="space-y-3">
      <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
        Organization & Location
      </h5>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <label className="text-xs font-medium">Project</label>
          <Select
            value={filters.project}
            onValueChange={value => updateFilter({ key: "project", value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.acronym}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Organization</label>
          <Select
            value={filters.organization}
            onValueChange={value =>
              updateFilter({ key: "organization", value })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select organization..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.acronym}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">District</label>
          <Select
            value={filters.district}
            onValueChange={value => updateFilter({ key: "district", value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(district => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Sub County</label>
          <Select
            value={filters.subCounty}
            onValueChange={value => updateFilter({ key: "subCounty", value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub county..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub Counties</SelectItem>
              {subCounties.map(subCounty => (
                <SelectItem key={subCounty.id} value={subCounty.id}>
                  {subCounty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">County</label>
          <Select
            value={filters.county}
            onValueChange={value => updateFilter({ key: "county", value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select county..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {counties.map(county => (
                <SelectItem key={county.id} value={county.id}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Parish</label>
          <Select
            value={filters.parish}
            onValueChange={value => updateFilter({ key: "parish", value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parish..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parishes</SelectItem>
              {parishes.map(parish => (
                <SelectItem key={parish.id} value={parish.id}>
                  {parish.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Village</label>
          <Select
            value={filters.village}
            onValueChange={value => updateFilter({ key: "village", value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select village..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villages</SelectItem>
              {villages.map(village => (
                <SelectItem key={village.id} value={village.id}>
                  {village.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
