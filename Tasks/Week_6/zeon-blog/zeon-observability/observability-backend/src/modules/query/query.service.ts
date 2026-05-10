import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { EventEntity } from '../telemetry/entities/event.entity';
import { LogEntity } from '../telemetry/entities/log.entity';
import { MetricEntity } from '../telemetry/entities/metric.entity';
import { TraceEntity } from '../telemetry/entities/trace.entity';
import type {
  EventsQueryDto,
  LogsQueryDto,
  MetricsAggregateQueryDto,
  TracesQueryDto,
} from './dto/query.dto';

type MaybeRange = {
  from?: string;
  to?: string;
  endpoint?: string;
  method?: string;
  durationUnit?: 'all' | 'minutes' | 'hours' | 'days';
  durationValue?: number;
};

type PageQuery = MaybeRange & {
  page?: number;
  limit?: number;
  requestId?: string;
  traceId?: string;
  level?: string;
  eventType?: string;
  userId?: string;
  search?: string;
};

type BucketQuery = MaybeRange & {
  groupBy?: 'minute' | 'hour' | 'day';
  bucketStart?: string;
  bucketEnd?: string;
};

const KNOWN_BLOG_ROUTES = [
  { method: 'GET', endpoint: '/health', source: 'registry' },
  { method: 'GET', endpoint: '/diagnostics/runtime', source: 'registry' },
  { method: 'GET', endpoint: '/diagnostics/metrics', source: 'registry' },
  { method: 'POST', endpoint: '/auth/signup', source: 'registry' },
  { method: 'POST', endpoint: '/auth/login', source: 'registry' },
  { method: 'POST', endpoint: '/auth/logout', source: 'registry' },
  { method: 'GET', endpoint: '/users', source: 'registry' },
  { method: 'GET', endpoint: '/users/me', source: 'registry' },
  { method: 'GET', endpoint: '/blogs', source: 'registry' },
  { method: 'GET', endpoint: '/blogs/me', source: 'registry' },
  { method: 'GET', endpoint: '/blogs/me/:id', source: 'registry' },
  { method: 'GET', endpoint: '/blogs/:pageTitle', source: 'registry' },
  { method: 'POST', endpoint: '/blogs', source: 'registry' },
  { method: 'PATCH', endpoint: '/blogs/:id', source: 'registry' },
  { method: 'DELETE', endpoint: '/blogs/:id', source: 'registry' },
  { method: 'POST', endpoint: '/uploads', source: 'registry' },
  { method: 'GET', endpoint: '/blogs/:blogId/comments', source: 'registry' },
  { method: 'POST', endpoint: '/blogs/:blogId/comments', source: 'registry' },
  { method: 'PATCH', endpoint: '/comments/:commentId', source: 'registry' },
  { method: 'DELETE', endpoint: '/comments/:commentId', source: 'registry' },
];

const ISSUE_STATUSES = [
  'unresolved',
  'investigating',
  'resolved',
  'ignored',
  'archived',
] as const;

const METRIC_PAGE_SIZE = 10_000;

function safeDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

function percentile(values: number[], percentileValue: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)] ?? 0;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statusFamily(statusCode?: number | null): string {
  if (!statusCode) return 'unknown';
  if (statusCode < 300) return '2xx';
  if (statusCode < 400) return '3xx';
  if (statusCode < 500) return '4xx';
  return '5xx';
}

function latencyBand(latencyMs?: number | null): string {
  if (latencyMs === null || latencyMs === undefined) return 'unknown';
  if (latencyMs < 100) return '<100ms';
  if (latencyMs < 300) return '100-299ms';
  if (latencyMs < 1000) return '300-999ms';
  return '>=1000ms';
}

function getErrorCategory(record: { statusCode?: number | null; payload?: Record<string, unknown> | null }): string {
  const payloadCategory = record.payload?.errorCategory ?? record.payload?.category;
  if (typeof payloadCategory === 'string' && payloadCategory.trim()) {
    return payloadCategory.trim();
  }
  const statusCode = record.statusCode ?? 0;
  if (statusCode === 400) return 'validation';
  if (statusCode === 401) return 'auth';
  if (statusCode === 403) return 'forbidden';
  if (statusCode === 404) return 'not_found';
  if (statusCode === 409) return 'conflict';
  if (statusCode >= 500) return 'internal';
  return statusCode >= 400 ? 'error' : 'none';
}

