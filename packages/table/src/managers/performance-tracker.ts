/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  totalMeasurements: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastDuration: number;
  p95Duration: number;
  p99Duration: number;
}

/**
 * Performance tracker configuration
 */
export interface PerformanceTrackerConfig {
  /** Enable performance tracking */
  enabled?: boolean;
  /** Maximum number of metrics to keep in memory */
  maxMetrics?: number;
  /** Enable console logging */
  enableLogging?: boolean;
  /** Minimum duration to log (ms) */
  logThreshold?: number;
}

/**
 * Manager for tracking and analyzing performance metrics
 */
export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private config: Required<PerformanceTrackerConfig>;

  constructor(config: PerformanceTrackerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxMetrics: config.maxMetrics ?? 1000,
      enableLogging: config.enableLogging ?? false,
      logThreshold: config.logThreshold ?? 10,
    };
  }

  /**
   * Start measuring a performance metric
   */
  start(name: string, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.activeMetrics.set(name, metric);
  }

  /**
   * End measuring a performance metric
   */
  end(name: string): number | null {
    if (!this.config.enabled) return null;

    const activeMetric = this.activeMetrics.get(name);
    if (!activeMetric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - activeMetric.startTime;

    const completedMetric: PerformanceMetric = {
      ...activeMetric,
      endTime,
      duration,
    };

    // Store completed metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricsList = this.metrics.get(name)!;
    metricsList.push(completedMetric);

    // Limit memory usage
    if (metricsList.length > this.config.maxMetrics) {
      metricsList.shift();
    }

    // Remove from active metrics
    this.activeMetrics.delete(name);

    // Log if enabled and above threshold
    if (this.config.enableLogging && duration >= this.config.logThreshold) {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`, completedMetric.metadata);
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    this.start(name, metadata);
    try {
      const result = fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * Get statistics for a specific metric
   */
  getStats(name: string): PerformanceStats | null {
    const metricsList = this.metrics.get(name);
    if (!metricsList || metricsList.length === 0) {
      return null;
    }

    const durations = metricsList
      .map(m => m.duration!)
      .filter(d => d !== undefined)
      .sort((a, b) => a - b);

    if (durations.length === 0) return null;

    const sum = durations.reduce((acc, d) => acc + d, 0);
    const average = sum / durations.length;
    const min = durations[0] || 0;
    const max = durations[durations.length - 1] || 0;
    const lastMetric = metricsList[metricsList.length - 1];
    const last = lastMetric?.duration || 0;

    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const p95 = durations[p95Index] || max;
    const p99 = durations[p99Index] || max;

    return {
      totalMeasurements: durations.length,
      averageDuration: average,
      minDuration: min,
      maxDuration: max,
      lastDuration: last,
      p95Duration: p95,
      p99Duration: p99,
    };
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get raw metrics for a specific name
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeMetrics.clear();
  }

  /**
   * Clear metrics for a specific name
   */
  clearMetric(name: string): void {
    this.metrics.delete(name);
    this.activeMetrics.delete(name);
  }

  /**
   * Get performance summary for all metrics
   */
  getSummary(): Record<string, PerformanceStats> {
    const summary: Record<string, PerformanceStats> = {};
    
    for (const name of this.getMetricNames()) {
      const stats = this.getStats(name);
      if (stats) {
        summary[name] = stats;
      }
    }

    return summary;
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    const data = {
      config: this.config,
      metrics: Object.fromEntries(this.metrics),
      summary: this.getSummary(),
      timestamp: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Enable or disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.activeMetrics.clear();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PerformanceTrackerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PerformanceTrackerConfig {
    return { ...this.config };
  }
}

/**
 * Global performance tracker instance
 */
export const globalPerformanceTracker = new PerformanceTracker({
  enabled: process.env.NODE_ENV === 'development',
  enableLogging: process.env.NODE_ENV === 'development',
  logThreshold: 5,
});

/**
 * Performance measurement decorator
 */
export function measurePerformance(name?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (this: any, ...args: any[]) {
      return globalPerformanceTracker.measure(metricName, () => {
        return originalMethod.apply(this, args);
      });
    } as T;

    return descriptor;
  };
}

/**
 * Async performance measurement decorator
 */
export function measureAsyncPerformance(name?: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (this: any, ...args: any[]) {
      return globalPerformanceTracker.measureAsync(metricName, () => {
        return originalMethod.apply(this, args);
      });
    } as T;

    return descriptor;
  };
}
