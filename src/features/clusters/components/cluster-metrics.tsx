import {
  IconBuilding,
  IconFolder,
  IconMapPin,
  IconTargetArrow,
} from "@tabler/icons-react";
import { MetricCard } from "@/components/ui/metric-card";
import type { Cluster } from "@/features/clusters/types";
import type { Organization } from "@/features/organizations/types";
import type { Project } from "@/features/projects/types";

interface ClusterMetricsProps {
  clusters: Cluster[];
  organizations: Organization[];
  projects: Project[];
}

export function ClusterMetrics({
  clusters,
  organizations,
  projects,
}: ClusterMetricsProps) {
  const totalOrganizations = organizations.length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    project => project.status === "active"
  ).length;
  const totalDistricts = clusters.reduce(
    (acc, cluster) => acc + cluster.districts.length,
    0
  );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <MetricCard
        title="Total Organizations"
        value={totalOrganizations}
        trend={{
          value: 0,
          isPositive: true,
          label: "Organizations in clusters",
        }}
        footer={{
          title: "Organizations in clusters",
          description: "Total organizations across all clusters",
        }}
        icon={<IconBuilding className="size-4" />}
      />
      <MetricCard
        title="Total Projects"
        value={totalProjects}
        trend={{
          value: 0,
          isPositive: true,
          label: "Projects in clusters",
        }}
        footer={{
          title: "Projects in clusters",
          description: "Total projects across all clusters",
        }}
        icon={<IconFolder className="size-4" />}
      />
      <MetricCard
        title="Active Projects"
        value={activeProjects}
        trend={{
          value: 0,
          isPositive: true,
          label: "Active projects",
        }}
        footer={{
          title: "Active projects",
          description: "Currently active projects",
        }}
        icon={<IconTargetArrow className="size-4" />}
      />
      <MetricCard
        title="Districts Coverage"
        value={totalDistricts}
        trend={{
          value: 0,
          isPositive: true,
          label: "Districts covered",
        }}
        footer={{
          title: "Districts covered",
          description: "Total districts across all clusters",
        }}
        icon={<IconMapPin className="size-4" />}
      />
    </div>
  );
}
