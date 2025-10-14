"use client";

import React, { useState } from "react";
import { InterventionsDataTable } from "@/features/interventions/components/data-table";
import type { Intervention } from "@/features/interventions/types/types";

interface InterventionsContainerProps {
  initialData: Intervention[];
}

export default function InterventionsContainer({
  initialData,
}: InterventionsContainerProps) {
  const [data] = useState<Intervention[]>(initialData || []);
  const [page, setPage] = useState(1);
  const [limit] = useState(Math.max(25, data.length || 25));

  const pagination = {
    page,
    limit,
    total: data.length,
    totalPages: Math.max(1, Math.ceil((data.length || 0) / limit)),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Interventions</h2>
        <div className="flex items-center space-x-2">
          <button className="btn">Export</button>
          <button className="btn">Filters</button>
        </div>
      </div>

      <div>
        <InterventionsDataTable
          data={data}
          pagination={pagination}
          isLoading={false}
          onPaginationChange={setPage}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
