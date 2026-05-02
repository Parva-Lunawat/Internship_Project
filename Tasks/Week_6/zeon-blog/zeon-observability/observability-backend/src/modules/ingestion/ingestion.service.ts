import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  EventIngestDto,
  LogIngestDto,
  MetricIngestDto,
  TraceIngestDto,
} from '../telemetry/dto/shared.dto';
import { EventEntity } from '../telemetry/entities/event.entity';
import { LogEntity } from '../telemetry/entities/log.entity';
import { MetricEntity } from '../telemetry/entities/metric.entity';
import { TraceEntity } from '../telemetry/entities/trace.entity';

type QueueItem =
  | { type: 'metrics'; item: MetricIngestDto }
  | { type: 'logs'; item: LogIngestDto }
  | { type: 'events'; item: EventIngestDto }
  | { type: 'traces'; item: TraceIngestDto };

@Injectable()
export class IngestionService implements OnModuleInit, OnModuleDestroy {
  private readonly queue: QueueItem[] = [];
  private readonly maxQueue = Number(process.env.OBS_QUEUE_MAX || 5000);
  private readonly flushIntervalMs = Number(process.env.OBS_FLUSH_MS || 1000);
  private readonly flushBatchSize = Number(process.env.OBS_BATCH_SIZE || 200);

  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  private accepted = 0;
  private rejected = 0;
  private persisted = 0;
  private failed = 0;
  private flushCount = 0;
  private totalPersistMs = 0;

  constructor(
    @InjectRepository(MetricEntity)
    private readonly metricsRepo: Repository<MetricEntity>,
    @InjectRepository(LogEntity)
    private readonly logsRepo: Repository<LogEntity>,
    @InjectRepository(EventEntity)
    private readonly eventsRepo: Repository<EventEntity>,
    @InjectRepository(TraceEntity)
    private readonly tracesRepo: Repository<TraceEntity>,
  ) {}

  onModuleInit() {
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.flushIntervalMs);
    this.flushTimer.unref();
  }

  onModuleDestroy() {
    if (this.flushTimer) clearInterval(this.flushTimer);
  }

  getStats() {
    return {
      queueDepth: this.queue.length,
      accepted: this.accepted,
      rejected: this.rejected,
      persisted: this.persisted,
      failed: this.failed,
      flushCount: this.flushCount,
      avgPersistMs:
        this.flushCount > 0 ? this.totalPersistMs / this.flushCount : 0,
    };
  }

  enqueueMetrics(items: MetricIngestDto[]) {
    return this.enqueue('metrics', items);
  }

  enqueueLogs(items: LogIngestDto[]) {
    return this.enqueue('logs', items);
  }

  enqueueEvents(items: EventIngestDto[]) {
    return this.enqueue('events', items);
  }

  enqueueTraces(items: TraceIngestDto[]) {
    return this.enqueue('traces', items);
  }

  private enqueue<T extends QueueItem['type']>(
    type: T,
    items: Extract<QueueItem, { type: T }>['item'][],
  ) {
    let accepted = 0;
    let rejected = 0;
    for (const item of items) {
      if (this.queue.length >= this.maxQueue) {
        rejected += 1;
        continue;
      }
      this.queue.push({ type, item } as QueueItem);
      accepted += 1;
    }
    this.accepted += accepted;
    this.rejected += rejected;
    return { accepted, rejected, queueDepth: this.queue.length };
  }

  private toDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? new Date() : date;
  }

  private async flush() {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;

    const started = performance.now();
    const chunk = this.queue.splice(0, this.flushBatchSize);
    const metrics: MetricEntity[] = [];
    const logs: LogEntity[] = [];
    const events: EventEntity[] = [];
    const traces: TraceEntity[] = [];

    for (const entry of chunk) {
      if (entry.type === 'metrics') {
        metrics.push({
          ...entry.item,
          requestId: entry.item.requestId ?? null,
          traceId: entry.item.traceId ?? null,
          userId: entry.item.userId ?? null,
          payload: entry.item.payload ?? null,
          timestamp: this.toDate(entry.item.timestamp),
        } as MetricEntity);
      } else if (entry.type === 'logs') {
        logs.push({
          ...entry.item,
          requestId: entry.item.requestId ?? null,
          traceId: entry.item.traceId ?? null,
          userId: entry.item.userId ?? null,
          payload: entry.item.payload ?? null,
          message: entry.item.message ?? null,
          statusCode: entry.item.statusCode ?? null,
          latencyMs: entry.item.latencyMs ?? null,
          timestamp: this.toDate(entry.item.timestamp),
        } as LogEntity);
      } else if (entry.type === 'events') {
        events.push({
          ...entry.item,
          requestId: entry.item.requestId ?? null,
          traceId: entry.item.traceId ?? null,
          userId: entry.item.userId ?? null,
          payload: entry.item.payload ?? null,
          statusCode: entry.item.statusCode ?? null,
          latencyMs: entry.item.latencyMs ?? null,
          timestamp: this.toDate(entry.item.timestamp),
        } as EventEntity);
      } else if (entry.type === 'traces') {
        traces.push({
          ...entry.item,
          requestId: entry.item.requestId ?? null,
          userId: entry.item.userId ?? null,
          payload: entry.item.payload ?? null,
          statusCode: entry.item.statusCode ?? null,
          latencyMs: entry.item.latencyMs ?? null,
          timestamp: this.toDate(entry.item.timestamp),
        } as TraceEntity);
      }
    }

    try {
      await Promise.all([
        metrics.length ? this.metricsRepo.insert(metrics) : Promise.resolve(),
        logs.length ? this.logsRepo.insert(logs) : Promise.resolve(),
        events.length ? this.eventsRepo.insert(events) : Promise.resolve(),
        traces.length ? this.tracesRepo.insert(traces) : Promise.resolve(),
      ]);
      this.persisted += chunk.length;
    } catch {
      this.failed += chunk.length;
    } finally {
      this.flushCount += 1;
      this.totalPersistMs += performance.now() - started;
      this.flushing = false;
    }
  }
}
