"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BuildingIcon,
  UsersIcon,
  FolderIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { formatFullDate } from "../../utils/format-utils";
import {
  getOrganizationName,
  getClusterName,
  getProjectName,
} from "../../utils/entity-utils";

interface ActivityInformationCardProps {
  organizationId: string;
  clusterId?: string | null;
  projectId?: string | null;
  venue?: string | null;
  startDate: string;
  endDate?: string | null;
  organizations: Array<{ id: string; name: string }>;
  clusters?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export function ActivityInformationCard({
  organizationId,
  clusterId,
  projectId,
  venue,
  startDate,
  endDate,
  organizations,
  clusters = [],
  projects = [],
}: ActivityInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <BuildingIcon className="mr-3 h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Organization</p>
            <p className="text-muted-foreground text-sm">
              {getOrganizationName(organizationId, organizations)}
            </p>
          </div>
        </div>

        {clusterId && (
          <div className="flex items-center">
            <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Cluster</p>
              <p className="text-muted-foreground text-sm">
                {getClusterName(clusterId, clusters)}
              </p>
            </div>
          </div>
        )}

        {projectId && (
          <div className="flex items-center">
            <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Project</p>
              <p className="text-muted-foreground text-sm">
                {getProjectName(projectId, projects)}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center">
          <MapPinIcon className="mr-3 h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Location</p>
            <p className="text-muted-foreground text-sm">
              {venue || "Not specified"}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Timeline</p>
            <p className="text-muted-foreground text-sm">
              {formatFullDate(startDate)}
              {endDate && ` - ${formatFullDate(endDate)}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
