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
import { type SimpleParticipantFiltersProps } from "../types";

interface OrganizationLocationSectionProps {
  projects: SimpleParticipantFiltersProps["projects"];
  organizations: SimpleParticipantFiltersProps["organizations"];
  districts: SimpleParticipantFiltersProps["districts"];
  subCounties: SimpleParticipantFiltersProps["subCounties"];
}

export function OrganizationLocationSection({
  projects,
  organizations,
  districts = [],
  subCounties = [],
}: OrganizationLocationSectionProps) {
  const filters = useAtomValue(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);

  return (
    <div className="space-y-3">
      <h5 className="text-muted-foreground border-b pb-1 text-sm font-medium">
        Organization & Location
      </h5>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-medium">Project</label>
          <Select
            value={filters.project}
            onValueChange={value => updateFilter({ key: "project", value })}
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
      </div>
    </div>
  );
}
