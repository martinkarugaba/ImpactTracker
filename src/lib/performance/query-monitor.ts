/**
 * Query Performance Monitoring Utilities
 *
 * Provides comprehensive query performance tracking, logging, and analysis
 * to identify slow queries and monitor optimization effectiveness.
 */

export interface QueryPerformanceMetrics {
  query: string;
  executionTime: number;
  timestamp: Date;
  params?: Record<string, unknown>;
  resultCount?: number;
  source: string;
}

export interface QueryStats {
  totalQueries: number;
  averageTime: number;
  slowestQuery: number;
  fastestQuery: number;
  queriesOverThreshold: number;
  threshold: number;
}

class QueryPerformanceMonitor {
  private metrics: QueryPerformanceMetrics[] = [];
  private slowQueryThreshold: number = 1000; // 1 second
  private maxMetricsHistory: number = 1000;
  private isEnabled: boolean =
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_QUERY_MONITORING === "true";

  /**
   * Track a query's performance
   */
  trackQuery<T>(
    source: string,
    queryDescription: string,
    queryFn: () => Promise<T>,
    params?: Record<string, unknown>
  ): Promise<T> {
    if (!this.isEnabled) {
      return queryFn();
    }

    const startTime = performance.now();
    const timestamp = new Date();

    return queryFn()
      .then(result => {
        const executionTime = performance.now() - startTime;

        // Determine result count if possible
        let resultCount: number | undefined;
        if (Array.isArray(result)) {
          resultCount = result.length;
        } else if (result && typeof result === "object" && "data" in result) {
          const data = (result as Record<string, unknown>).data;
          if (Array.isArray(data)) {
            resultCount = data.length;
          } else if (data && typeof data === "object" && "data" in data) {
            const nestedData = data.data;
            if (Array.isArray(nestedData)) {
              resultCount = nestedData.length;
            }
          }
        }

        // Record metrics
        this.recordMetric({
          query: queryDescription,
          executionTime,
          timestamp,
          params,
          resultCount,
          source,
        });

        // Log slow queries
        if (executionTime > this.slowQueryThreshold) {
          this.logSlowQuery({
            query: queryDescription,
            executionTime,
            timestamp,
            params,
            resultCount,
            source,
          });
        }

        return result;
      })
      .catch(error => {
        const executionTime = performance.now() - startTime;

        // Record failed query
        this.recordMetric({
          query: `${queryDescription} (FAILED)`,
          executionTime,
          timestamp,
          params,
          source,
        });

        console.error(`Query failed after ${executionTime.toFixed(2)}ms:`, {
          query: queryDescription,
          source,
          params,
          error: error.message,
        });

        throw error;
      });
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: QueryPerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics to prevent memory bloat
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Log slow queries with detailed information
   */
  private logSlowQuery(metric: QueryPerformanceMetrics): void {
    console.warn(
      `🐌 SLOW QUERY DETECTED (${metric.executionTime.toFixed(2)}ms):`,
      {
        query: metric.query,
        source: metric.source,
        executionTime: `${metric.executionTime.toFixed(2)}ms`,
        resultCount: metric.resultCount,
        params: metric.params,
        timestamp: metric.timestamp.toISOString(),
        threshold: `${this.slowQueryThreshold}ms`,
      }
    );
  }

  /**
   * Get performance statistics
   */
  getStats(source?: string): QueryStats {
    const relevantMetrics = source
      ? this.metrics.filter(m => m.source === source)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageTime: 0,
        slowestQuery: 0,
        fastestQuery: 0,
        queriesOverThreshold: 0,
        threshold: this.slowQueryThreshold,
      };
    }

    const executionTimes = relevantMetrics.map(m => m.executionTime);
    const totalTime = executionTimes.reduce((sum, time) => sum + time, 0);

