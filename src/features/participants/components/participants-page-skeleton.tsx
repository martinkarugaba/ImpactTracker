"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ParticipantsPageSkeletonProps {
  showActions?: boolean;
  showFilters?: boolean;
  showTable?: boolean;
  tableRows?: number;
}

export function ParticipantsPageSkeleton({
  showActions = true,
  showFilters = true,
  showTable = true,
  tableRows = 10,
}: ParticipantsPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Action Buttons Header */}
      {showActions && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left side - Secondary Actions */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[140px]" />{" "}
              {/* Organization Assignment */}
              <Skeleton className="h-9 w-[130px]" /> {/* Import from Excel */}
              <Skeleton className="h-9 w-[120px]" /> {/* Find Duplicates */}
              <Skeleton className="h-9 w-[100px]" /> {/* Export dropdown */}
              <Skeleton className="h-9 w-[110px]" /> {/* Delete selected */}
            </div>

            {/* Right side - Primary Actions */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[90px]" /> {/* Columns */}
              <Skeleton className="h-9 w-[130px]" /> {/* Add Participant */}
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="space-y-3">
          {/* Main Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Filter */}
            <Skeleton className="h-10 w-[280px]" />

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-8 w-[70px]" />
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-8 w-[65px]" />
            </div>

            {/* More Filters Button */}
            <Skeleton className="h-8 w-[140px]" />
          </div>

          {/* Active Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-[90px] rounded-full" />
            <Skeleton className="h-6 w-[110px] rounded-full" />
            <Skeleton className="h-6 w-[75px] rounded-full" />
            <Skeleton className="h-6 w-[95px] rounded-full" />
          </div>
        </div>
      )}

      {/* Table Section */}
      {showTable && (
        <div className="space-y-4">
          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader className="bg-muted text-muted-foreground">
                <TableRow>
                  {/* Checkbox column */}
                  <TableHead className="w-[50px]">
                    <div className="flex items-center justify-center">
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </TableHead>
                  {/* Name column */}
                  <TableHead className="w-[180px]">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableHead>
                  {/* Contact column */}
                  <TableHead className="w-[140px]">
                    <Skeleton className="h-4 w-[60px]" />
                  </TableHead>
                  {/* Age column */}
                  <TableHead className="w-[80px]">
                    <Skeleton className="h-4 w-[35px]" />
                  </TableHead>
                  {/* Gender column */}
                  <TableHead className="w-[100px]">
                    <Skeleton className="h-4 w-[50px]" />
                  </TableHead>
                  {/* Location column */}
                  <TableHead className="w-[200px]">
                    <Skeleton className="h-4 w-[70px]" />
                  </TableHead>
                  {/* Skills column */}
                  <TableHead className="w-[150px]">
                    <Skeleton className="h-4 w-[45px]" />
                  </TableHead>
                  {/* Organization column */}
                  <TableHead className="w-[160px]">
                    <Skeleton className="h-4 w-[85px]" />
                  </TableHead>
                  {/* Actions column */}
                  <TableHead className="w-[50px]">
                    <Skeleton className="h-4 w-[50px]" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: tableRows }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {/* Checkbox */}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </TableCell>
                    {/* Name */}
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-[140px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </TableCell>
                    {/* Contact */}
                    <TableCell>
                      <Skeleton className="h-4 w-[110px]" />
                    </TableCell>
                    {/* Age */}
                    <TableCell>
                      <Skeleton className="h-4 w-[25px]" />
                    </TableCell>
                    {/* Gender */}
                    <TableCell>
                      <Skeleton className="h-6 w-[60px] rounded-full" />
                    </TableCell>
                    {/* Location */}
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-[120px]" />
                        <Skeleton className="h-3 w-[90px]" />
                      </div>
                    </TableCell>
                    {/* Skills */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-[50px] rounded" />
                        <Skeleton className="h-5 w-[40px] rounded" />
                        <Skeleton className="h-5 w-[35px] rounded" />
                      </div>
                    </TableCell>
                    {/* Organization */}
                    <TableCell>
                      <Skeleton className="h-4 w-[130px]" />
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-[200px]" /> {/* Results text */}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[80px]" /> {/* Previous button */}
              <Skeleton className="h-9 w-[60px]" /> {/* Next button */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Specific skeleton components for different sections
export function ParticipantsActionsLoadingSkeleton() {
  return (
    <ParticipantsPageSkeleton
      showActions={true}
      showFilters={false}
      showTable={false}
    />
  );
}

export function ParticipantsTableLoadingSkeleton({
  rows = 10,
}: {
  rows?: number;
}) {
  return (
    <ParticipantsPageSkeleton
      showActions={false}
      showFilters={false}
      showTable={true}
      tableRows={rows}
    />
  );
}

export function ParticipantsFiltersLoadingSkeleton() {
  return (
    <ParticipantsPageSkeleton
      showActions={false}
      showFilters={true}
      showTable={false}
    />
  );
}
