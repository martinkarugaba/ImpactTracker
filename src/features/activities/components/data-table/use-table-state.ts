"use client";

import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  tableSearchAtom,
  selectedRowsAtom,
  setSelectedRowsAtom,
} from "../../atoms/activities-atoms";

export function useTableState(initialSearch?: string) {
  const [search, setSearch] = useAtom(tableSearchAtom);
  const [selectedRows] = useAtom(selectedRowsAtom);
  const setSelectedRowsAction = useSetAtom(setSelectedRowsAtom);

  // Initialize search value if provided
  useEffect(() => {
    if (initialSearch && search !== initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch, search, setSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleRowSelectionChange = (rows: string[]) => {
    setSelectedRowsAction(rows);
  };

  return {
    search,
    selectedRows,
    handleSearchChange,
    handleRowSelectionChange,
  };
}
