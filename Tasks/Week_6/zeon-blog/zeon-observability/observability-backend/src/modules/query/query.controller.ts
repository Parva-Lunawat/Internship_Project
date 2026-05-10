import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import {
  EventsQueryDto,
  LogsQueryDto,
  MetricsAggregateQueryDto,
  TracesQueryDto,
} from './dto/query.dto';
import { QueryService } from './query.service';

const METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'] as const;
const DURATION_UNITS = ['all', 'minutes', 'hours', 'days'] as const;
const GROUP_BY = ['minute', 'hour', 'day'] as const;

@Controller({ version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  private parseIntBounded(
    value: unknown,
    field: string,
    min: number,
    max: number,
    fallback: number,
  ): number {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      throw new BadRequestException(`${field} must be an integer between ${min} and ${max}`);
    }
    return parsed;
  }

  private parseOptionalIso(value: unknown, field: string): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new BadRequestException(`${field} must be a valid ISO date-time`);
    }
    return value;
  }

  private parseOptionalEnum<T extends string>(
    value: unknown,
    field: string,
    allowed: readonly T[],
  ): T | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' || !allowed.includes(value as T)) {
      throw new BadRequestException(`${field} must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
  }

  private parseOptionalString(value: unknown, field: string, maxLen: number): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string') throw new BadRequestException(`${field} must be a string`);
    const trimmed = value.trim();
    if (trimmed.length > maxLen) throw new BadRequestException(`${field} must be at most ${maxLen} characters`);
    return trimmed;
  }

  private baseQuery(params: Record<string, unknown>) {
    return {
      from: this.parseOptionalIso(params.from, 'from'),
      to: this.parseOptionalIso(params.to, 'to'),
      endpoint: this.parseOptionalString(params.endpoint, 'endpoint', 255),
      method: this.parseOptionalEnum(params.method, 'method', METHODS),
      durationUnit: this.parseOptionalEnum(params.durationUnit, 'durationUnit', DURATION_UNITS) ?? 'all',
      durationValue: this.parseIntBounded(params.durationValue, 'durationValue', 1, 365, 1),
    };
  }

  private pageQuery(params: Record<string, unknown>) {
    return {
      ...this.baseQuery(params),
      page: this.parseIntBounded(params.page, 'page', 1, 1_000_000, 1),
      limit: this.parseIntBounded(params.limit, 'limit', 1, 200, 20),
      requestId: this.parseOptionalString(params.requestId, 'requestId', 128),
      traceId: this.parseOptionalString(params.traceId, 'traceId', 128),
      search: this.parseOptionalString(params.search, 'search', 255),
    };
  }

  @Get('metrics/aggregate')
  async aggregateMetrics(@Query() params: Record<string, unknown>) {
    const query: MetricsAggregateQueryDto = {
      ...this.baseQuery(params),
      groupBy: this.parseOptionalEnum(params.groupBy, 'groupBy', GROUP_BY) ?? 'hour',
    };
    return { data: await this.queryService.metricsAggregate(query) };
  }

  @Get('dashboard/summary')
  async dashboardSummary(@Query() params: Record<string, unknown>) {
    return { data: await this.queryService.dashboardSummary(this.baseQuery(params)) };
  }

  @Get('dashboard/recent-requests')
  async recentRequests(@Query() params: Record<string, unknown>) {
    return { data: await this.queryService.recentRequests(this.pageQuery(params)) };
  }

  @Get('dashboard/error-distribution')
  async errorDistribution(@Query() params: Record<string, unknown>) {
    return { data: await this.queryService.errorDistribution(this.baseQuery(params)) };
  }

  @Get('dashboard/latency-distribution')
  async latencyDistribution(@Query() params: Record<string, unknown>) {
    return { data: await this.queryService.latencyDistribution(this.baseQuery(params)) };
  }

  @Get('metrics/endpoints')
  async endpointMetrics(@Query() params: Record<string, unknown>) {
    return { data: await this.queryService.endpointMetrics(this.baseQuery(params)) };
  }

  @Get('endpoints')
  async knownRoutes(@Query() params: Record<string, unknown>) {
    return { data: await this.queryService.knownRoutes(this.baseQuery(params)) };
  }

  @Get('buckets')
  async buckets(@Query() params: Record<string, unknown>) {
    return {
      data: await this.queryService.requestBuckets({
        ...this.baseQuery(params),
        groupBy: this.parseOptionalEnum(params.groupBy, 'groupBy', GROUP_BY) ?? 'hour',
      }),
    };
  }

  @Get('buckets/requests')
  async bucketRequests(@Query() params: Record<string, unknown>) {
    return {
      data: await this.queryService.bucketRequests({
        ...this.baseQuery(params),
        bucketStart: this.parseOptionalIso(params.bucketStart, 'bucketStart'),
        bucketEnd: this.parseOptionalIso(params.bucketEnd, 'bucketEnd'),
      }),
    };
  }

  @Get('buckets/insights')
  async bucketInsights(@Query() params: Record<string, unknown>) {
    return {
      data: await this.queryService.bucketInsights({
        ...this.baseQuery(params),
        bucketStart: this.parseOptionalIso(params.bucketStart, 'bucketStart'),
        bucketEnd: this.parseOptionalIso(params.bucketEnd, 'bucketEnd'),
      }),
    };
  }

  @Get('issues')
  async issues(@Query() params: Record<string, unknown>) {
    const result = await this.queryService.issues(this.pageQuery(params));
    return { data: result.rows, meta: { total: result.total, page: result.page, limit: result.limit } };
  }

  @Get('issues/:fingerprint')
  async issueDetail(
    @Param('fingerprint') fingerprint: string,
    @Query() params: Record<string, unknown>,
  ) {
    const data = await this.queryService.issueDetail(fingerprint, this.pageQuery(params));
    if (!data) throw new NotFoundException('Issue not found');
    return { data };
  }

  @Get('service-map')
  async serviceMap() {
    return { data: await this.queryService.serviceMap() };
  }

  @Get('retention')
  async retention() {
    return { data: await this.queryService.retention() };
  }

  @Get('logs')
  async logs(@Query() params: Record<string, unknown>) {
    const query: LogsQueryDto = {
      ...this.pageQuery(params),
      level: this.parseOptionalEnum(params.level, 'level', ['debug', 'info', 'warn', 'error'] as const),
    };
    const result = await this.queryService.logs(query);
    return { data: result.rows, meta: { total: result.total, page: result.page, limit: result.limit } };
  }

  @Get('events')
  async events(@Query() params: Record<string, unknown>) {
    const query: EventsQueryDto = {
      ...this.pageQuery(params),
      eventType: this.parseOptionalString(params.eventType, 'eventType', 120),
      userId: this.parseOptionalString(params.userId, 'userId', 120),
    };
    const result = await this.queryService.events(query);
    return { data: result.rows, meta: { total: result.total, page: result.page, limit: result.limit } };
  }

  @Get('traces')
  async traces(@Query() params: Record<string, unknown>) {
    const query: TracesQueryDto = this.pageQuery(params);
    const result = await this.queryService.traces(query);
    return { data: result.rows, meta: { total: result.total, page: result.page, limit: result.limit } };
  }
}