    return {
      totalQueries: relevantMetrics.length,
      averageTime: Math.round((totalTime / relevantMetrics.length) * 100) / 100,
      slowestQuery: Math.max(...executionTimes),
      fastestQuery: Math.min(...executionTimes),
      queriesOverThreshold: relevantMetrics.filter(
        m => m.executionTime > this.slowQueryThreshold
      ).length,
      threshold: this.slowQueryThreshold,
    };
  }

  /**
   * Get recent slow queries
   */
  getSlowQueries(limit: number = 10): QueryPerformanceMetrics[] {
    return this.metrics
      .filter(m => m.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Get queries by source (e.g., "participants", "activities")
   */
  getQueriesBySource(): Record<string, QueryStats> {
    const sources = [...new Set(this.metrics.map(m => m.source))];
    const stats: Record<string, QueryStats> = {};

    sources.forEach(source => {
      stats[source] = this.getStats(source);
    });

    return stats;
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(milliseconds: number): void {
    this.slowQueryThreshold = milliseconds;
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const overallStats = this.getStats();
    const sourceStats = this.getQueriesBySource();
    const slowQueries = this.getSlowQueries(5);

    let report = `
📊 QUERY PERFORMANCE REPORT
Generated: ${new Date().toISOString()}
Threshold: ${this.slowQueryThreshold}ms

🔍 OVERALL STATISTICS:
- Total Queries: ${overallStats.totalQueries}
- Average Time: ${overallStats.averageTime}ms
- Slowest Query: ${overallStats.slowestQuery}ms
- Fastest Query: ${overallStats.fastestQuery}ms
- Slow Queries: ${overallStats.queriesOverThreshold}/${overallStats.totalQueries} (${((overallStats.queriesOverThreshold / overallStats.totalQueries) * 100).toFixed(1)}%)

📈 BY SOURCE:`;

    Object.entries(sourceStats).forEach(([source, stats]) => {
      report += `\n- ${source}: ${stats.totalQueries} queries, avg ${stats.averageTime}ms, ${stats.queriesOverThreshold} slow`;
    });

    if (slowQueries.length > 0) {
      report += `\n\n🐌 SLOWEST QUERIES:`;
      slowQueries.forEach((query, index) => {
        report += `\n${index + 1}. ${query.query} (${query.source}): ${query.executionTime.toFixed(2)}ms`;
      });
    }

    report += `\n\n💡 RECOMMENDATIONS:`;
    if (overallStats.queriesOverThreshold > 0) {
      report += `\n- ${overallStats.queriesOverThreshold} slow queries detected - consider adding indexes`;
    }
    if (overallStats.averageTime > 500) {
      report += `\n- Average query time is ${overallStats.averageTime}ms - investigate common bottlenecks`;
    }
    if (overallStats.slowestQuery > 5000) {
      report += `\n- Slowest query is ${overallStats.slowestQuery}ms - urgent optimization needed`;
    }

    return report;
  }
}

// Global instance
export const queryMonitor = new QueryPerformanceMonitor();

/**
 * Decorator function for easy query tracking
 */
export function trackQueryPerformance(
  source: string,
  queryDescription?: string
) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: unknown,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const description = queryDescription || `${source}.${propertyName}`;
      return queryMonitor.trackQuery(
        source,
        description,
        () => method.apply(this, args),
        { args }
      );
    } as T;

    return descriptor;
  };
}

/**
 * Simple function wrapper for tracking query performance
 */
export async function withQueryTracking<T>(
  source: string,
  queryDescription: string,
  queryFn: () => Promise<T>,
  params?: Record<string, unknown>
): Promise<T> {
  return queryMonitor.trackQuery(source, queryDescription, queryFn, params);
}

/**
 * Database timing utility for raw SQL queries
 */
export async function timeQuery<T>(
  query: string,
  queryFn: () => Promise<T>,
  source: string = "database"
): Promise<T> {
  return queryMonitor.trackQuery(source, query, queryFn);
}

/**
 * React Hook for accessing performance stats in development
 */
export function useQueryPerformanceStats() {
  const getStats = () => queryMonitor.getStats();
  const getSlowQueries = () => queryMonitor.getSlowQueries();
  const getReport = () => queryMonitor.generateReport();
  const clearMetrics = () => queryMonitor.clearMetrics();

  return {
    getStats,
    getSlowQueries,
    getReport,
    clearMetrics,
  };
}

// Development helper - log periodic performance reports
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  setInterval(() => {
    const stats = queryMonitor.getStats();
    if (stats.totalQueries > 0) {
      console.log("📊 Query Performance Summary:", {
        totalQueries: stats.totalQueries,
        averageTime: `${stats.averageTime}ms`,
        slowQueries: stats.queriesOverThreshold,
      });
    }
  }, 30000); // Every 30 seconds
}

export default queryMonitor;
