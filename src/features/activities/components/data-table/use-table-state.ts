"use client";

import { useState } from "react";

export function useTableState(initialSearch?: string) {
  const [search, setSearch] = useState(initialSearch || "");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleRowSelectionChange = (rows: string[]) => {
    setSelectedRows(rows);
  };

  return {
    search,
    selectedRows,
    handleSearchChange,
    handleRowSelectionChange,
  };
}
