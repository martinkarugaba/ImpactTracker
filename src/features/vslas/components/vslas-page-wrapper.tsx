import { getVSLAs } from "../actions/vslas";
import { getOrganizations } from "@/features/organizations/actions/organizations";
import { getClusters } from "@/features/clusters/actions/clusters";
import { getProjects } from "@/features/projects/actions/projects";
import { VSLAsPageContent } from "./vslas-page-content";

export async function VSLAsPageWrapper() {
  // Fetch data in parallel
  const [vslasResult, organizationsResult, clustersResult, projectsResult] =
    await Promise.all([
      getVSLAs(),
      getOrganizations(),
      getClusters(),
      getProjects(),
    ]);

  if (!vslasResult.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading VSLAs</h3>
          <p className="text-muted-foreground">
            {vslasResult.error || "Failed to load VSLAs"}
          </p>
        </div>
      </div>
    );
  }

  if (!organizationsResult.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading organizations</h3>
          <p className="text-muted-foreground">
            {organizationsResult.error || "Failed to load organizations"}
          </p>
        </div>
      </div>
    );
  }

  if (!clustersResult.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading clusters</h3>
          <p className="text-muted-foreground">
            {clustersResult.error || "Failed to load clusters"}
          </p>
        </div>
      </div>
    );
  }

  if (!projectsResult.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading projects</h3>
          <p className="text-muted-foreground">
            {projectsResult.error || "Failed to load projects"}
          </p>
        </div>
      </div>
    );
  }

  const vslas = vslasResult.data || [];
  const organizations = organizationsResult.data || [];
  const clusters = clustersResult.data || [];
  const projects = projectsResult.data || [];

  return (
    <VSLAsPageContent
      initialVSLAs={vslas}
      organizations={organizations}
      clusters={clusters}
      projects={projects}
    />
  );
}
