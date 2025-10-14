"use client";

import React, { useMemo, useState } from "react";
import { InterventionsDataTable } from "@/features/interventions/components/data-table";
import type { Intervention } from "@/features/interventions/types/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { InterventionFilters } from "@/features/interventions/components";

interface InterventionsContainerProps {
  initialData: Intervention[];
}

interface FilterChange {
  skillCategory?: string;
  source?: string;
  search?: string;
}

export default function InterventionsContainer({
  initialData,
}: InterventionsContainerProps) {
  const [data] = useState<Intervention[]>(initialData || []);
  const [page, setPage] = useState(1);
  const [limit] = useState(Math.max(25, data.length || 25));

  // Filters
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<string | "">("");
  const [sourceFilter, setSourceFilter] = useState<string | "">("");

  const pagination = {
    page,
    limit,
    total: data.length,
    totalPages: Math.max(1, Math.ceil((data.length || 0) / limit)),
  };

  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (skillFilter && d.skillCategory !== skillFilter) return false;
      if (sourceFilter && d.source !== sourceFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (d.participantName || "").toLowerCase().includes(q) ||
        (d.activityTitle || "").toLowerCase().includes(q) ||
        (d.skillCategory || "").toLowerCase().includes(q)
      );
    });
  }, [data, search, skillFilter, sourceFilter]);

  // metrics
  const totalInterventions = filteredData.length;
  const uniqueParticipants = useMemo(() => {
    return new Set(filteredData.map(d => d.participantId)).size;
  }, [filteredData]);

  const topSkill = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of filteredData) {
      const k = d.skillCategory ?? "Unknown";
      counts[k] = (counts[k] || 0) + 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "-";
  }, [filteredData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Interventions</h2>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <div className="flex items-center justify-between gap-4">
            <div>
              <InterventionFilters
                initial={{ skillCategory: skillFilter, source: sourceFilter }}
                onChange={(f: FilterChange) => {
                  setSearch(f.search ?? "");
                  setSkillFilter(f.skillCategory ?? "");
                  setSourceFilter(f.source ?? "");
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="btn">Export</button>
              <button className="btn">Import</button>
            </div>
          </div>

          <div>
            <InterventionsDataTable
              data={filteredData}
              pagination={pagination}
              isLoading={false}
              onPaginationChange={setPage}
              onPageChange={setPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title="Total interventions"
              value={totalInterventions}
            />
            <MetricCard
              title="Unique participants"
              value={uniqueParticipants}
            />
            <MetricCard title="Top skill" value={topSkill} />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium">Top skills breakdown</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {/* show badges for top skills */}
              <Badge>Business</Badge>
              <Badge>Vocational</Badge>
              <Badge>Soft skill</Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
