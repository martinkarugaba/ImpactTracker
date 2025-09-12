import { PageTitle } from "@/features/dashboard/components/page-title";
import { CountriesTab } from "@/features/locations/components/tabs";

export default async function LocationsPage() {
  return (
    <>
      <PageTitle title="Locations" />
      <div className="flex flex-1 flex-col px-2 sm:px-4 md:px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:gap-6 md:py-6">
            <CountriesTab />
          </div>
        </div>
      </div>
    </>
  );
}
