import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventEntity } from '../telemetry/entities/event.entity';
import { LogEntity } from '../telemetry/entities/log.entity';
import { MetricEntity } from '../telemetry/entities/metric.entity';
import { TraceEntity } from '../telemetry/entities/trace.entity';

@Injectable()
export class CorrelationService {
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

  async byRequestId(requestId: string) {
    const [metrics, logs, events, traces] = await Promise.all([
      this.metricRepo.find({
        where: { requestId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
      this.logRepo.find({
        where: { requestId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
      this.eventRepo.find({
        where: { requestId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
      this.traceRepo.find({
        where: { requestId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
    ]);

    return {
      summary: {
        requestId,
        metrics: metrics.length,
        logs: logs.length,
        events: events.length,
        traces: traces.length,
      },
      metrics,
      logs,
      events,
      traces,
    };
  }

  async byTraceId(traceId: string) {
    const [metrics, logs, events, traces] = await Promise.all([
      this.metricRepo.find({
        where: { traceId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
      this.logRepo.find({
        where: { traceId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
      this.eventRepo.find({
        where: { traceId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
      this.traceRepo.find({
        where: { traceId },
        order: { timestamp: 'DESC' },
        take: 200,
      }),
    ]);

    return {
      summary: {
        traceId,
        metrics: metrics.length,
        logs: logs.length,
        events: events.length,
        traces: traces.length,
      },
      metrics,
      logs,
      events,
      traces,
    };
  }
}
