import { PageTitle } from "@/features/dashboard/components/page-title";
import { CountriesTab } from "@/features/locations/components/tabs";

export default async function LocationsPage() {
  return (
    <div className="container mx-auto py-10 pt-0">
      <PageTitle title="Locations" />
      <div className="mt-4 px-6">
        <CountriesTab />
      </div>
    </div>
  );
}
