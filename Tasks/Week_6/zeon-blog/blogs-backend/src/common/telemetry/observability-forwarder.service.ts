import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { MeltRecord, MeltRecordType } from './melt.types';

@Injectable()
export class ObservabilityForwarderService implements OnModuleDestroy {
  private readonly enabled =
    process.env.OBS_FORWARD_ENABLED === '1' && Boolean(process.env.OBS_BASE_URL);
  private readonly obsBaseUrl = (process.env.OBS_BASE_URL || '').replace(
    /\/$/,
    '',
  );
  private readonly jwtSecret =
    process.env.OBS_INGEST_JWT_SECRET || process.env.OBS_JWT_SECRET || '';
  private readonly issuer = process.env.OBS_INGEST_JWT_ISSUER || 'blogs-backend';
  private readonly audience =
    process.env.OBS_INGEST_JWT_AUDIENCE || 'zeon-observability';

  private readonly batchSize = Number(process.env.OBS_BATCH_SIZE || 100);
  private readonly flushMs = Number(process.env.OBS_FLUSH_MS || 1000);
  private readonly maxQueue = Number(process.env.OBS_QUEUE_MAX || 5000);

  private readonly queue: Record<MeltRecordType, MeltRecord[]> = {
    metrics: [],
    logs: [],
    events: [],
    traces: [],
  };

  private flushing = false;
  private readonly flushTimer: ReturnType<typeof setInterval>;

  private accepted = 0;
  private dropped = 0;
  private flushed = 0;
  private failed = 0;

  constructor(private readonly jwtService: JwtService) {
    this.flushTimer = setInterval(() => {
      void this.flushAll();
    }, this.flushMs);
    this.flushTimer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.flushTimer);
  }

  getStats() {
    const queueDepth =
      this.queue.metrics.length +
      this.queue.logs.length +
      this.queue.events.length +
      this.queue.traces.length;

    return {
      enabled: this.enabled,
      queueDepth,
      accepted: this.accepted,
      dropped: this.dropped,
      flushed: this.flushed,
      failed: this.failed,
    };
  }

  emit(type: MeltRecordType, record: MeltRecord) {
    if (!this.enabled) return;
    if (this.currentDepth() >= this.maxQueue) {
      this.dropped += 1;
      return;
    }

    this.queue[type].push({
      ...record,
      serviceName: record.serviceName || 'blogs-backend',
      schemaVersion: record.schemaVersion || '1.0',
      endpoint: record.endpoint || '__unknown_endpoint__',
      method: record.method || 'GET',
      timestamp: record.timestamp || new Date().toISOString(),
    });
    this.accepted += 1;
  }

  private currentDepth() {
    return (
      this.queue.metrics.length +
      this.queue.logs.length +
      this.queue.events.length +
      this.queue.traces.length
    );
  }

  private buildToken() {
    if (!this.jwtSecret) return null;
    return this.jwtService.sign(
      {
        sub: 'blogs-backend',
        role: 'service',
      },
      {
        secret: this.jwtSecret,
        issuer: this.issuer,
        audience: this.audience,
        expiresIn: '60s',
      },
    );
  }

  private peekBatch(type: MeltRecordType) {
    return this.queue[type].slice(0, this.batchSize);
  }

  private dropBatch(type: MeltRecordType, count: number) {
    if (count <= 0) return;
    this.queue[type].splice(0, count);
  }

  private async flushType(type: MeltRecordType) {
    const items = this.peekBatch(type);
    if (!items.length) return;

    const token = this.buildToken();
    if (!token) {
      this.failed += items.length;
      return;
    }

    try {
      const response = await fetch(`${this.obsBaseUrl}/ingest/${type}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) {
        this.failed += items.length;
        return;
      }
      this.dropBatch(type, items.length);
      this.flushed += items.length;
    } catch {
      this.failed += items.length;
    }
  }

  private async flushAll() {
    if (this.flushing || !this.enabled) return;
    this.flushing = true;
    try {
      await this.flushType('metrics');
      await this.flushType('logs');
      await this.flushType('events');
      await this.flushType('traces');
    } finally {
      this.flushing = false;
    }
  }
}
