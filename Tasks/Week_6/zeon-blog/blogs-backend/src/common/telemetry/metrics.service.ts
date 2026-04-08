import { Injectable } from '@nestjs/common';

export type RequestMetric = {
  ts: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  requestId?: string;
  errorCategory?: string;
};

type AggregateKey = string; // `${method} ${route}`

type Aggregate = {
  count: number;
  errorCount: number;
  slowCount: number;
  categoryCounts: Record<string, number>;
  minMs: number;
  maxMs: number;
  sumMs: number;
};

@Injectable()
export class MetricsService {
  private readonly slowThresholdMs = Number(process.env.SLOW_THRESHOLD_MS) || 750;
  private readonly recentLimit = Number(process.env.METRICS_RECENT_LIMIT) || 500;

  private recent: RequestMetric[] = [];
  private aggregates = new Map<AggregateKey, Aggregate>();

  recordRequest(metric: RequestMetric) {
    this.recent.push(metric);
    if (this.recent.length > this.recentLimit) {
      this.recent = this.recent.slice(this.recent.length - this.recentLimit);
    }

    const key = `${metric.method} ${metric.route}`;
    const existing = this.aggregates.get(key);
    const isError = metric.statusCode >= 400;
    const isSlow = metric.durationMs >= this.slowThresholdMs;
    const category = metric.errorCategory || 'none';

    if (!existing) {
      this.aggregates.set(key, {
        count: 1,
        errorCount: isError ? 1 : 0,
        slowCount: isSlow ? 1 : 0,
        categoryCounts: isError ? { [category]: 1 } : {},
        minMs: metric.durationMs,
        maxMs: metric.durationMs,
        sumMs: metric.durationMs,
      });
      return;
    }

    existing.count += 1;
    existing.sumMs += metric.durationMs;
    existing.minMs = Math.min(existing.minMs, metric.durationMs);
    existing.maxMs = Math.max(existing.maxMs, metric.durationMs);
    if (isError) existing.errorCount += 1;
    if (isSlow) existing.slowCount += 1;
    if (isError) {
      existing.categoryCounts[category] = (existing.categoryCounts[category] || 0) + 1;
    }
  }

  snapshot() {
    const aggregates: Record<string, any> = {};
    for (const [key, value] of this.aggregates.entries()) {
      aggregates[key] = {
        count: value.count,
        errorCount: value.errorCount,
        slowCount: value.slowCount,
        categoryCounts: value.categoryCounts,
        minMs: value.minMs,
        maxMs: value.maxMs,
        avgMs: value.count ? value.sumMs / value.count : 0,
      };
    }

    return {
      ts: new Date().toISOString(),
      slowThresholdMs: this.slowThresholdMs,
      recent: this.recent,
      aggregates,
    };
  }
}
