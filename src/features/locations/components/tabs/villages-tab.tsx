"use client";

import { VillagesTable } from "../villages-table";
import { useEffect, useState } from "react";
import type {
  villages,
  parishes,
  subCounties,
  counties,
  districts,
  countries,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getVillages } from "@/features/locations/actions/villages";

type Village = InferSelectModel<typeof villages> & {
  parish?: InferSelectModel<typeof parishes>;
  subCounty?: InferSelectModel<typeof subCounties>;
  county?: InferSelectModel<typeof counties>;
  district?: InferSelectModel<typeof districts>;
  country?: InferSelectModel<typeof countries>;
};

interface VillagesTabProps {
  parishId?: string;
  subCountyId?: string;
  countyId?: string;
  districtId?: string;
  countryId?: string;
}

export function VillagesTab({
  parishId,
  subCountyId,
  countyId,
  districtId,
  countryId,
}: VillagesTabProps) {
  const [data, setData] = useState<Village[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getVillages({
        parishId,
        subCountyId,
        countyId,
        districtId,
        countryId,
      });
      if (result.success) {
        setData(result.data.data);
      }
    };

    fetchData();
  }, [parishId, subCountyId, countyId, districtId, countryId]);

  return <VillagesTable data={data} />;
}
