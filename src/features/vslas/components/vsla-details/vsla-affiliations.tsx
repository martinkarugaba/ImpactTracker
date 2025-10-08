import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Layers3, FolderOpen } from "lucide-react";
import type { VSLA } from "../../types";

interface VSLAAffiliationsProps {
  vsla: VSLA;
}

export function VSLAAffiliations({ vsla }: VSLAAffiliationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vsla.organization && (
          <div className="flex items-center gap-3">
            <Building2 className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Organization</p>
              <p className="text-muted-foreground text-sm">
                {vsla.organization.name} ({vsla.organization.acronym})
              </p>
            </div>
          </div>
        )}
        {vsla.cluster && (
          <div className="flex items-center gap-3">
            <Layers3 className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Cluster</p>
              <p className="text-muted-foreground text-sm">
                {vsla.cluster.name}
              </p>
            </div>
          </div>
        )}
        {vsla.project && (
          <div className="flex items-center gap-3">
            <FolderOpen className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Project</p>
              <p className="text-muted-foreground text-sm">
                {vsla.project.name} ({vsla.project.acronym})
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
