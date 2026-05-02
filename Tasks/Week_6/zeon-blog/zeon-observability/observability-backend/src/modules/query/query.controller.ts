import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import type {
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

  @Get('metrics/aggregate')
  async aggregateMetrics(@Query() query: MetricsAggregateQueryDto) {
    const data = await this.queryService.metricsAggregate(query);
    return { data };
  }

  @Get('logs')
  async logs(@Query() query: LogsQueryDto) {
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
  async events(@Query() query: EventsQueryDto) {
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
  async traces(@Query() query: TracesQueryDto) {
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