function normalizeMessage(message?: string | null, fallback = 'request failed'): string {
  return (message || fallback)
    .toLowerCase()
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ':uuid')
    .replace(/\b\d+\b/g, ':number')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function fingerprint(parts: string[]): string {
  return Buffer.from(parts.join('|')).toString('base64url').slice(0, 48);
}

function bucketSizeMs(groupBy: 'minute' | 'hour' | 'day') {
  if (groupBy === 'minute') return 60_000;
  if (groupBy === 'day') return 86_400_000;
  return 3_600_000;
}

function bucketStart(date: Date, groupBy: 'minute' | 'hour' | 'day') {
  const d = new Date(date);
  d.setMilliseconds(0);
  d.setSeconds(0);
  if (groupBy !== 'minute') d.setMinutes(0);
  if (groupBy === 'day') d.setHours(0);
  return d;
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function distribution(map: Map<string, number>) {
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

@Injectable()
export class QueryService {
  constructor(
    @InjectRepository(MetricEntity)
    private readonly metricRepo: Repository<MetricEntity>,
    @InjectRepository(LogEntity)
    private readonly logRepo: Repository<LogEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(TraceEntity)
    private readonly traceRepo: Repository<TraceEntity>,
  ) {}

  private resolveRange(query: MaybeRange): { from?: Date; to?: Date } {
    const explicitFrom = safeDate(query.from);
    const explicitTo = safeDate(query.to);
    if (explicitFrom || explicitTo) return { from: explicitFrom, to: explicitTo };

    if (!query.durationValue || !query.durationUnit || query.durationUnit === 'all') {
      return {};
    }

    const to = new Date();
    const from = new Date(to);
    if (query.durationUnit === 'minutes') from.setMinutes(from.getMinutes() - query.durationValue);
    if (query.durationUnit === 'hours') from.setHours(from.getHours() - query.durationValue);
    if (query.durationUnit === 'days') from.setDate(from.getDate() - query.durationValue);
    return { from, to };
  }

  private applyRange<T extends object>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    query: MaybeRange,
  ) {
    const range = this.resolveRange(query);
    if (range.from) qb.andWhere(`${alias}.timestamp >= :from`, { from: range.from });
    if (range.to) qb.andWhere(`${alias}.timestamp <= :to`, { to: range.to });
  }

  private applyEndpoint<T extends object>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    query: MaybeRange,
  ) {
    if (query.endpoint) qb.andWhere(`${alias}.endpoint = :endpoint`, { endpoint: query.endpoint });
    if (query.method) qb.andWhere(`${alias}.method = :method`, { method: query.method });
  }

  private createMetricQuery(query: MaybeRange) {
    const qb = this.metricRepo.createQueryBuilder('m');
    this.applyRange(qb, 'm', query);
    this.applyEndpoint(qb, 'm', query);
    return qb.orderBy('m.timestamp', 'DESC').addOrderBy('m.id', 'DESC');
  }

  private async metricRows(query: MaybeRange, take?: number) {
    if (take !== undefined) {
      return this.createMetricQuery(query).take(take).getMany();
    }

    const rows: MetricEntity[] = [];
    let offset = 0;

    while (true) {
      const page = await this.createMetricQuery(query)
        .skip(offset)
        .take(METRIC_PAGE_SIZE)
        .getMany();

      rows.push(...page);
      if (page.length < METRIC_PAGE_SIZE) {
        break;
      }
      offset += page.length;
    }

    return rows;
  }

  async metricsAggregate(query: MetricsAggregateQueryDto) {
    const buckets = await this.requestBuckets({ ...query, groupBy: query.groupBy ?? 'hour' });
    return buckets.map((row) => ({
      bucket: row.bucket,
      bucketStart: row.bucketStart,
      bucketEnd: row.bucketEnd,
      count: row.requestCount,
      avgLatencyMs: row.avgLatencyMs,
      minLatencyMs: row.minLatencyMs,
      maxLatencyMs: row.maxLatencyMs,
      errorCount: row.errorCount,
      p95LatencyMs: row.p95LatencyMs,
      p99LatencyMs: row.p99LatencyMs,
      throughput: row.throughput,
    }));
  }

  async dashboardSummary(query: MaybeRange) {
    const rows = await this.metricRows(query);
    const latencies = rows.map((row) => row.latencyMs);
    const errorRows = rows.filter((row) => row.statusCode >= 400);
    const endpoints = new Set(rows.map((row) => row.endpoint));
    const range = this.resolveRange(query);
    const newest = rows[0]?.timestamp ?? new Date();
    const oldest = rows[rows.length - 1]?.timestamp ?? newest;
    const elapsedMs = Math.max(
      1000,
      (range.to?.getTime() ?? newest.getTime()) - (range.from?.getTime() ?? oldest.getTime()),
    );
    const latestError = errorRows[0] ?? null;

    return {
      cards: {
        totalRequests: rows.length,
        errorRate: rows.length ? errorRows.length / rows.length : 0,
        averageLatencyMs: average(latencies),
        p95LatencyMs: percentile(latencies, 95),
        p99LatencyMs: percentile(latencies, 99),
        throughput: rows.length / (elapsedMs / 1000),
        activeEndpoints: endpoints.size,
        latestError: latestError
          ? {
              timestamp: latestError.timestamp,
              endpoint: latestError.endpoint,
              method: latestError.method,
              statusCode: latestError.statusCode,
              requestId: latestError.requestId,
              errorCategory: getErrorCategory(latestError),
            }
          : null,
      },
      topEndpoints: await this.endpointMetrics(query),
      recentRequests: await this.recentRequests({ ...query, limit: 10 }),
      recentIncidents: (await this.issues({ ...query, limit: 5 })).rows,
    };
  }

  async endpointMetrics(query: MaybeRange) {
    const rows = await this.metricRows(query);
    const byEndpoint = new Map<string, MetricEntity[]>();
    for (const row of rows) {
      const key = `${row.method} ${row.endpoint}`;
      byEndpoint.set(key, [...(byEndpoint.get(key) ?? []), row]);
    }
    return [...byEndpoint.entries()]
      .map(([key, values]) => {
        const [method, ...endpointParts] = key.split(' ');
        const latencies = values.map((row) => row.latencyMs);
        const errors = values.filter((row) => row.statusCode >= 400).length;
        return {
          method,
          endpoint: endpointParts.join(' '),
          requestCount: values.length,
          errorCount: errors,
          errorRate: values.length ? errors / values.length : 0,
          avgLatencyMs: average(latencies),
          p95LatencyMs: percentile(latencies, 95),
          p99LatencyMs: percentile(latencies, 99),
        };
      })
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 25);
  }

  async requestBuckets(query: BucketQuery) {
    const groupBy = query.groupBy ?? 'hour';
    const rows = (await this.metricRows(query)).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    const size = bucketSizeMs(groupBy);
    const buckets = new Map<string, MetricEntity[]>();
    for (const row of rows) {
      const start = bucketStart(row.timestamp, groupBy);
      const key = start.toISOString();
      buckets.set(key, [...(buckets.get(key) ?? []), row]);
    }

    return [...buckets.entries()].map(([startIso, values]) => {
      const start = new Date(startIso);
      const end = new Date(start.getTime() + size);
      const latencies = values.map((row) => row.latencyMs);
      const errors = values.filter((row) => row.statusCode >= 400).length;
      return {
        bucket: startIso,
        bucketStart: startIso,
        bucketEnd: end.toISOString(),
        interval: groupBy,
        requestCount: values.length,
        errorCount: errors,
        avgLatencyMs: average(latencies),
        minLatencyMs: latencies.length ? Math.min(...latencies) : 0,
        maxLatencyMs: latencies.length ? Math.max(...latencies) : 0,
        p95LatencyMs: percentile(latencies, 95),
        p99LatencyMs: percentile(latencies, 99),
        throughput: values.length / (size / 1000),
      };
    });
  }

  async bucketRequests(query: BucketQuery) {
    const start = safeDate(query.bucketStart);
    const end = safeDate(query.bucketEnd);
    const bucketQuery = { ...query, from: start?.toISOString(), to: end?.toISOString() };
    const rows = await this.metricRows(bucketQuery, 5000);
    const requestIds = rows.map((row) => row.requestId).filter((x): x is string => Boolean(x));
    const logs = requestIds.length
      ? await this.logRepo
          .createQueryBuilder('l')
          .where('l.requestId IN (:...requestIds)', { requestIds })
          .orderBy('l.timestamp', 'DESC')
          .getMany()
      : [];
    const firstLogByRequest = new Map<string, LogEntity>();
    for (const log of logs) {
      if (log.requestId && !firstLogByRequest.has(log.requestId)) firstLogByRequest.set(log.requestId, log);
    }

    return rows.map((row) => {
      const log = row.requestId ? firstLogByRequest.get(row.requestId) : undefined;
      return {
        id: row.id,
        timestamp: row.timestamp,
        endpoint: row.endpoint,
        method: row.method,
        statusCode: row.statusCode,
        latencyMs: row.latencyMs,
        requestId: row.requestId,
        traceId: row.traceId,
        userId: row.userId,
        sourceService: row.sourceService || row.serviceName,
        message: log?.message ?? null,
        errorCategory: getErrorCategory(row),
      };
    });
  }

  async bucketInsights(query: BucketQuery) {
    const rows = await this.bucketRequests(query);
    const statusCodes = new Map<string, number>();
    const methods = new Map<string, number>();
    const errors = new Map<string, number>();
    const latencyBands = new Map<string, number>();
    for (const row of rows) {
      increment(statusCodes, String(row.statusCode));
      increment(methods, row.method);
      increment(errors, row.errorCategory);
      increment(latencyBands, latencyBand(row.latencyMs));
    }
    return {
      totalRequests: rows.length,
      statusCodeDistribution: distribution(statusCodes),
      methodDistribution: distribution(methods),
      errorCategoryDistribution: distribution(errors),
      latencyBandDistribution: distribution(latencyBands),
    };
  }

  async recentRequests(query: PageQuery) {
    const limit = query.limit || 20;
    const rows = await this.metricRows(query, limit);
    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      endpoint: row.endpoint,
      method: row.method,
      statusCode: row.statusCode,
      latencyMs: row.latencyMs,
      requestId: row.requestId,
      traceId: row.traceId,
      userId: row.userId,
      sourceService: row.sourceService || row.serviceName,
      errorCategory: getErrorCategory(row),
    }));
  }

  async errorDistribution(query: MaybeRange) {
    const rows = (await this.metricRows(query)).filter((row) => row.statusCode >= 400);
    const categories = new Map<string, number>();
    const statuses = new Map<string, number>();
    for (const row of rows) {
      increment(categories, getErrorCategory(row));
      increment(statuses, String(row.statusCode));
    }
    return { categories: distribution(categories), statusCodes: distribution(statuses) };
  }

  async latencyDistribution(query: MaybeRange) {
    const rows = await this.metricRows(query);
    const bands = new Map<string, number>();
    for (const row of rows) increment(bands, latencyBand(row.latencyMs));
    return distribution(bands);
  }

  async knownRoutes(query: MaybeRange) {
    const observed = await this.metricRepo
      .createQueryBuilder('m')
      .select('m.method', 'method')
      .addSelect('m.endpoint', 'endpoint')
      .addSelect('COUNT(*)', 'seenCount')
      .groupBy('m.method')
      .addGroupBy('m.endpoint')
      .orderBy('m.endpoint', 'ASC')
      .getRawMany<{ method: string; endpoint: string; seenCount: string }>();

    const map = new Map<string, { method: string; endpoint: string; source: string; seenCount: number }>();
    for (const route of KNOWN_BLOG_ROUTES) {
      if (!query.endpoint || route.endpoint === query.endpoint) {
        map.set(`${route.method} ${route.endpoint}`, { ...route, seenCount: 0 });
      }
    }
    for (const row of observed) {
      if (query.endpoint && row.endpoint !== query.endpoint) continue;
      const key = `${row.method} ${row.endpoint}`;
      const existing = map.get(key);
      map.set(key, {
        method: row.method,
        endpoint: row.endpoint,
        source: existing ? 'registry+observed' : 'observed',
        seenCount: Number(row.seenCount),
      });
    }
    return [...map.values()].sort((a, b) => `${a.endpoint} ${a.method}`.localeCompare(`${b.endpoint} ${b.method}`));
  }

  async serviceMap() {
    return {
      nodes: [
        { id: 'blogs-frontend', label: 'Blogs Frontend', type: 'frontend' },
        { id: 'blogs-backend', label: 'Blogs Backend', type: 'backend' },
        { id: 'zeon-observability-ingest', label: 'Telemetry Ingestion', type: 'ingestion' },
        { id: 'zeon-observability-dashboard', label: 'Observability Dashboard', type: 'dashboard' },
      ],
      edges: [
        { from: 'blogs-frontend', to: 'blogs-backend', label: 'HTTP requests' },
        { from: 'blogs-backend', to: 'zeon-observability-ingest', label: 'MELT batches' },
        { from: 'zeon-observability-ingest', to: 'zeon-observability-dashboard', label: 'query APIs' },
      ],
    };
  }

  async retention() {
    const rawDays = Number(process.env.OBS_RAW_RETENTION_DAYS || 14);
    const aggregateDays = Number(process.env.OBS_AGGREGATE_RETENTION_DAYS || 90);
    const rawCutoff = new Date();
    rawCutoff.setDate(rawCutoff.getDate() - rawDays);
    const aggregateCutoff = new Date();
    aggregateCutoff.setDate(aggregateCutoff.getDate() - aggregateDays);

    const [metrics, logs, events, traces] = await Promise.all([
      this.metricRepo.createQueryBuilder('m').where('m.timestamp < :cutoff', { cutoff: rawCutoff }).getCount(),
      this.logRepo.createQueryBuilder('l').where('l.timestamp < :cutoff', { cutoff: rawCutoff }).getCount(),
      this.eventRepo.createQueryBuilder('e').where('e.timestamp < :cutoff', { cutoff: rawCutoff }).getCount(),
      this.traceRepo.createQueryBuilder('t').where('t.timestamp < :cutoff', { cutoff: rawCutoff }).getCount(),
    ]);

    return {
      mode: 'dry-run',
      rawRetentionDays: rawDays,
      aggregateRetentionDays: aggregateDays,
      rawCutoff: rawCutoff.toISOString(),
      aggregateCutoff: aggregateCutoff.toISOString(),
      deletionCandidates: { metrics, logs, events, traces },
    };
  }

  async issues(query: PageQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [logs, metrics] = await Promise.all([
      this.logs({ ...query, limit: 5000, page: 1 }),
      this.metricRows(query, 5000),
    ]);
    const groups = new Map<string, any>();

    for (const log of logs.rows.filter((row) => (row.statusCode ?? 0) >= 400 || row.logLevel === 'error')) {
      const category = getErrorCategory(log);
      const normalized = normalizeMessage(log.message, category);
      const id = fingerprint([log.endpoint, String(log.statusCode ?? 'unknown'), category, normalized]);
      const current = groups.get(id) ?? {
        id,
        fingerprint: id,
        title: log.message || `${category} on ${log.endpoint}`,
        normalizedMessage: normalized,
        status: 'unresolved',
        issueStatuses: ISSUE_STATUSES,
        endpoint: log.endpoint,
        statusCode: log.statusCode,
        errorCategory: category,
        occurrenceCount: 0,
        affectedEndpoints: new Set<string>(),
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
        latestRequestId: log.requestId,
        latestTraceId: log.traceId,
      };
      current.occurrenceCount += 1;
      current.affectedEndpoints.add(log.endpoint);
      if (log.timestamp < current.firstSeen) current.firstSeen = log.timestamp;
      if (log.timestamp > current.lastSeen) {
        current.lastSeen = log.timestamp;
        current.latestRequestId = log.requestId;
        current.latestTraceId = log.traceId;
      }
      groups.set(id, current);
    }

    for (const metric of metrics.filter((row) => row.statusCode >= 400)) {
      const category = getErrorCategory(metric);
      const normalized = normalizeMessage(null, category);
      const id = fingerprint([metric.endpoint, String(metric.statusCode), category, normalized]);
      const current = groups.get(id) ?? {
        id,
        fingerprint: id,
        title: `${category} ${metric.statusCode} on ${metric.endpoint}`,
        normalizedMessage: normalized,
        status: 'unresolved',
        issueStatuses: ISSUE_STATUSES,
        endpoint: metric.endpoint,
        statusCode: metric.statusCode,
        errorCategory: category,
        occurrenceCount: 0,
        affectedEndpoints: new Set<string>(),
        firstSeen: metric.timestamp,
        lastSeen: metric.timestamp,
        latestRequestId: metric.requestId,
        latestTraceId: metric.traceId,
      };
      current.occurrenceCount += 1;
      current.affectedEndpoints.add(metric.endpoint);
      if (metric.timestamp < current.firstSeen) current.firstSeen = metric.timestamp;
      if (metric.timestamp > current.lastSeen) {
        current.lastSeen = metric.timestamp;
        current.latestRequestId = metric.requestId;
        current.latestTraceId = metric.traceId;
      }
      groups.set(id, current);
    }

    const rows = [...groups.values()]
      .map((issue) => ({ ...issue, affectedEndpoints: [...issue.affectedEndpoints] }))
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
    return { rows: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit };
  }

  async issueDetail(fingerprintId: string, query: PageQuery) {
    const all = await this.issues({ ...query, limit: 10_000 });
    const issue = all.rows.find((row) => row.fingerprint === fingerprintId);
    if (!issue) return null;
    const requestId = issue.latestRequestId;
    const traceId = issue.latestTraceId;
    const relatedLogs = requestId
      ? (await this.logs({ requestId, limit: 50, page: 1 })).rows
      : [];
    const relatedTraces = traceId
      ? (await this.traces({ traceId, limit: 50, page: 1 })).rows
      : [];
    const relatedEvents = requestId
      ? (await this.events({ requestId, limit: 50, page: 1 } as EventsQueryDto & { requestId: string })).rows
      : [];
    const samples = await this.recentRequests({ ...query, endpoint: issue.endpoint, limit: 25 });
    return {
      ...issue,
      totalOccurrences: issue.occurrenceCount,
      latestRequest: samples.find((row) => row.requestId === requestId) ?? samples[0] ?? null,
      requestSamples: samples,
      relatedLogs,
      relatedTraces,
      relatedEvents,
      errorContext: {
        normalizedMessage: issue.normalizedMessage,
        errorCategory: issue.errorCategory,
        statusCode: issue.statusCode,
      },
    };
  }

  async logs(query: LogsQueryDto & PageQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.logRepo.createQueryBuilder('l');

    this.applyRange(qb, 'l', query);
    this.applyEndpoint(qb, 'l', query);
    if (query.level) qb.andWhere('l.logLevel = :level', { level: query.level });
    if (query.requestId) qb.andWhere('l.requestId = :requestId', { requestId: query.requestId });
    if (query.traceId) qb.andWhere('l.traceId = :traceId', { traceId: query.traceId });
    if (query.search) qb.andWhere('l.message LIKE :search', { search: `%${query.search}%` });

    qb.orderBy('l.timestamp', 'DESC').skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return { rows, total, page, limit };
  }

  async events(query: EventsQueryDto & PageQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.eventRepo.createQueryBuilder('e');

    this.applyRange(qb, 'e', query);
    this.applyEndpoint(qb, 'e', query);
    if (query.eventType) qb.andWhere('e.eventType = :eventType', { eventType: query.eventType });
    if (query.userId) qb.andWhere('e.userId = :userId', { userId: query.userId });
    if (query.requestId) qb.andWhere('e.requestId = :requestId', { requestId: query.requestId });
    if (query.traceId) qb.andWhere('e.traceId = :traceId', { traceId: query.traceId });

    qb.orderBy('e.timestamp', 'DESC').skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return { rows, total, page, limit };
  }

  async traces(query: TracesQueryDto & PageQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.traceRepo.createQueryBuilder('t');

    this.applyRange(qb, 't', query);
    this.applyEndpoint(qb, 't', query);
    if (query.requestId) qb.andWhere('t.requestId = :requestId', { requestId: query.requestId });
    if (query.traceId) qb.andWhere('t.traceId = :traceId', { traceId: query.traceId });

    qb.orderBy('t.timestamp', 'DESC').skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return { rows, total, page, limit };
  }
}
