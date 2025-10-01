import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive";
import { MetricCards } from "@/components/ui/metric-cards";
import { PageTitle } from "@/features/dashboard/components/page-title";

// import { DashboardTable } from "./dashboard-table";
import { Card, CardContent } from "@/components/ui/card";

// import data from "./data.json";
export default function Page() {
  try {
    return (
      <>
        <PageTitle title="Dashboard" />
        <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
              <MetricCards />
              <div className="px-1 sm:px-2 md:px-4 lg:px-0">
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
