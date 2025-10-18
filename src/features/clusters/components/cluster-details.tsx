"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClusterMembersTab } from "./cluster-members-tab";
import { ClusterUsersTab } from "./cluster-users-tab";

interface ClusterDetailsProps {
  cluster: {
    id: string;
    name: string;
    about: string | null;
    country: string;
    districts: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

// Export the component
export function ClusterDetails({ cluster }: ClusterDetailsProps) {
  return (
    <div className="container mx-auto space-y-6 py-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Information</CardTitle>
              <CardDescription>
                Basic details about this cluster
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Name
                  </h3>
                  <p className="text-base">{cluster.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Country
                  </h3>
                  <p className="text-base">{cluster.country}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Districts
                  </h3>
                  <p className="text-base">
                    {cluster.districts && cluster.districts.length > 0
                      ? cluster.districts.join(", ")
                      : "No districts specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Created
                  </h3>
                  <p className="text-base">
                    {cluster.createdAt instanceof Date
                      ? cluster.createdAt.toLocaleDateString()
                      : new Date(cluster.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {cluster.about && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    About
                  </h3>
                  <p className="text-base">{cluster.about}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <ClusterMembersTab clusterId={cluster.id} />
        </TabsContent>

        <TabsContent value="users">
          <ClusterUsersTab clusterId={cluster.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
