import { notFound, redirect } from "next/navigation";
import { getOrganization } from "@/features/organizations/actions/organizations";
import { getOrganizationMembers } from "@/features/organizations/actions/organization-members";
import { auth } from "@/features/auth/auth";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Users } from "lucide-react";
import Link from "next/link";
import { OrganizationMembers } from "@/features/organizations/components/members";

interface OrganizationDetailsPageProps {
  params: Promise<{ id: string }>; // Correctly type params as a Promise
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default async function OrganizationDetailsPage({
  params,
}: OrganizationDetailsPageProps) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Unwrap params using React.use to get the id
  const { id } = await params;

  const organizationResult = await getOrganization(id);
  const membersResult = await getOrganizationMembers(id);

  if (!organizationResult.success || !organizationResult.data) {
    notFound();
  }

  const organization = organizationResult.data;

  return (
    <>
      <PageTitle title={organization.name} />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {organization.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {organization.acronym} • {organization.district},{" "}
                    {organization.country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/organizations/${id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Organization
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/organizations/${id}/members`}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Members
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Name
                          </span>
                          <span className="font-medium">
                            {organization.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Acronym
                          </span>
                          <span className="font-medium">
                            {organization.acronym}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Country
                          </span>
                          <span className="font-medium">
                            {organization.country}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            District
                          </span>
                          <span className="font-medium">
                            {organization.district}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Sub-county
                          </span>
                          <span className="font-medium">
                            {organization.sub_county_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Parish
                          </span>
                          <span className="font-medium">
                            {organization.parish}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Village
                          </span>
                          <span className="font-medium">
                            {organization.village}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Address
                          </span>
                          <span className="font-medium">
                            {organization.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Members Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrganizationMembers
                    organizationId={organization.id}
                    members={
                      membersResult.success && membersResult.data
                        ? membersResult.data
                            .filter(
                              (member: Member | null): member is Member =>
                                member !== null
                            )
                            .map((member: Member) => ({
                              id: member.id,
                              name: member.name,
                              email: member.email,
                              role: member.role,
                              created_at: member.created_at,
                              updated_at: member.updated_at,
                            }))
                        : []
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
