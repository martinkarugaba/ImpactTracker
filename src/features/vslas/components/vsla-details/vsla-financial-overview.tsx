import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { VSLA } from "../../types";

interface VSLAFinancialOverviewProps {
  vsla: VSLA;
}

export function VSLAFinancialOverview({ vsla }: VSLAFinancialOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-muted-foreground text-sm font-medium">
                Total Savings
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(vsla.total_savings)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-muted-foreground text-sm font-medium">
                Total Loans
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(vsla.total_loans)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-muted-foreground text-sm font-medium">
                Net Difference
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(vsla.total_savings - vsla.total_loans)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
