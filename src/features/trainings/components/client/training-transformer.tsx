"use client";

import { type ClusterWithOrganizations } from "./types";

export function extractClusterOrganizations(
  clusterId: string,
  clusters: ClusterWithOrganizations[]
) {
  const cluster = clusters.find(c => c.id === clusterId);
  if (!cluster || !cluster.organizations) {
    return [];
  }
  return cluster.organizations;
}
