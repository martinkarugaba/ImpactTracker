"use client";

import React from "react";
import type { Intervention } from "../../types/types";

export interface InterventionsTableProps {
  data: Intervention[];
  className?: string;
}

export const InterventionsTable: React.FC<InterventionsTableProps> = ({
  data,
  className,
}) => {
  return (
    <div className={className}>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left">
            <th className="border p-2">Participant</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Activity</th>
            <th className="border p-2">Skill Category</th>
            <th className="border p-2">Outcomes</th>
            <th className="border p-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="p-4" colSpan={6}>
                No interventions found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={`${row.participantId}-${row.activityId}-${idx}`}>
                <td className="border p-2">
                  {row.participantName || "Unknown"}
                </td>
                <td className="border p-2">{row.participantContact ?? "-"}</td>
                <td className="border p-2">{row.activityTitle ?? "-"}</td>
                <td className="border p-2">{row.skillCategory ?? "-"}</td>
                <td className="border p-2">
                  {row.outcomes ? row.outcomes.join(", ") : "-"}
                </td>
                <td className="border p-2">{row.source}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InterventionsTable;
