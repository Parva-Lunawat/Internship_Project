import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';

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

@Controller({ path: '', version: '1' })
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
      throw new BadRequestException(
        `${field} must be an integer between ${min} and ${max}`,
      );
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

  private parseOptionalString(
    value: unknown,
    field: string,
    maxLen: number,
  ): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length > maxLen) {
      throw new BadRequestException(`${field} must be at most ${maxLen} characters`);
    }
    return trimmed;
  }

  @Get('metrics/aggregate')
  async aggregateMetrics(
    @Query('from') fromParam?: string,
    @Query('to') toParam?: string,
    @Query('endpoint') endpointParam?: string,
    @Query('method') methodParam?: string,
    @Query('groupBy') groupByParam?: string,
  ) {
    const query: MetricsAggregateQueryDto = {
      from: this.parseOptionalIso(fromParam, 'from'),
      to: this.parseOptionalIso(toParam, 'to'),
      endpoint: this.parseOptionalString(endpointParam, 'endpoint', 255),
      method: this.parseOptionalEnum(
        methodParam,
        'method',
        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'] as const,
      ),
      groupBy:
        this.parseOptionalEnum(groupByParam, 'groupBy', [
          'minute',
          'hour',
          'day',
        ] as const) ?? 'hour',
    };
    const data = await this.queryService.metricsAggregate(query);
    return { data };
  }

  @Get('logs')
  async logs(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('from') fromParam?: string,
    @Query('to') toParam?: string,
    @Query('level') levelParam?: string,
    @Query('endpoint') endpointParam?: string,
    @Query('requestId') requestIdParam?: string,
    @Query('traceId') traceIdParam?: string,
  ) {
    const query: LogsQueryDto = {
      page: this.parseIntBounded(pageParam, 'page', 1, 1_000_000, 1),
      limit: this.parseIntBounded(limitParam, 'limit', 1, 200, 20),
      from: this.parseOptionalIso(fromParam, 'from'),
      to: this.parseOptionalIso(toParam, 'to'),
      level: this.parseOptionalEnum(levelParam, 'level', [
        'debug',
        'info',
        'warn',
        'error',
      ] as const),
      endpoint: this.parseOptionalString(endpointParam, 'endpoint', 255),
      requestId: this.parseOptionalString(requestIdParam, 'requestId', 128),
      traceId: this.parseOptionalString(traceIdParam, 'traceId', 128),
    };
    const result = await this.queryService.logs(query);
    return {
      data: result.rows,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get('events')
  async events(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('from') fromParam?: string,
    @Query('to') toParam?: string,
    @Query('eventType') eventTypeParam?: string,
    @Query('userId') userIdParam?: string,
  ) {
    const query: EventsQueryDto = {
      page: this.parseIntBounded(pageParam, 'page', 1, 1_000_000, 1),
      limit: this.parseIntBounded(limitParam, 'limit', 1, 200, 20),
      from: this.parseOptionalIso(fromParam, 'from'),
      to: this.parseOptionalIso(toParam, 'to'),
      eventType: this.parseOptionalString(eventTypeParam, 'eventType', 120),
      userId: this.parseOptionalString(userIdParam, 'userId', 120),
    };
    const result = await this.queryService.events(query);
    return {
      data: result.rows,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get('traces')
  async traces(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('from') fromParam?: string,
    @Query('to') toParam?: string,
    @Query('endpoint') endpointParam?: string,
    @Query('requestId') requestIdParam?: string,
    @Query('traceId') traceIdParam?: string,
  ) {
    const query: TracesQueryDto = {
      page: this.parseIntBounded(pageParam, 'page', 1, 1_000_000, 1),
      limit: this.parseIntBounded(limitParam, 'limit', 1, 200, 20),
      from: this.parseOptionalIso(fromParam, 'from'),
      to: this.parseOptionalIso(toParam, 'to'),
      endpoint: this.parseOptionalString(endpointParam, 'endpoint', 255),
      requestId: this.parseOptionalString(requestIdParam, 'requestId', 128),
      traceId: this.parseOptionalString(traceIdParam, 'traceId', 128),
    };
    const result = await this.queryService.traces(query);
    return {
      data: result.rows,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }
}
