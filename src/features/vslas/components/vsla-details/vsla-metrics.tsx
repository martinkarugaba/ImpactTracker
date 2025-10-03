"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  IconUsers,
  IconUser,
  IconUserCheck,
  IconTrendingUp,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { VSLA } from "../../types";

interface VSLAMetricsProps {
  vsla: VSLA;
}

export function VSLAMetrics({ vsla }: VSLAMetricsProps) {
  // Mock data - this will be replaced with actual data from the database
  const metrics = {
    totalMembers: vsla.members?.length || 0,
    aged15to35: 0,
    above35: 0,
    males: {
      total: 0,
      aged15to35: 0,
      above35: 0,
    },
    females: {
      total: 0,
      aged15to35: 0,
      above35: 0,
    },
    pwds: {
      total: 0,
      male: 0,
      female: 0,
    },
    totalSavingsSinceNov: 0,
    savingsThisMonth: 0,
    totalLoansSinceNov: 0,
    loansThisMonth: 0,
  };

  // TODO: Calculate actual metrics from members data
  // This requires member data with age, gender, and PWD status

  return (
    <div className="space-y-6">
      {/* Demographics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Member Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Total Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Total Members</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Total"
                  value={metrics.totalMembers}
                  icon={<IconUsers className="size-4 text-blue-600" />}
                  footer={{
                    title: "All members",
                    description: "Total VSLA membership",
                  }}
                  className="bg-primary/5"
                />
                <MetricCard
                  title="Aged 15–35"
                  value={metrics.aged15to35}
                  icon={<IconUserCheck className="size-4 text-green-600" />}
                  footer={{
                    title: "Youth members",
                    description: "Age 15-35 years",
                  }}
                />
                <MetricCard
                  title="Above 35"
                  value={metrics.above35}
                  icon={<IconUser className="size-4 text-purple-600" />}
                  footer={{
                    title: "Senior members",
                    description: "Above 35 years",
                  }}
                />
              </div>
            </div>

            {/* Male Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Male Members</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Total Males"
                  value={metrics.males.total}
                  icon={<IconUser className="size-4 text-blue-600" />}
                  footer={{
                    title: "All male members",
                    description: "Total male participation",
                  }}
                  className="bg-blue-50 dark:bg-blue-950/20"
                />
                <MetricCard
                  title="Aged 15–35"
                  value={metrics.males.aged15to35}
                  icon={<IconUserCheck className="size-4 text-blue-600" />}
                  footer={{
                    title: "Young males",
                    description: "Age 15-35 years",
                  }}
                />
                <MetricCard
                  title="Above 35"
                  value={metrics.males.above35}
                  icon={<IconUser className="size-4 text-blue-600" />}
                  footer={{
                    title: "Senior males",
                    description: "Above 35 years",
                  }}
                />
              </div>
            </div>

            {/* Female Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Female Members</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Total Females"
                  value={metrics.females.total}
                  icon={<IconUser className="size-4 text-pink-600" />}
                  footer={{
                    title: "All female members",
                    description: "Total female participation",
                  }}
                  className="bg-pink-50 dark:bg-pink-950/20"
                />
                <MetricCard
                  title="Aged 15–35"
                  value={metrics.females.aged15to35}
                  icon={<IconUserCheck className="size-4 text-pink-600" />}
                  footer={{
                    title: "Young females",
                    description: "Age 15-35 years",
                  }}
                />
                <MetricCard
                  title="Above 35"
                  value={metrics.females.above35}
                  icon={<IconUser className="size-4 text-pink-600" />}
                  footer={{
                    title: "Senior females",
                    description: "Above 35 years",
                  }}
                />
              </div>
            </div>

            {/* PWDs */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Persons with Disabilities (PWDs)
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Total PWDs"
                  value={metrics.pwds.total}
                  icon={<IconUsers className="size-4 text-purple-600" />}
                  footer={{
                    title: "All PWDs",
                    description: "Inclusive participation",
                  }}
                  className="bg-purple-50 dark:bg-purple-950/20"
                />
                <MetricCard
                  title="Male PWDs"
                  value={metrics.pwds.male}
                  icon={<IconUser className="size-4 text-purple-600" />}
                  footer={{
                    title: "Male PWDs",
                    description: "Male members with disabilities",
                  }}
                />
                <MetricCard
                  title="Female PWDs"
                  value={metrics.pwds.female}
                  icon={<IconUser className="size-4 text-purple-600" />}
                  footer={{
                    title: "Female PWDs",
                    description: "Female members with disabilities",
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5" />
            Financial Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Savings */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <IconCurrencyDollar className="h-4 w-4" />
                Savings
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  title="Total since November last year"
                  value={`UGX ${metrics.totalSavingsSinceNov.toLocaleString()}`}
                  icon={<IconTrendingUp className="size-4 text-green-600" />}
                  footer={{
                    title: "Accumulated savings",
                    description: "Since November last year",
                  }}
                  className="bg-green-50 dark:bg-green-950/20"
                />
                <MetricCard
                  title="This month"
                  value={`UGX ${metrics.savingsThisMonth.toLocaleString()}`}
                  icon={
                    <IconCurrencyDollar className="size-4 text-green-600" />
                  }
                  footer={{
                    title: "Recent contributions",
                    description: "Current month savings",
                  }}
                  className="bg-green-50 dark:bg-green-950/20"
                />
              </div>
            </div>

            {/* Loans */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <IconCurrencyDollar className="h-4 w-4" />
                Loans
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  title="Total accessed since November last year"
                  value={`UGX ${metrics.totalLoansSinceNov.toLocaleString()}`}
                  icon={<IconTrendingUp className="size-4 text-orange-600" />}
                  footer={{
                    title: "Total loans disbursed",
                    description: "Since November last year",
                  }}
                  className="bg-orange-50 dark:bg-orange-950/20"
                />
                <MetricCard
                  title="Accessed this month"
                  value={`UGX ${metrics.loansThisMonth.toLocaleString()}`}
                  icon={
                    <IconCurrencyDollar className="size-4 text-orange-600" />
                  }
                  footer={{
                    title: "Recent loans",
                    description: "Current month disbursements",
                  }}
                  className="bg-orange-50 dark:bg-orange-950/20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
