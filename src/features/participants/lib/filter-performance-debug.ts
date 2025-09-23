// Debug utilities for filter performance monitoring
export function logFilterPerformance(
  action: string,
  startTime: number,
  additionalData?: Record<string, unknown>
) {
  const duration = Date.now() - startTime;
  console.log(`🔧 Filter Performance [${action}]:`, {
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}

export function createPerformanceTimer(action: string) {
  const startTime = Date.now();
  console.log(`⏱️ Starting: ${action}`);

  return {
    end: (additionalData?: Record<string, unknown>) =>
      logFilterPerformance(action, startTime, additionalData),
    startTime,
  };
}

export function debugFilterState(
  filters: Record<string, unknown>,
  source: string
) {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => key !== "search" && value !== "" && value !== "all"
  );

  console.log(`🔍 Filter State [${source}]:`, {
    totalFilters: Object.keys(filters).length,
    activeFilters: activeFilters.length,
    activeFilterKeys: activeFilters.map(([key]) => key),
    timestamp: new Date().toISOString(),
  });
}
