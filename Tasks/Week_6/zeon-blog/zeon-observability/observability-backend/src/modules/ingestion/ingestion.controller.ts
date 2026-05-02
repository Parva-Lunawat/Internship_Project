import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import {
  EventsBatchDto,
  LogsBatchDto,
  MetricsBatchDto,
  TracesBatchDto,
} from '../telemetry/dto/ingest-batches.dto';
import { IngestionService } from './ingestion.service';

@Controller({
  path: 'ingest',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('service')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('metrics')
  ingestMetrics(@Body() body: MetricsBatchDto) {
    return {
      data: this.ingestionService.enqueueMetrics(body.items),
    };
  }

  @Post('logs')
  ingestLogs(@Body() body: LogsBatchDto) {
    return {
      data: this.ingestionService.enqueueLogs(body.items),
    };
  }

  @Post('events')
  ingestEvents(@Body() body: EventsBatchDto) {
    return {
      data: this.ingestionService.enqueueEvents(body.items),
    };
  }

  @Post('traces')
  ingestTraces(@Body() body: TracesBatchDto) {
    return {
      data: this.ingestionService.enqueueTraces(body.items),
    };
  }
}
