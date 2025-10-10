"use client";

import { CountiesTable } from "../counties-table";
import { useEffect, useState } from "react";
import type { counties, districts } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getCounties } from "@/features/locations/actions/counties";

type District = InferSelectModel<typeof districts>;

type County = InferSelectModel<typeof counties> & {
  district?: District;
};

interface CountiesTabProps {
  districtId?: string;
}

export function CountiesTab({ districtId }: CountiesTabProps) {
  const [data, setData] = useState<County[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getCounties({ districtId });
      if (result.success && result.data?.data) {
        setData(result.data.data);
      }
    };

    fetchData();
  }, [districtId]);

  return <CountiesTable data={data} />;
}
