"use client";

import { CountriesTable } from "../countries-table";
import { useEffect, useState } from "react";
import type { countries } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getCountries } from "@/features/locations/actions/countries";

type Country = InferSelectModel<typeof countries>;

export function CountriesTab() {
  const [data, setData] = useState<Country[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCountries();
        if (result && result.success) {
          setData(result.data.data);
        } else {
          console.error("Invalid response from getCountries:", result);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchData();
  }, []);

  return <CountriesTable initialData={data} />;
}
