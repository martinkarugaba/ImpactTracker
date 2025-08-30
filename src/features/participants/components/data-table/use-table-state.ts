"use client";

import { useState } from "react";
import { type Participant } from "../../types/types";

export function useTableState(searchTerm?: string) {
  const [search, setSearch] = useState(searchTerm || "");
  const [selectedRows, setSelectedRows] = useState<Participant[]>([]);
  const [rowSelectionState, setRowSelectionState] = useState<
    Record<string, boolean>
  >({});

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleRowSelectionChange = (rows: Participant[]) => {
    setSelectedRows(rows);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
    setRowSelectionState({});
  };

  return {
    search,
    selectedRows,
    rowSelectionState,
    setSearch,
    setSelectedRows,
    setRowSelectionState,
    handleSearchChange,
    handleRowSelectionChange,
    handleClearSelection,
  };
}
