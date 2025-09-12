"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { VSLA } from "../../types";
import { VSLALoan } from "../../schemas/enhanced-vsla-drizzle";
import { getMemberLoans } from "../../actions/enhanced-vsla-actions";
import { getVSLAMembers } from "../../actions/vsla-members";
import { toast } from "sonner";

interface VSLALoansTabProps {
  vsla: VSLA;
}

// Extended loan type with member info
interface LoanWithMember extends VSLALoan {
  member_name?: string;
}

// Mock loan interface for demo data
interface MockLoan {
  id: string;
  vsla_id: string;
  member_id: string;
  member_name: string;
  loan_amount: number;
  interest_rate: string;
  loan_purpose: string | null;
  loan_date: Date;
  due_date: Date | null;
  status: string;
  total_paid: number;
  balance_remaining: number;
  created_at: Date | null;
  updated_at: Date | null;
}

// Loan columns for VSLA view
const createVSLALoanColumns = (): ColumnDef<LoanWithMember | MockLoan>[] => [
  {
    accessorKey: "member_name",
    header: "Member",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.member_name || "Unknown"}</div>
    ),
  },
  {
    accessorKey: "loan_amount",
    header: "Loan Amount",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.original.loan_amount)}
      </div>
    ),
  },
  {
    accessorKey: "balance_remaining",
    header: "Balance",
    cell: ({ row }) => (
      <div className="font-medium text-red-600">
        {formatCurrency(row.original.balance_remaining)}
      </div>
    ),
  },
  {
    accessorKey: "interest_rate",
    header: "Interest Rate",
    cell: ({ row }) => <div>{row.original.interest_rate}%</div>,
  },
  {
    accessorKey: "loan_date",
    header: "Loan Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.loan_date).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => (
      <div>
        {row.original.due_date
          ? new Date(row.original.due_date).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "active"
            ? "default"
            : row.original.status === "completed"
              ? "outline"
              : "destructive"
        }
        className="capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "loan_purpose",
    header: "Purpose",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">
        {row.original.loan_purpose || "-"}
      </div>
    ),
  },
];

export function VSLALoansTab({ vsla }: VSLALoansTabProps) {
  const [loans, setLoans] = useState<(LoanWithMember | MockLoan)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLoansData = async () => {
      setIsLoading(true);
      try {
        // Get VSLA members first, then their loans
        const membersResult = await getVSLAMembers(vsla.id);
        if (membersResult.success && membersResult.data) {
          const members = membersResult.data;
          const allLoans: LoanWithMember[] = [];

          // Get loans for each member
          for (const member of members) {
            try {
              const memberLoansResult = await getMemberLoans(member.id);
              if (memberLoansResult.success && memberLoansResult.data) {
                const memberLoansWithNames = memberLoansResult.data.map(
                  (loan: VSLALoan) => ({
                    ...loan,
                    member_name: `${member.first_name} ${member.last_name}`,
                  })
                );
                allLoans.push(...memberLoansWithNames);
              }
            } catch (error) {
              console.error(
                `Error loading loans for member ${member.id}:`,
                error
              );
            }
          }

          setLoans(allLoans);
        } else {
          // Get members for mock data
          const membersResult = await getVSLAMembers(vsla.id);
          const members = membersResult.success ? membersResult.data || [] : [];

          // Mock some loans for demonstration
          const mockLoans: MockLoan[] = members
            .slice(0, 3)
            .map((member, index) => ({
              id: `loan-${index + 1}`,
              vsla_id: vsla.id,
              member_id: member.id,
              member_name: `${member.first_name} ${member.last_name}`,
              loan_amount: [500000, 300000, 750000][index],
              interest_rate: "5.00",
              loan_purpose: ["Small business", "Education fees", "Agriculture"][
                index
              ],
              loan_date: new Date(
                Date.now() - (index + 1) * 30 * 24 * 60 * 60 * 1000
              ),
              due_date: new Date(
                Date.now() + (6 - index) * 30 * 24 * 60 * 60 * 1000
              ),
              status: ["active", "active", "completed"][index],
              total_paid: [100000, 50000, 750000][index],
              balance_remaining: [400000, 250000, 0][index],
              created_at: new Date(),
              updated_at: new Date(),
            }));

          setLoans(mockLoans);
        }
      } catch (error) {
        console.error("Error loading loans data:", error);
        toast.error("Failed to load loans data");
      } finally {
        setIsLoading(false);
      }
    };

    loadLoansData();
  }, [vsla.id]);

  const activeLoans = loans.filter(loan => loan.status === "active");
  const completedLoans = loans.filter(loan => loan.status === "completed");
  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + loan.loan_amount,
    0
  );
  const totalOutstanding = loans.reduce(
    (sum, loan) => sum + loan.balance_remaining,
    0
  );

  const loanColumns = createVSLALoanColumns();

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-muted-foreground">Loading loans data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loans Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-muted-foreground text-xs">
              {activeLoans.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalLoanAmount)}
            </div>
            <p className="text-muted-foreground text-xs">All time loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-muted-foreground text-xs">To be repaid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedLoans.length}
            </div>
            <p className="text-muted-foreground text-xs">Fully repaid</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Loan Portfolio</h3>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Issue Loan
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Loans ({loans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No loans found for this VSLA
            </div>
          ) : (
            <DataTable
              columns={loanColumns}
              data={loans.sort(
                (a, b) =>
                  new Date(b.loan_date).getTime() -
                  new Date(a.loan_date).getTime()
              )}
              filterColumn="status"
              filterPlaceholder="Search by status..."
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
