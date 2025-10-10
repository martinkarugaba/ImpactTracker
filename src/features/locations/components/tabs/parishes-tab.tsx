"use client";

import { ParishesTable } from "../parishes-table";
import { useEffect, useState } from "react";
import type {
  parishes,
  countries,
  counties,
  districts,
  subCounties,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getParishes } from "@/features/locations/actions/parishes";

type Parish = InferSelectModel<typeof parishes> & {
  subCounty?: InferSelectModel<typeof subCounties>;
  district?: InferSelectModel<typeof districts>;
  county?: InferSelectModel<typeof counties>;
  country?: InferSelectModel<typeof countries>;
};

interface ParishesTabProps {
  subCountyId?: string;
  countyId?: string;
  districtId?: string;
  countryId?: string;
}

export function ParishesTab({
  subCountyId,
  countyId,
  districtId,
  countryId,
}: ParishesTabProps) {
  const [data, setData] = useState<Parish[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getParishes({
        subCountyId,
        countyId,
        districtId,
        countryId,
      });
      if (result.success && result.data?.data) {
        setData(result.data.data);
      }
    };

    fetchData();
  }, [subCountyId, countyId, districtId, countryId]);

  return <ParishesTable data={data} />;
}
