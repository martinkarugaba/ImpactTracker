"use client";

import { MunicipalitiesTable } from "../municipalities-table";
import { useEffect, useState } from "react";
import type { municipalities } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getMunicipalities } from "@/features/locations/actions/municipalities";

type Municipality = InferSelectModel<typeof municipalities> & {
  country: { name: string };
  district: { name: string };
  county: { name: string };
  subCounty: { name: string };
};

interface MunicipalitiesTabProps {
  countryId: string;
}

export function MunicipalitiesTab({ countryId }: MunicipalitiesTabProps) {
  const [data, setData] = useState<Municipality[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getMunicipalities({ countryId });
      if (result.success && result.data?.data) {
        setData(result.data.data);
      }
    };

    fetchData();
  }, [countryId]);

  return (
    <div className="p-4">
      <MunicipalitiesTable municipalities={data} />
    </div>
  );
}
