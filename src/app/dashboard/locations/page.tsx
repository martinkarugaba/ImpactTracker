import { SiteHeader } from "@/features/dashboard/components/site-header";
import { CountriesTab } from "@/features/locations/components/tabs";

export default async function LocationsPage() {
  return (
    <div className="container mx-auto py-10 pt-0">
      <SiteHeader title="Locations" />
      <div className="mt-4 px-6">
        <CountriesTab />
      </div>
    </div>
  );
}
