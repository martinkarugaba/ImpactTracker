"use client";

import { SubCountiesTable } from "../subcounties-table";
import { useEffect, useState } from "react";
import type {
  subCounties,
  districts,
  counties,
  countries,
} from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getSubCounties } from "@/features/locations/actions/subcounties";

type SubCounty = InferSelectModel<typeof subCounties> & {
  district?: InferSelectModel<typeof districts>;
  county?: InferSelectModel<typeof counties>;
  country?: InferSelectModel<typeof countries>;
};

interface SubCountiesTabProps {
  districtId?: string;
  countyId?: string;
  countryId?: string;
}

export function SubCountiesTab({
  districtId,
  countyId,
  countryId,
}: SubCountiesTabProps) {
  const [data, setData] = useState<SubCounty[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSubCounties({
        districtId,
        countyId,
        countryId,
      });
      if (result.success && result.data?.data) {
        setData(result.data.data);
      }
    };

    fetchData();
  }, [districtId, countyId, countryId]);

  return <SubCountiesTable data={data} />;
}
