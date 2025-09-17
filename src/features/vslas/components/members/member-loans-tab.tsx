"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { VSLAMember } from "../../actions/vsla-members";
import { VSLALoan, VSLALoanPayment } from "../../schemas/enhanced-vsla-drizzle";
import {
  getMemberLoans,
  getLoanPayments,
} from "../../actions/enhanced-vsla-actions";
import { toast } from "sonner";

interface MemberLoansTabProps {
  member: VSLAMember;
}

// Loan columns
const createLoanColumns = (): ColumnDef<VSLALoan>[] => [
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
    accessorKey: "interest_rate",
    header: "Interest Rate",
    cell: ({ row }) => <div>{row.original.interest_rate}%</div>,
  },
  {
    accessorKey: "loan_date",
    header: "Date",
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
            : row.original.status === "paid"
              ? "secondary"
              : "destructive"
        }
        className="capitalize"
      >
        {row.original.status}
      </Badge>
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
];

// Payment columns
const createPaymentColumns = (): ColumnDef<VSLALoanPayment>[] => [
  {
    accessorKey: "payment_amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.original.payment_amount)}
      </div>
    ),
  },
  {
    accessorKey: "payment_date",
    header: "Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.payment_date).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Method",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.payment_method || "Cash"}
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

export function MemberLoansTab({ member }: MemberLoansTabProps) {
  const [loans, setLoans] = useState<VSLALoan[]>([]);
  const [payments, setPayments] = useState<VSLALoanPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLoansData = async () => {
      setIsLoading(true);
      try {
        // Load member loans
        const loansResult = await getMemberLoans(member.id);
        if (loansResult.success && loansResult.data) {
          setLoans(loansResult.data);

          // Load payments for all loans
          const allPayments: VSLALoanPayment[] = [];
          for (const loan of loansResult.data) {
            const paymentsResult = await getLoanPayments(loan.id);
            if (paymentsResult.success && paymentsResult.data) {
              allPayments.push(...paymentsResult.data);
            }
          }
          setPayments(allPayments);
        }
      } catch (error) {
        console.error("Error loading loans data:", error);
        toast.error("Failed to load loans data");
      } finally {
        setIsLoading(false);
      }
    };

    loadLoansData();
  }, [member.id]);

  const activeLoans = loans.filter(loan => loan.status === "active");
  const totalActiveAmount = activeLoans.reduce(
    (sum, loan) => sum + loan.loan_amount,
    0
  );
  const totalBalance = activeLoans.reduce(
    (sum, loan) => sum + loan.balance_remaining,
    0
  );

  const loanColumns = createLoanColumns();
  const paymentColumns = createPaymentColumns();

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(totalActiveAmount)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-muted-foreground text-xs">
              Across {activeLoans.length} loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(
                payments.reduce((sum, p) => sum + p.payment_amount, 0)
              )}{" "}
              total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Loans & Payments</h3>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Loan
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Active Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Loans ({activeLoans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No active loans found
            </div>
          ) : (
            <DataTable
              columns={loanColumns}
              data={activeLoans}
              showColumnToggle={false}
              showPagination={false}
              showRowSelection={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No payments recorded
            </div>
          ) : (
            <DataTable
              columns={paymentColumns}
              data={payments.slice(0, 10)} // Show last 10 payments
              showColumnToggle={false}
              showPagination={false}
              showRowSelection={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
