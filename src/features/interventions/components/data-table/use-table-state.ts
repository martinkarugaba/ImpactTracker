import { useState } from "react";

export function useTableState(initialSearch = "") {
  const [search, setSearch] = useState(initialSearch);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return { search, handleSearchChange };
}
