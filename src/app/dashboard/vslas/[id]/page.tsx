import { notFound, redirect } from "next/navigation";
import { getVSLA } from "@/features/vslas/actions/vslas";
import { auth } from "@/features/auth/auth";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { VSLADetailsHeader } from "@/features/vslas/components/vsla-details/vsla-details-header";
import { VSLAStatsOverview } from "@/features/vslas/components/vsla-details/vsla-stats-overview";
import { VSLADetailsTabs } from "@/features/vslas/components/vsla-details/vsla-details-tabs";

interface VSLADetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function VSLADetailsPage({
  params,
}: VSLADetailsPageProps) {
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
      <SiteHeader title={vsla.name} />
      <div className="container space-y-6 py-6 lg:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <VSLADetailsHeader vsla={vsla} />

          {/* Stats Overview */}
          <VSLAStatsOverview vsla={vsla} />

          {/* Tabbed Content */}
          <VSLADetailsTabs vsla={vsla} />
        </div>
      </div>
    </>
  );
}
