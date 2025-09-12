import { notFound, redirect } from "next/navigation";
import { getVSLA } from "@/features/vslas/actions/vslas";
import { auth } from "@/features/auth/auth";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { VSLAMembersManagement } from "@/features/vslas/components/members/vsla-members-management/vsla-members-management";

interface VSLAMembersPageProps {
  params: Promise<{ id: string }>;
}

export default async function VSLAMembersPage({
  params,
}: VSLAMembersPageProps) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Unwrap params to get the id
  const { id } = await params;

  const vslaResult = await getVSLA(id);

  if (!vslaResult.success || !vslaResult.data) {
    notFound();
  }

  const vsla = vslaResult.data;

  return (
    <>
      <PageTitle title={`Manage Members - ${vsla.name}`} />
      <div className="container space-y-6 py-6 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <VSLAMembersManagement vsla={vsla} />
        </div>
      </div>
    </>
  );
}
