"use client";

import { SiteHeader } from "@/features/dashboard/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Country = InferSelectModel<typeof countries>;

interface CountryDetailProps {
  country: Country;
}

export function CountryDetail({ country }: CountryDetailProps) {
  return (
    <>
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
    </>
  );
}
