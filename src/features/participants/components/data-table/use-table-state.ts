"use client";

import { useState, useCallback, useMemo } from "react";
import { type Participant } from "../../types/types";

export function useTableState(searchTerm?: string, data?: Participant[]) {
  const [search, setSearch] = useState(searchTerm || "");
  const [rowSelectionState, setRowSelectionState] = useState<
    Record<string, boolean>
  >({});

  // Derive selected rows from the row selection state and data
  const selectedRows = useMemo(() => {
    if (!data) return [];
    return data.filter((_, index) => rowSelectionState[index.toString()]);
  }, [rowSelectionState, data]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleRowSelectionStateChange = useCallback(
    (selection: Record<string, boolean>) => {
      setRowSelectionState(selection);
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setRowSelectionState({});
  }, []);

  return {
    search,
    selectedRows,
    rowSelectionState,
    setSearch,
    setRowSelectionState: handleRowSelectionStateChange,
    handleSearchChange,
    handleClearSelection,
  };
}
