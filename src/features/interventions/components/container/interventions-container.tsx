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
  // Keep default page size but allow the table controls to change it via onPaginationChange
  const [limit, setLimit] = useState(Math.max(25, data.length || 25));

  // Filters
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<string | "">("");
  const [sourceFilter, setSourceFilter] = useState<string | "">("");

  const pagination = {
    page,
    limit,
    // We'll paginate by participant rows (after aggregation)
    total: data.length,
    totalPages: Math.max(1, Math.ceil((data.length || 0) / limit)),
  };

  const filteredData = useMemo(() => {
    // First apply simple filters on flat rows
    const flat = data.filter(d => {
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

    // Aggregate activities per participant so each participant appears once
    const map = new Map<string, Intervention>();
    for (const row of flat) {
      const pid = row.participantId;
      if (!pid) continue;
      const existing = map.get(pid);
      const act = {
        activityId: row.activityId || "",
        activityTitle: row.activityTitle ?? null,
        skillCategory: row.skillCategory ?? null,
        outcomes: row.outcomes ?? null,
        source: row.source,
        attendedAt: row.attendedAt ?? null,
      };

      if (!existing) {
        map.set(pid, {
          participantId: row.participantId,
          participantName: row.participantName,
          participantContact: row.participantContact ?? null,
          // keep top-level single activity fields for backward compatibility
          activityId: row.activityId,
          activityTitle: row.activityTitle,
          skillCategory: row.skillCategory,
          outcomes: row.outcomes ?? null,
          activities: [act],
          source: row.source,
          attendedAt: row.attendedAt ?? null,
        });
      } else {
        // append activity if unique by activityId (ignore source so multiple
        // session records for same activity are considered one activity)
        const exists = existing.activities ?? [];
        const found = exists.find(a => a.activityId === act.activityId);
        if (!found) {
          exists.push(act);
          existing.activities = exists;
        } else {
          // merge missing fields from the new record into the existing activity
          if (!found.skillCategory && act.skillCategory) {
            found.skillCategory = act.skillCategory;
          }
          if (
            (!found.outcomes || found.outcomes.length === 0) &&
            act.outcomes
          ) {
            found.outcomes = act.outcomes;
          } else if (found.outcomes && act.outcomes) {
            // merge unique outcomes
            found.outcomes = Array.from(
              new Set([...found.outcomes, ...act.outcomes])
            );
          }
          if (!found.attendedAt && act.attendedAt) {
            found.attendedAt = act.attendedAt;
          }
          existing.activities = exists;
        }
        // ensure top-level metadata prefers existing but can be filled from row
        existing.source = existing.source || row.source;
        existing.attendedAt = existing.attendedAt || row.attendedAt || null;
        if (!existing.skillCategory && row.skillCategory) {
          existing.skillCategory = row.skillCategory;
        }
        if (
          (!existing.outcomes || existing.outcomes.length === 0) &&
          row.outcomes
        ) {
          existing.outcomes = row.outcomes;
        }
        map.set(pid, existing);
      }
    }

    return Array.from(map.values());
  }, [data, search, skillFilter, sourceFilter]);

  // metrics
  const totalInterventions = filteredData.length;
  // After aggregation filteredData is already one row per participant
  const uniqueParticipants = useMemo(() => filteredData.length, [filteredData]);

  const topSkill = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of filteredData) {
      const k = d.skillCategory ?? "Unknown";
      counts[k] = (counts[k] || 0) + 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "-";
  }, [filteredData]);

  // Selection state: map of row index (string) -> boolean
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // derive selected items from current page slice
  const currentPageData = filteredData.slice((page - 1) * limit, page * limit);
  const selectedItems: Intervention[] = Object.keys(rowSelection)
    .filter(k => rowSelection[k])
    .map(k => currentPageData[Number.parseInt(k)])
    .filter((v): v is Intervention => Boolean(v));

  const clearSelection = () => setRowSelection({});

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
            <div className="my-6">
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
            <div className="mb-3 flex items-center justify-between">
              <div>
                {selectedItems.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      {selectedItems.length} selected
                    </div>
                    <button
                      type="button"
                      className="muted-foreground text-sm underline"
                      onClick={clearSelection}
                    >
                      Clear
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <InterventionsDataTable
              data={currentPageData}
              pagination={{ ...pagination, total: filteredData.length }}
              isLoading={false}
              onPaginationChange={(p, newLimit) => {
                setPage(p);
                setLimit(newLimit);
              }}
              onPageChange={setPage}
              onRowSelectionChange={selected => {
                // Build a selection map keyed by index within currentPageData
                const map: Record<string, boolean> = {};
                for (let i = 0; i < currentPageData.length; i++) {
                  const item = currentPageData[i];
                  if (
                    selected.find(s => s.participantId === item.participantId)
                  ) {
                    map[i.toString()] = true;
                  }
                }
                setRowSelection(map);
              }}
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
