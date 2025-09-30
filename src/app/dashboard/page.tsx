import type { Metadata } from "next";
import { PageTitle } from "@/features/dashboard/components/page-title";
import { KPIOverviewDashboard } from "@/features/dashboard/components/kpi-overview-dashboard";

export const metadata: Metadata = {
  title: "Dashboard - KPI Edge",
  description:
    "Impact tracking dashboard overview with key performance indicators",
};

export default function DashboardPage() {
  return (
    <>
      <PageTitle title="Overview" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <KPIOverviewDashboard />
          </div>
        </div>
      </div>
    </>
  );
}
