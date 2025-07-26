import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { VSLA } from "../../types";

interface VSLAStatsOverviewProps {
  vsla: VSLA;
}

export function VSLAStatsOverview({ vsla }: VSLAStatsOverviewProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Members
              </p>
              <p className="text-2xl font-bold">{vsla.total_members}</p>
            </div>
            <Users className="text-muted-foreground h-8 w-8" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Savings
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(vsla.total_savings)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Loans
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(vsla.total_loans)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
