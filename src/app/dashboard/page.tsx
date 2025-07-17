import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive";
import { MetricCards } from "@/components/ui/metric-cards";
import { SiteHeader } from "@/features/dashboard/components/site-header";

// import { DashboardTable } from "./dashboard-table";
import { Card, CardContent } from "@/components/ui/card";

// import data from "./data.json";
export default function Page() {
  try {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <MetricCards />
              <div className="px-4 lg:px-0">
                <ChartAreaInteractive />
              </div>
              {/* <DashboardTable data={data} /> */}
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="container space-y-6 py-6">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error loading dashboard data:{" "}
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
