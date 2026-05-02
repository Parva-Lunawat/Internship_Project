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

type MaybeRange = { from?: string; to?: string };

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

  private applyRange<T extends object>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    query: MaybeRange,
  ) {
    if (query.from) {
      qb.andWhere(`${alias}.timestamp >= :from`, { from: query.from });
    }
    if (query.to) {
      qb.andWhere(`${alias}.timestamp <= :to`, { to: query.to });
    }
  }

  async metricsAggregate(query: MetricsAggregateQueryDto) {
    const groupBy = query.groupBy || 'hour';
    const format =
      groupBy === 'minute'
        ? '%Y-%m-%d %H:%i'
        : groupBy === 'day'
          ? '%Y-%m-%d'
          : '%Y-%m-%d %H:00';

    const qb = this.metricRepo
      .createQueryBuilder('m')
      .select(`DATE_FORMAT(m.timestamp, '${format}')`, 'bucket')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(m.latencyMs)', 'avgLatencyMs')
      .addSelect('MIN(m.latencyMs)', 'minLatencyMs')
      .addSelect('MAX(m.latencyMs)', 'maxLatencyMs')
      .addSelect(
        'SUM(CASE WHEN m.statusCode >= 400 THEN 1 ELSE 0 END)',
        'errorCount',
      )
      .groupBy('bucket')
      .orderBy('bucket', 'ASC');

    this.applyRange(qb, 'm', query);
    if (query.endpoint) {
      qb.andWhere('m.endpoint = :endpoint', { endpoint: query.endpoint });
    }
    if (query.method) {
      qb.andWhere('m.method = :method', { method: query.method });
    }

    const rows = await qb.getRawMany<{
      bucket: string;
      count: string;
      avgLatencyMs: string;
      minLatencyMs: string;
      maxLatencyMs: string;
      errorCount: string;
    }>();

    return rows.map((row) => ({
      bucket: row.bucket,
      count: Number(row.count),
      avgLatencyMs: Number(row.avgLatencyMs),
      minLatencyMs: Number(row.minLatencyMs),
      maxLatencyMs: Number(row.maxLatencyMs),
      errorCount: Number(row.errorCount),
    }));
  }

  async logs(query: LogsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.logRepo.createQueryBuilder('l');

    this.applyRange(qb, 'l', query);
    if (query.level) qb.andWhere('l.logLevel = :level', { level: query.level });
    if (query.endpoint) {
      qb.andWhere('l.endpoint = :endpoint', { endpoint: query.endpoint });
    }
    if (query.requestId) {
      qb.andWhere('l.requestId = :requestId', { requestId: query.requestId });
    }
    if (query.traceId) {
      qb.andWhere('l.traceId = :traceId', { traceId: query.traceId });
    }

    qb.orderBy('l.timestamp', 'DESC').skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return {
      rows,
      total,
      page,
      limit,
    };
  }

  async events(query: EventsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.eventRepo.createQueryBuilder('e');

    this.applyRange(qb, 'e', query);
    if (query.eventType) {
      qb.andWhere('e.eventType = :eventType', { eventType: query.eventType });
    }
    if (query.userId) {
      qb.andWhere('e.userId = :userId', { userId: query.userId });
    }

    qb.orderBy('e.timestamp', 'DESC').skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return {
      rows,
      total,
      page,
      limit,
    };
  }

  async traces(query: TracesQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const qb = this.traceRepo.createQueryBuilder('t');

    this.applyRange(qb, 't', query);
    if (query.endpoint) {
      qb.andWhere('t.endpoint = :endpoint', { endpoint: query.endpoint });
    }
    if (query.requestId) {
      qb.andWhere('t.requestId = :requestId', { requestId: query.requestId });
    }
    if (query.traceId) {
      qb.andWhere('t.traceId = :traceId', { traceId: query.traceId });
    }

    qb.orderBy('t.timestamp', 'DESC').skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return {
      rows,
      total,
      page,
      limit,
    };
  }
}
