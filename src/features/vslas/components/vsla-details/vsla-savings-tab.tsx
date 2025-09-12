"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, PiggyBank, TrendingUp, Users, Calendar } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { VSLA } from "../../types";
import { VSLASaving } from "../../schemas/enhanced-vsla-drizzle";
import { getVSLAFinancialSummary } from "../../actions/enhanced-vsla-actions";
import { getVSLAMembers } from "../../actions/vsla-members";
import { toast } from "sonner";

interface VSLASavingsTabProps {
  vsla: VSLA;
}

// Extended savings type with member info
interface SavingWithMember extends VSLASaving {
  member_name?: string;
  member_phone?: string;
}

// Savings columns for VSLA view
const createVSLASavingsColumns = (): ColumnDef<SavingWithMember>[] => [
  {
    accessorKey: "member_name",
    header: "Member",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">
          {row.original.member_name || "Unknown"}
        </div>
        {row.original.member_phone && (
          <div className="text-muted-foreground text-sm">
            {row.original.member_phone}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium text-green-600">
        {formatCurrency(row.original.amount)}
      </div>
    ),
  },
  {
    accessorKey: "contribution_date",
    header: "Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.contribution_date).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "savings_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.savings_type}
      </Badge>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.notes || "-"}</div>
    ),
  },
];

export function VSLASavingsTab({ vsla }: VSLASavingsTabProps) {
  const [savings, setSavings] = useState<SavingWithMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavingsData = async () => {
      setIsLoading(true);
      try {
        // Get financial summary which includes savings data
        const summaryResult = await getVSLAFinancialSummary(vsla.id);
        if (summaryResult.success && summaryResult.data) {
          // Handle financial summary data if needed
        }

        // Get members to enrich savings data
        const membersResult = await getVSLAMembers(vsla.id);
        if (membersResult.success && membersResult.data) {
          const members = membersResult.data;

          // Mock some savings for demonstration
          const mockSavings: SavingWithMember[] = members.flatMap(member => {
            if (member.total_savings > 0) {
              // Generate multiple savings entries for demo
              const savingsEntries = [];
              const numEntries = Math.floor(member.total_savings / 50000) + 1; // Example: one entry per 50k

              for (let i = 0; i < Math.min(numEntries, 5); i++) {
                savingsEntries.push({
                  id: `saving-${member.id}-${i}`,
                  member_id: member.id,
                  vsla_id: vsla.id,
                  amount: member.total_savings / numEntries,
                  contribution_date: new Date(
                    Date.now() - i * 30 * 24 * 60 * 60 * 1000
                  ), // Monthly entries
                  savings_type: "regular",
                  notes: `Regular savings contribution ${i + 1}`,
                  recorded_by: member.id, // Self-recorded for demo
                  created_at: new Date(),
                  updated_at: new Date(),
                  member_name: `${member.first_name} ${member.last_name}`,
                  member_phone: member.phone,
                });
              }
              return savingsEntries;
            }
            return [];
          });

          setSavings(mockSavings);
        }
      } catch (error) {
        console.error("Error loading savings data:", error);
        toast.error("Failed to load savings data");
      } finally {
        setIsLoading(false);
      }
    };

    loadSavingsData();
  }, [vsla.id]);

  const totalSavingsAmount = savings.reduce(
    (sum, saving) => sum + saving.amount,
    0
  );
  const uniqueMembers = new Set(savings.map(saving => saving.member_id)).size;
  const recentSavings = savings.filter(
    saving =>
      new Date(saving.contribution_date) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const averageSaving =
    savings.length > 0 ? totalSavingsAmount / savings.length : 0;

  const savingsColumns = createVSLASavingsColumns();

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-muted-foreground">Loading savings data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSavingsAmount)}
            </div>
            <p className="text-muted-foreground text-xs">
              {savings.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Savers</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueMembers}</div>
            <p className="text-muted-foreground text-xs">
              Contributing members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSavings.length}</div>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(
                recentSavings.reduce((sum, s) => sum + s.amount, 0)
              )}{" "}
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageSaving)}
            </div>
            <p className="text-muted-foreground text-xs">Per contribution</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Savings Contributions</h3>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Savings
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Savings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Savings ({savings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {savings.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No savings found for this VSLA
            </div>
          ) : (
            <DataTable
              columns={savingsColumns}
              data={savings.sort(
                (a, b) =>
                  new Date(b.contribution_date).getTime() -
                  new Date(a.contribution_date).getTime()
              )}
              filterColumn="member_name"
              filterPlaceholder="Search by member name..."
              showColumnToggle={true}
              showPagination={true}
              showRowSelection={false}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
