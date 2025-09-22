import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LocationsLoading() {
  return (
    <div className="space-y-6">
      {/* Page Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" /> {/* "Locations" title */}
      </div>

      {/* Container with padding */}
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[200px]" />{" "}
                {/* Search/filter input */}
              </div>
              <Skeleton className="h-10 w-[140px]" /> {/* Add Country button */}
            </div>

            {/* Countries Table */}
            <div className="space-y-4">
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
                      {/* Country Name column */}
                      <TableHead className="w-[200px]">
                        <Skeleton className="h-4 w-[80px]" />
                      </TableHead>
                      {/* Country Code column */}
                      <TableHead className="w-[120px]">
                        <Skeleton className="h-4 w-[60px]" />
                      </TableHead>
                      {/* Created Date column */}
                      <TableHead className="w-[150px]">
                        <Skeleton className="h-4 w-[90px]" />
                      </TableHead>
                      {/* Actions column */}
                      <TableHead className="w-[100px]">
                        <Skeleton className="h-4 w-[60px]" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 7 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {/* Checkbox */}
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Skeleton className="h-4 w-4" />
                          </div>
                        </TableCell>
                        {/* Country Name */}
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        {/* Country Code */}
                        <TableCell>
                          <Skeleton className="h-6 w-[40px] rounded-md" />
                        </TableCell>
                        {/* Created Date */}
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
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
                  <Skeleton className="h-4 w-[180px]" /> {/* Results text */}
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-[80px]" /> {/* Previous button */}
                  <Skeleton className="h-9 w-[60px]" /> {/* Next button */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
