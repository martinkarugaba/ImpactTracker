import { useCallback, useState } from "react";

export interface InterventionFiltersState {
  search?: string;
  skillCategory?: string;
  source?: string;
}

export function useFilterState(initial?: InterventionFiltersState) {
  const [filters, setFilters] = useState<InterventionFiltersState>(
    initial ?? {}
  );

  const setFilter = useCallback(
    (key: keyof InterventionFiltersState, value: string | undefined) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters({}), []);

  return { filters, setFilter, clearFilters };
}
