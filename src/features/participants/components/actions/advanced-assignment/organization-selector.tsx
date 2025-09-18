import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationOption } from "./types";

interface OrganizationSelectorProps {
  organizations: OrganizationOption[];
  selectedOrganization: string;
  onOrganizationChange: (organizationId: string) => void;
  getOrgDisplayName: (org: { name: string; acronym?: string }) => string;
}

export function OrganizationSelector({
  organizations,
  selectedOrganization,
  onOrganizationChange,
  getOrgDisplayName,
}: OrganizationSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Target Organization</label>
      <Select value={selectedOrganization} onValueChange={onOrganizationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an organization..." />
        </SelectTrigger>
        <SelectContent>
          {organizations?.map(org => (
            <SelectItem key={org.id} value={org.id}>
              {getOrgDisplayName(org)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
