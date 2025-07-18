/**
 * Helper functions for looking up related entities
 */

type NamedEntity = { id: string; name: string };

/**
 * Get organization name by ID
 */
export const getOrganizationName = (
  orgId: string,
  organizations: NamedEntity[]
) => {
  const org = organizations.find(o => o.id === orgId);
  return org?.name || "Unknown Organization";
};

/**
 * Get cluster name by ID
 */
export const getClusterName = (
  clusterId: string | null,
  clusters: NamedEntity[]
) => {
  if (!clusterId) return null;
  const cluster = clusters.find(c => c.id === clusterId);
  return cluster?.name || "Unknown Cluster";
};

/**
 * Get project name by ID
 */
export const getProjectName = (
  projectId: string | null,
  projects: NamedEntity[]
) => {
  if (!projectId) return null;
  const project = projects.find(p => p.id === projectId);
  return project?.name || "Unknown Project";
};
