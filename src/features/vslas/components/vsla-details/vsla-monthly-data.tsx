"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  DollarSign,
  PiggyBank,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import type { VSLA, VSLAMonthlyData as VSLAMonthlyDataType } from "../../types";
import { toast } from "sonner";
import {
  saveVSLAMonthlyData,
  getVSLAMonthlyData,
  deleteVSLAMonthlyData,
} from "../../actions/vsla-monthly-data-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VSLAMonthlyDataProps {
  vsla: VSLA;
}

interface MonthlyData {
  month: string;
  year: string;
  totalLoans: number;
  totalSavings: number;
  totalMeetings: number;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const currentYear = new Date().getFullYear();
  return (currentYear - 5 + i).toString();
});

export function VSLAMonthlyData({ vsla }: VSLAMonthlyDataProps) {
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();

  const [formData, setFormData] = useState<MonthlyData>({
    month: currentMonth,
    year: currentYear,
    totalLoans: 0,
    totalSavings: 0,
    totalMeetings: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<VSLAMonthlyDataType[]>(
    []
  );

  // Fetch historical data on mount
  useEffect(() => {
    fetchHistoricalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistoricalData = async () => {
    setIsLoading(true);
    const result = await getVSLAMonthlyData(vsla.id);
    if (result.success && result.data) {
      setHistoricalData(result.data as VSLAMonthlyDataType[]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await saveVSLAMonthlyData({
        vslaId: vsla.id,
        month: formData.month,
        year: formData.year,
        totalLoans: formData.totalLoans,
        totalSavings: formData.totalSavings,
        totalMeetings: formData.totalMeetings,
      });

      if (result.success) {
        toast.success(result.message || "Monthly data saved successfully");

        // Reset form
        setFormData({
          ...formData,
          totalLoans: 0,
          totalSavings: 0,
          totalMeetings: 0,
        });

        // Refresh historical data
        await fetchHistoricalData();
      } else {
        toast.error(result.error || "Failed to save monthly data");
      }
    } catch (error) {
      toast.error("Failed to save monthly data");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this monthly record?")) {
      return;
    }

    const result = await deleteVSLAMonthlyData(id, vsla.id);

    if (result.success) {
      toast.success(result.message || "Monthly data deleted successfully");
      await fetchHistoricalData();
    } else {
      toast.error(result.error || "Failed to delete monthly data");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          Monthly Data Collection
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Record total loans, savings, and meetings for a specific month
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Month and Year Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.month}
                onValueChange={month => setFormData({ ...formData, month })}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={formData.year}
                onValueChange={year => setFormData({ ...formData, year })}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Input Fields */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalLoans" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                Total Loans
              </Label>
              <Input
                id="totalLoans"
                type="number"
                min="0"
                placeholder="0"
                value={formData.totalLoans || ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    totalLoans: parseInt(e.target.value) || 0,
                  })
                }
                className="text-right"
              />
              <p className="text-muted-foreground text-xs">
                Number of loans disbursed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSavings" className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-emerald-600" />
                Total Savings
              </Label>
              <Input
                id="totalSavings"
                type="number"
                min="0"
                placeholder="0"
                value={formData.totalSavings || ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    totalSavings: parseInt(e.target.value) || 0,
                  })
                }
                className="text-right"
              />
              <p className="text-muted-foreground text-xs">
                Total savings amount
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="totalMeetings"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4 text-purple-600" />
                Total Meetings
              </Label>
              <Input
                id="totalMeetings"
                type="number"
                min="0"
                placeholder="0"
                value={formData.totalMeetings || ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    totalMeetings: parseInt(e.target.value) || 0,
                  })
                }
                className="text-right"
              />
              <p className="text-muted-foreground text-xs">
                Number of meetings held
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Summary for {formData.month} {formData.year}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <strong>{formData.totalLoans}</strong> loans
                    </span>
                    <span className="flex items-center gap-1">
                      <PiggyBank className="h-3 w-3" />
                      <strong>{formData.totalSavings}</strong> in savings
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <strong>{formData.totalMeetings}</strong> meetings
                    </span>
                  </div>
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historical Data */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Monthly Records ({historicalData.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading monthly data...
              </div>
            ) : historicalData.length === 0 ? (
              <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
                No monthly data recorded yet. Submit the form above to add your
                first entry.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Loans</TableHead>
                      <TableHead className="text-right">Savings</TableHead>
                      <TableHead className="text-right">Meetings</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalData.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.month} {record.year}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="flex items-center justify-end gap-1">
                            <DollarSign className="h-3 w-3 text-red-600" />
                            {record.total_loans}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="flex items-center justify-end gap-1">
                            <PiggyBank className="h-3 w-3 text-emerald-600" />
                            {record.total_savings}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="flex items-center justify-end gap-1">
                            <Calendar className="h-3 w-3 text-purple-600" />
                            {record.total_meetings}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
