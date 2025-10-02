"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Wallet } from "lucide-react";
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
            <Users className="h-5 w-5" />
            Member Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Total Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Total Members</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricItem
                  label="Total"
                  value={metrics.totalMembers}
                  className="bg-primary/5"
                />
                <MetricItem label="Aged 15–35" value={metrics.aged15to35} />
                <MetricItem label="Above 35" value={metrics.above35} />
              </div>
            </div>

            {/* Male Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Male Members</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricItem
                  label="Total Males"
                  value={metrics.males.total}
                  className="bg-blue-50 dark:bg-blue-950/20"
                />
                <MetricItem
                  label="Aged 15–35"
                  value={metrics.males.aged15to35}
                />
                <MetricItem label="Above 35" value={metrics.males.above35} />
              </div>
            </div>

            {/* Female Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Female Members</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricItem
                  label="Total Females"
                  value={metrics.females.total}
                  className="bg-pink-50 dark:bg-pink-950/20"
                />
                <MetricItem
                  label="Aged 15–35"
                  value={metrics.females.aged15to35}
                />
                <MetricItem label="Above 35" value={metrics.females.above35} />
              </div>
            </div>

            {/* PWDs */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Persons with Disabilities (PWDs)
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricItem
                  label="Total PWDs"
                  value={metrics.pwds.total}
                  className="bg-purple-50 dark:bg-purple-950/20"
                />
                <MetricItem label="Male PWDs" value={metrics.pwds.male} />
                <MetricItem label="Female PWDs" value={metrics.pwds.female} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Savings */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Wallet className="h-4 w-4" />
                Savings
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricItem
                  label="Total since November last year"
                  value={`UGX ${metrics.totalSavingsSinceNov.toLocaleString()}`}
                  className="bg-green-50 dark:bg-green-950/20"
                />
                <MetricItem
                  label="This month"
                  value={`UGX ${metrics.savingsThisMonth.toLocaleString()}`}
                  className="bg-green-50 dark:bg-green-950/20"
                />
              </div>
            </div>

            {/* Loans */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Wallet className="h-4 w-4" />
                Loans
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricItem
                  label="Total accessed since November last year"
                  value={`UGX ${metrics.totalLoansSinceNov.toLocaleString()}`}
                  className="bg-orange-50 dark:bg-orange-950/20"
                />
                <MetricItem
                  label="Accessed this month"
                  value={`UGX ${metrics.loansThisMonth.toLocaleString()}`}
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

interface MetricItemProps {
  label: string;
  value: string | number;
  className?: string;
}

function MetricItem({ label, value, className = "" }: MetricItemProps) {
  return (
    <div
      className={`hover:bg-accent rounded-lg border p-4 transition-colors ${className}`}
    >
      <p className="text-muted-foreground mb-1 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
