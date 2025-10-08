"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/features/dashboard/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DistrictsTab,
  CountiesTab,
  SubCountiesTab,
  MunicipalitiesTab,
  ParishesTab,
  VillagesTab,
  CitiesTab,
} from "@/features/locations/components/tabs";
import type { countries } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { useCountry } from "@/features/locations/hooks/use-locations-query";
import { useParams } from "next/navigation";

type Country = InferSelectModel<typeof countries>;

// We'll also accept country directly for SSR first render
interface CountryDetailClientProps {
  country?: Country;
}

export function CountryDetailClient({
  country: initialCountry,
}: CountryDetailClientProps) {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, error } = useCountry(id);

  // Use the server-fetched data as initial value, then React Query will handle subsequent updates
  const country = data?.success && data?.data ? data.data : initialCountry;

  useEffect(() => {
    // This is optional but ensures we refetch on any param changes
    if (id) {
      // Nothing to do here - the query will run automatically based on the queryKey
    }
  }, [id]);

  if (isLoading && !initialCountry) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading country data..." />
      </div>
    );
  }

  if ((error || !country) && !initialCountry) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex flex-col items-start gap-2 rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Error loading country data</h3>
        <p className="text-muted-foreground text-sm">
          {error instanceof Error ? error.message : "Country not found"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-background border-input hover:bg-accent mt-2 rounded-md border px-4 py-2 text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!country) {
    return null;
  }

  return (
    <div>
      <SiteHeader
        heading={`${country.name} Details`}
        text="Manage location data."
      />
      <Tabs defaultValue="districts" className="w-full">
        <TabsList>
          <TabsTrigger value="districts">Districts</TabsTrigger>
          <TabsTrigger value="counties">Counties</TabsTrigger>
          <TabsTrigger value="subcounties">Sub Counties</TabsTrigger>
          <TabsTrigger value="municipalities">Municipalities</TabsTrigger>
          <TabsTrigger value="parishes">Parishes</TabsTrigger>
          <TabsTrigger value="villages">Villages</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
        </TabsList>
        <TabsContent value="districts">
          <DistrictsTab countryId={country.id} />
        </TabsContent>
        <TabsContent value="counties">
          <CountiesTab />
        </TabsContent>
        <TabsContent value="subcounties">
          <SubCountiesTab countryId={country.id} />
        </TabsContent>
        <TabsContent value="municipalities">
          <MunicipalitiesTab countryId={country.id} />
        </TabsContent>
        <TabsContent value="parishes">
          <ParishesTab countryId={country.id} />
        </TabsContent>
        <TabsContent value="villages">
          <VillagesTab countryId={country.id} />
        </TabsContent>
        <TabsContent value="cities">
          <CitiesTab countryId={country.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
