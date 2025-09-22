import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LocationDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" /> {/* Page title */}
        <Skeleton className="h-4 w-96" /> {/* Breadcrumb or description */}
      </div>

      {/* Location Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Location name */}
              <Skeleton className="h-4 w-24" /> {/* Location type */}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" /> {/* Edit button */}
              <Skeleton className="h-9 w-24" /> {/* Delete button */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" /> {/* Label */}
              <Skeleton className="h-6 w-32" /> {/* Value */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label */}
              <Skeleton className="h-6 w-24" /> {/* Value */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-6 w-40" /> {/* Value */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-18" /> {/* Label */}
              <Skeleton className="h-6 w-28" /> {/* Value */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Data Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" /> {/* Section title */}
          <Skeleton className="h-9 w-32" /> {/* Add button */}
        </div>

        {/* Related Items Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" /> {/* Item name */}
                    <Skeleton className="h-4 w-4 rounded-full" />{" "}
                    {/* Status indicator */}
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" /> {/* Item detail 1 */}
                    <Skeleton className="h-4 w-28" /> {/* Item detail 2 */}
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-16" /> {/* View button */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" /> {/* Statistics title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-lg" /> {/* Icon */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-16" /> {/* Number */}
                    <Skeleton className="h-4 w-24" /> {/* Label */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
